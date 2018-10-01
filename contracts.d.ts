import 'web3-typed/callback/web3';
import * as Web3 from 'web3';
import {IContractInstance, address, IContract, ITXResult} from './globals';

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

  prefixedTest(v: BigNumber.NumberLike, r: BigNumber.NumberLike, s: BigNumber.NumberLike, user: address, owner: address,
               tr?: Web3.TransactionRequest): Promise<ITXResult>;

  prefixedRecover(v: BigNumber.NumberLike, r: BigNumber.NumberLike, s: BigNumber.NumberLike, user: address,
                  tr?: Web3.TransactionRequest): Promise<address>;

  recover(v: BigNumber.NumberLike, r: BigNumber.NumberLike, s: BigNumber.NumberLike, user: address,
          tr?: Web3.TransactionRequest): Promise<address>;

  prefixedHash(user: address, tr?: Web3.TransactionRequest): Promise<BigNumber.NumberLike>;

  prefixedEncode(user: address, tr?: Web3.TransactionRequest): Promise<BigNumber.NumberLike>;

  hash(user: address, tr?: Web3.TransactionRequest): Promise<BigNumber.NumberLike>;

  encode(user: address, tr?: Web3.TransactionRequest): Promise<BigNumber.NumberLike>;

}
