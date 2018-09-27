const ECRecoverTest = artifacts.require('./ECRecoverTest.sol');
export = function (deployer: any) {
  // Set unlimited synchronization timeout
  (<any>ECRecoverTest).constructor.synchronization_timeout = 0;
  deployer.deploy(ECRecoverTest);
};
