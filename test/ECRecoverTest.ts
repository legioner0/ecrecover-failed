import {ItTestFn} from '../globals';
import * as BigNumber from 'bignumber.js';
import {IECRecoverTest} from '../contracts';
const EthUtil = require('ethereumjs-util');

const it = (<any>global).it as ItTestFn;
const assert = (<any>global).assert as Chai.AssertStatic;

const ECRecoverTest = artifacts.require('./ECRecoverTest.sol');

const PKEY: string = "57983e408e9a2cc43e5a9bf3285960bf0e79b1d06a667034d50e0a0ea01ef5dc";
const ADDR: string = '0x'+ EthUtil.pubToAddress(EthUtil.privateToPublic(Buffer.from(PKEY, 'hex'))).toString('hex');

contract('ECRecoverTest', function (accounts: string[]) {
  it('contract must be return correct values', async () => {
    const contract = await ECRecoverTest.deployed();

    let errors = 0;
    for (let i = 0; i < accounts.length; i++) {
      const user = accounts[i];

      const encoded = Buffer.from(user.replace(/^0x/, ''), 'hex');
      const hash = EthUtil.keccak(encoded);
      const prefixedHash = EthUtil.hashPersonalMessage(hash);
      const signature = EthUtil.ecsign(prefixedHash, Buffer.from(PKEY, 'hex'));
      const recovered = EthUtil.publicToAddress(EthUtil.ecrecover(prefixedHash, signature.v, signature.r, signature.s));

      const encodedContract = await contract.encode(user);
      const hashContract = await contract.hash(user);
      const prefixedHashContract = await contract.prefixedHash(user);
      const prefixedRecoveredContract = await contract.prefixedRecover(
          signature.v,
          '0x' + signature.r.toString('hex'),
          '0x' + signature.s.toString('hex'),
          user);
      const recoveredContract = await contract.recover(
          signature.v,
          '0x' + signature.r.toString('hex'),
          '0x' + signature.s.toString('hex'),
          user);

      if ('0x' + recovered.toString('hex') === prefixedRecoveredContract) {
        console.log(user + ' - correct recover');
      } else {
        errors++;
        console.log(user + ' - incorrect recover');
        console.log('\tencoded in  js: 0x' + encoded.toString('hex'));
        console.log('\tencoded in sol: ' + encodedContract);
        assert.equal('0x' + encoded.toString('hex'), encodedContract, 'encoded must be equals');
        console.log('\thash in  js: 0x' + hash.toString('hex'));
        console.log('\thash in sol: ' + hashContract);
        assert.equal('0x' + hash.toString('hex'), hashContract, 'hash must be equals');
        console.log('\tprefixedHash in  js: 0x' + prefixedHash.toString('hex'));
        console.log('\tprefixedHash in sol: ' + prefixedHashContract);
        assert.equal('0x' + prefixedHash.toString('hex'), prefixedHashContract, 'prefixedHash must be equals');
        console.log('\trecovered must be        : ' + ADDR);
        console.log('\trecovered in           js: 0x' + recovered.toString('hex'));
        console.log('\trecovered in          sol: ' + recoveredContract);
        console.log('\trecovered in prefixed sol: ' + prefixedRecoveredContract);
        assert.equal('0x' + recovered.toString('hex'), ADDR, 'recovered and ADDR must be equals');
      }
    }
    console.log(errors + ' errors of ' + accounts.length);
    assert.equal(errors, 0, 'must be zero');
  });

});
