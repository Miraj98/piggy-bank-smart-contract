var PocketMoney = artifacts.require("PocketMoney");
var Ownable = artifacts.require("Ownable");

module.exports = function(deployer) {
    deployer.deploy(PocketMoney);
    deployer.deploy(Ownable);
  };