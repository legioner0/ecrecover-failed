This is a simple test for ecrecover function in solidity 0.4.24
===============================================================

There is problem with `ecrecover` - function returns incorrect value for some input data.

`ECRecoverTest.sol` - simple contract with sign check logic: `ecrecover(keccak256(abi.encodePacked(address)), v, r, s)`.

`ECRecoverTest.ts` - tests for `ecrecover`: compute `keccak256(address)`, sign with private key, try to recover 
it by `ecrecover` and compare values with correspondent return values of functions in contract.

As you can see some input data leads to error (11 of 100 for current `PKEY` and seeds) - value returned from `ecrecover`
in contract is not equals to `PKEY` owner.

Usage
-----
`npm install && npm run test`