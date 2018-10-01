global.Promise = require('bluebird');
import Ajv = require('ajv');
import fs = require('fs');
import net = require('net');
import path = require('path');
import {Strings} from './lib/strings';
import * as Web3 from 'web3';
import {address, IContract} from './globals';
import {IECRecoverTest} from './contracts';
import {ICliConfig} from './cli.schema';
import readline = require('readline');
import * as BigNumber from 'bignumber.js';

const EthUtil = require('ethereumjs-util');
const addresses = require('./addresses.json');

type ContractName = 'ECRecoverTest';

const ctx = {
  contractNames: ['ECRecoverTest'],
  cmdOpts: new Array<string>(),
  verbose: false,
  cfile: 'cli.yml',
  ECRecoverTest: {}
} as {
  contractNames: string[];
  cmd: string;
  cmdOpts: string[];
  cfile: string;
  cfg: ICliConfig;
  verbose: boolean;
  web3: Web3;
  provider: Web3.providers.Provider;
  ECRecoverTest: {
    meta: IContract<IECRecoverTest>;
    instance: IECRecoverTest;
  };
};

const rl = readline.createInterface({
                                      input: process.stdin,
                                      output: process.stdout
                                    });

const handlers = {} as {
  [k: string]: () => Promise<void>;
};

async function setup() {
  const TruffleContract = require('truffle-contract');
  loadConfig(ctx.cfile);
  await setupWeb3();
  await loadDeployedContracts();

  async function loadDeployedContracts() {
    const ecfg = ctx.cfg.ethereum;
    const w3defaults = {
      from: ecfg.from,
      gas: ecfg.gas,
      gasPrice: ecfg.gasPrice
    };
    return Promise.mapSeries(ctx.contractNames, async cn => {
      if (!ecfg[cn]) {
        return;
      }
      const c = ctx as any;
      c[cn].meta = TruffleContract(JSON.parse(fs.readFileSync(ecfg[cn].schema).toString()));
      c[cn].meta.setProvider(ctx.web3.currentProvider);
      c[cn].meta.defaults(w3defaults);
      c[cn].meta.synchronization_timeout = 0;
      const addr = readDeployedContractAddress(cn);
      if (addr) {
        c[cn].instance = await c[cn].meta.at(addr);
        console.log(`Loaded ${cn} instance at: ${addr}`);
      }
    });
  }

  async function setupWeb3() {
    const ecfg = ctx.cfg.ethereum;
    const endpoint = ecfg.endpoint.trim();
    if (endpoint.startsWith('ipc://')) {
      console.log(`Using Web3.providers.IpcProvider for ${endpoint}`);
      ctx.provider = new Web3.providers.IpcProvider(endpoint.substring('ipc://'.length), net);
    } else if (endpoint.startsWith('http')) {
      console.log(`Using Web3.providers.HttpProvider provider for: ${endpoint}`);
      ctx.provider = new Web3.providers.HttpProvider(endpoint);
    } else {
      throw new Error(`Unknown web3 endpoint: '${endpoint}'`);
    }
    ctx.web3 = new Web3(ctx.provider);
    await Promise.fromNode(cb => {
      ctx.web3.version.getNode((err, node) => {
        if (err) {
          cb(err);
          return;
        }
        console.log(`web3 node: ${node}`);
        cb(err, node);
      });
    });
    await Promise.fromNode(cb => {
      ctx.web3.version.getNetwork((err, netId) => {
        if (err) {
          cb(err);
          return;
        }
        switch (netId) {
          case '1':
            console.log('w3 connected to >>>> MAINNET <<<<');
            break;
          case '2':
            console.log('w3 connected to >>>> MORDEN <<<<');
            break;
          case '3':
            console.log('w3 connected to >>>> ROPSTEN <<<<');
            break;
          default:
            console.log('w3 connected to >>>> UNKNOWN <<<<');
        }
        cb(err, netId);
      });
    });
  }

  function loadConfig(cpath: string) {
    const ajv = new Ajv();
    const configSchema = require('./cli.schema.json');
    const yaml = require('js-yaml');
    const subst = {
      home: process.env['HOME'],
      cwd: process.cwd(),
      moduledir: __dirname
    };
    ctx.cfg = yaml.safeLoad(Strings.replaceTemplate(fs.readFileSync(cpath, 'utf8'), subst));
    if (!ajv.validate(configSchema, ctx.cfg)) {
      const msg = `env: Invalid configuration: ${cpath}: `;
      console.error(msg, ajv.errors);
      throw new Error(`Invalid configuration: ${cpath}`);
    }
    if (ctx.verbose) {
      console.log('Configuration ', JSON.stringify(ctx.cfg, null, 2));
    }
  }
}

