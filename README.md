This is a simple test for ecrecover function
============================================

This project implementing sign data and it's check via smart contract.

`ECRecoverTest.sol` - simple contract with sign check logic: `ecrecover(keccak256(abi.encodePacked(address)), v, r, s)` and prefixed variant.

`ECRecoverTest.ts` - tests for `ecrecover`: compute `keccak256(address)`, sign with private key, try to recover 
it by `ecrecover` and compare values with corresponding return values of functions in contract.

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

