import 'web3-typed/callback/web3';
import * as Web3 from 'web3';
import { IContractInstance, ISimpleCallable, address, IContract, ITXResult } from './globals';
import { NumberLike } from 'bignumber.js';

interface IArtifacts {
  require(name: './ECRecoverTest.sol'): IContract<IECRecoverTest>;

  require(name: './Migrations.sol'): IContract<IContractInstance>;
}

declare global {
  const artifacts: IArtifacts;
}

interface IECRecoverTest extends IContractInstance {

  test(v: BigNumber.NumberLike, r: BigNumber.NumberLike, s: BigNumber.NumberLike, user: address, owner: address,
          tr?: Web3.TransactionRequest): Promise<ITXResult>;

  recover(v: BigNumber.NumberLike, r: BigNumber.NumberLike, s: BigNumber.NumberLike, user: address,
          tr?: Web3.TransactionRequest): Promise<address>;

  hash(user: address, tr?: Web3.TransactionRequest): Promise<BigNumber.NumberLike>;

  encode(user: address, tr?: Web3.TransactionRequest): Promise<BigNumber.NumberLike>;

}
