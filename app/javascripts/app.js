import "../stylesheets/app.css";
import "truffle-contract";

var PocketMoney;
var web3Provider;
var owner;
function ProvideWeb3(callback) {
    if (typeof web3 !== 'undefined') {
        web3Provider = web3.currentProvider;
    } else {
        web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    console.log("Web3 provided.");
    callback();
}

function getContractArtifacts() {
    $.getJSON('../../build/contracts/PocketMoney.json', function(data) {
        PocketMoney = TruffleContract(data);
        console.log("Artifacts collected.");
        PocketMoney.setProvider(web3Provider);
        console.log("Web3 instantiated for the dApp.");
        owner = web3.eth.coinbase;
    });
}

function fundContract() {
    var fundAmount = web3.toWei($("#amount").val(), "ether");
    console.log(fundAmount);
    PocketMoney.deployed().then(function(instance) {
        instance.fundContract({from: web3.eth.accounts[0], value: fundAmount});
    }).then(function() {
        console.log("Call successful.");
    });
}

function getMonthlyAllowance(_address) {
    PocketMoney.deployed().then(function(instance) {
        return instance.getMonthlyAllowance(_address);
    }).then(function(bool) {
        bool = bool/1000000000000000000;
        $("#allowance").text(bool + " ETH");
    });
}

function grantAccess() {
    var newAddress = $("#newaccess").val();
    var monthlyAllowance = web3.toWei($("#monthlyallowance").val());
    PocketMoney.deployed().then(function(instance){
        instance.grantAccess(newAddress, monthlyAllowance, {from: web3.eth.accounts[0]});
    });
}

function withdraw() {
    var withdrawAmount  = web3.toWei($("#withdrawamount").val());
    PocketMoney.deployed().then(function(instance) {
        instance.withdrawFunds(withdrawAmount, {from: web3.eth.accounts[0]});
    });
}

$(window).load(function() {
    ProvideWeb3(function() {
        getContractArtifacts();
    });
    $("#send").click(function() {
        fundContract();
    });
    $("#grantaccess").click(function() {
        grantAccess();
    });
    setInterval(function() {
        $("#walletaddress").text(web3.eth.accounts[0]);
        getMonthlyAllowance(web3.eth.accounts[0]); 
    }, 100);
    $("#withdraw").click(function() {
        withdraw();
    });
});