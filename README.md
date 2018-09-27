This is a simple test for ecrecover function in solidity 0.4.24 and 0.4.25
==========================================================================

There is problem with `ecrecover` - function returns incorrect value for some input data.

`ECRecoverTest.sol` - simple contract with sign check logic: `ecrecover(keccak256(abi.encodePacked(address)), v, r, s)`.

`ECRecoverTest.ts` - tests for `ecrecover`: compute `keccak256(address)`, sign with private key, try to recover 
it by `ecrecover` and compare values with corresponding return values of functions in contract.

As you can see some input data leads to error (11 of 100 for current `PKEY` and seeds) - value returned from `ecrecover`
in contract is not equals to `PKEY` owner.

Usage
-----

* `npm install` - install requirements
* `npm run build` - typescript and smart contract compilation
* `npm run test` - automated test with ganache

Manual deploy and test
----------------------

`cp cli-ganache.yml cli.yml; nano cli.yml` - use `cli-ganache.yml` as example and make you own configuration in file `cli.yml`

Default values from `cli-ganache.yml` can be used with ganache node started via `./run-ganache-test.sh`

`node ./cli.js deploy` - Deploy contract to ethereum network (configuration in `cli.yml`)
`node ./cli.js test` - Run test with deployed contract: take addresses one-by-one from `addresses.json` and try to check abi.encodePacked/keccak256/ecrecover in js and in contract and finaly call method `test` in contract.

If you want to re-deploy contract, don't forget to delete file `ECRecoverTest.lock`

https://ropsten.etherscan.io/address/0x4e146f2a85f51d73aa56cf84b1879e1c2fb056d5 - Here is deployed contract on ropsten. It was deployed with default values from this project.
First transaction - is correct ecrecover result, second transaction - is incorrect.