function readDeployedContractAddress(contract: string): string | null {
  const p = path.join(ctx.cfg.ethereum.lockfilesDir, `${contract}.lock`);
  if (fs.existsSync(p)) {
    return fs.readFileSync(p).toString('utf8');
  } else {
    return null;
  }
}

function writeDeployedContractAddress(contract: string, addr: address) {
  const p = path.join(ctx.cfg.ethereum.lockfilesDir, `${contract}.lock`);
  fs.writeFileSync(p, addr);
}

function failIfDeployed(cname?: ContractName) {
  const c = ctx as any;
  if (cname) {
    if (c[cname].instance) {
      throw new Error(`Contract '${cname}' is already deployed`);
    }
  } else {
    ctx.contractNames.forEach(cn => failIfDeployed(cn as any));
  }
}

function failIfNotDeployed(cname?: ContractName) {
  const c = ctx as any;
  if (cname) {
    if (!c[cname].instance) {
      throw new Error(`Contract '${cname}' is not deployed`);
    }
  } else {
    ctx.contractNames.forEach(cn => failIfNotDeployed(cn as any));
  }
}

function checkEthNetwork(): Promise<void> {
  return new Promise((resolve, reject) => {
    // try synchronous call
    let syncing: boolean | Web3.SyncingResult;
    try {
      syncing = ctx.web3.eth.syncing;
    } catch (err) {
      // async request
      ctx.web3.eth.getSyncing((err: any, sync: boolean | Web3.SyncingResult) => {
        if (err) {
          reject(err);
          return;
        }
        if (sync) {
          reject('Ethereum network client in pending synchronization, try again later');
        } else {
          resolve();
        }
      });
      return;
    }
    if (syncing) {
      reject('Ethereum network client in pending synchronization, try again later');
      return;
    }
    resolve();
  });
}

// -------------------- Operations

/**
 * Deploy
 */
handlers['deploy'] = async () => {
  await checkEthNetwork();
  if (!ctx.ECRecoverTest.instance) {
    const icfg = ctx.cfg.ethereum.ECRecoverTest;
    console.log(`Deployment: 'ECRecoverTest' `, icfg);
    ctx.ECRecoverTest.instance = await ctx.ECRecoverTest.meta.new({from: ctx.cfg.ethereum.from});
    console.log(`ECRecoverTest successfully deployed at: ${ctx.ECRecoverTest.instance.address}\n\n`);
    writeDeployedContractAddress('ECRecoverTest', ctx.ECRecoverTest.instance.address);
  }
};

/**
 * test
 */
