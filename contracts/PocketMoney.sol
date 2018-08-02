pragma solidity ^0.4.24;

import "./Ownable.sol";

contract PocketMoney is Ownable {

    mapping (address => bool) private accessList;
    mapping (address => uint) private lastWithdrawal;
    mapping (address => uint) private monthlyAllowance;

    event contractFunded (address _address, uint fund_amount);
    event fundsWithdrawn (address _address, uint _amount);

    constructor () public {
        owner = msg.sender;
        accessList[owner] = true;
    }

    function getContractCaller() external view returns (address) {
        return msg.sender;
    }

    function hasAccess(address _address) external view returns (bool) {
        return accessList[_address];
    }

    function getMonthlyAllowance(address _address) external view returns (uint) {
        return monthlyAllowance[_address];
    }

    function fundContract() external onlyOwner payable {
        uint amount_funded = msg.value;
        monthlyAllowance[owner] = address(this).balance;
        emit contractFunded (owner, amount_funded);
    }

    function withdrawFunds(uint amount) external checkAccess {
        require (address(this).balance >= amount);
        address messenger = msg.sender;
        if (messenger == owner) {
            owner.transfer(amount);
            monthlyAllowance[owner] = address(this).balance;
            emit fundsWithdrawn (messenger, amount);
            return;
        }
        require (amount == monthlyAllowance[messenger] && now >= lastWithdrawal[messenger] + 30 days);
        messenger.transfer(amount);
        monthlyAllowance[owner] = address(this).balance;
        emit fundsWithdrawn(messenger, amount);
        lastWithdrawal[messenger] = now;
    }

    function grantAccess (address _address, uint _monthlyAllowance) external onlyOwner {
        accessList[_address] = true;
        monthlyAllowance[_address] = _monthlyAllowance;
        lastWithdrawal[_address] = now - 30 days;
    }

    function removeAccess (address _address) external onlyOwner {
        accessList[_address] = false;
    }

    function changeMonthlyAllowance (address _address, uint _amount) external onlyOwner {
        require(accessList[_address] == true);
        monthlyAllowance[_address] = _amount; 
    }

    modifier checkAccess() {
        require (accessList[msg.sender] == true);
        _;
    }

}