handlers['test'] = async () => {
  await checkEthNetwork();
  failIfNotDeployed('ECRecoverTest');
  const contract = ctx.ECRecoverTest.instance;

  const ADDR: string = '0x' + EthUtil.pubToAddress(EthUtil.privateToPublic(Buffer.from(ctx.cfg.ethereum.pkey, 'hex')))
      .toString('hex');
  for (let i = 0; i < addresses.length; i++) {
    const user = addresses[i];

    const encoded = Buffer.from(user.replace(/^0x/, ''), 'hex');
    const hash = EthUtil.keccak(encoded);
    const prefixedHash = EthUtil.hashPersonalMessage(hash);
    const signature = EthUtil.ecsign(prefixedHash, Buffer.from(ctx.cfg.ethereum.pkey, 'hex'));
    const recovered = EthUtil.publicToAddress(EthUtil.ecrecover(prefixedHash, signature.v, signature.r, signature.s));

    const encodedContract = await contract.encode(user, {from: ctx.cfg.ethereum.from});
    const hashContract = await contract.hash(user, {from: ctx.cfg.ethereum.from});
    const prefixedHashContract = await contract.prefixedHash(user);
    const prefixedRecoveredContract = await contract.prefixedRecover(
        signature.v,
        new BigNumber(signature.r.toString('hex'), 16),
        new BigNumber(signature.s.toString('hex'), 16),
        user, {from: ctx.cfg.ethereum.from});
    const recoveredContract = await contract.recover(
        signature.v,
        new BigNumber(signature.r.toString('hex'), 16),
        new BigNumber(signature.s.toString('hex'), 16),
        user);

    if ('0x' + recovered.toString('hex') === prefixedRecoveredContract) {
      console.log(user + ' - correct recover');
    } else {
      console.log(user + ' - incorrect recover');
      console.log('\tencoded in  js: 0x' + encoded.toString('hex'));
      console.log('\tencoded in sol: ' + encodedContract);
      console.log('\thash in  js: 0x' + hash.toString('hex'));
      console.log('\thash in sol: ' + hashContract);
      console.log('\tprefixedHash in  js: 0x' + prefixedHash.toString('hex'));
      console.log('\tprefixedHash in sol: ' + prefixedHashContract);
      console.log('\trecovered must be        : ' + ADDR);
      console.log('\trecovered in           js: 0x' + recovered.toString('hex'));
      console.log('\trecovered in          sol: ' + recoveredContract);
      console.log('\trecovered in prefixed sol: ' + prefixedRecoveredContract);
      console.log('signature:', signature.v, signature.r.toString('hex'), signature.s.toString('hex'));
    }
    try {
      await contract.prefixedTest(signature.v,
                                  new BigNumber(signature.r.toString('hex'), 16),
                                  new BigNumber(signature.s.toString('hex'), 16),
                                  user, ADDR, {from: ctx.cfg.ethereum.from});
    } catch (error) {
      // ignore errors
      console.log(error);
    }

  }
};

// --------------------- Helpers

function pullCmdArg(name: string): address {
  const arg = ctx.cmdOpts.shift();
  if (!arg) {
    throw new Error(`Missing required ${name} argument for command`);
  }
  return arg;
}

// -------------------- Run

// Parse options
(function () {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; ++i) {
    const av = (args[i] = args[i].trim());
    if (av.charAt(0) !== '-') {
      if (ctx.cmd) {
        usage(`Command '${ctx.cmd}' already specified`);
      }
      ctx.cmd = av;
      ctx.cmdOpts = args.slice(i + 1);
      break;
    }
    if (av === '-h' || av === '--help') {
      usage();
    }
    if (av === '-v' || av === '--verbose') {
      ctx.verbose = true;
    }
    if (av === '-c' || av === '--config') {
      ctx.cfile = args[++i] || usage(`Missing '-c|--config' option value`);
    }
  }
  if (!ctx.cmd) {
    usage('No command specified');
  }
  if (!handlers[ctx.cmd]) {
    usage(`Invalid command specified: '${ctx.cmd}'`);
  }
  console.log(`Command: ${ctx.cmd} opts: `, ctx.cmdOpts);
})();

function usage(error?: string): never {
  console.error(
      'Usage: \n\tnode cli.js' +
      '\n\t[-c|--config <config yaml file>]' +
      '\n\t[-v|--verbose]' +
      '\n\t[-h|--help]' +
      '\n\t<command> [command options]' +
      '\nCommands:' +
      '\n\tdeploy                                - Deploy smart contract' +
      '\n\ttest                                  - Test smart contract with addresses from addresses.json' +
      '\n'
  );
  if (error) {
    console.error(error);
    process.exit(1);
  }
  process.exit();
  throw Error();
}

// Start
setup()
    .then(handlers[ctx.cmd])
    .then(() => {
      process.exit(0);
    })
    .catch(err => {
      if (err) {
        console.error(err);
      }
      process.exit(1);
    });
