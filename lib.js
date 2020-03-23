const {
    Client, FileCreateTransaction, ContractCreateTransaction, Hbar, Ed25519PrivateKey,
    ContractFunctionParams, ContractCallQuery, ContractExecuteTransaction, BadKeyError_1
} = require("@hashgraph/sdk");
const fs = require('fs');
const BigNumber = require("bignumber.js");

const MXContractId = "0.0.192461";
const TestUsers = "0.0.192457";
const TestCredit = "0.0.192463";

//@@TODO SHOULD HANDLE WRONG ACCOUNT/PR-KEY
exports.createHederaClient = (accountID, privateKey) => {
    try {
        const prKey = Ed25519PrivateKey.fromString(privateKey);
        
        const client = new Client({
            network: {"0.testnet.hedera.com:50211": "0.0.3"},
            operator: {
                account: accountID,
                privateKey: prKey
            }
        });
        return client;
    } catch(e) {
        console.log(e);
        let err = [e, "ERROR"]
        return(err);
    }
}

/*
exports.createHederaClient = (accountID, privateKey) => {
    const client = new Client({
        network: {"0.testnet.hedera.com:50211": "0.0.3"},
        operator: {
            account: accountID,
            privateKey: privateKey
        }
    });
    return client;
}*/

exports.callContract = async (contractId, functionName, params, hederaClient) => {
    let callResult = await new ContractCallQuery()
    .setContractId(contractId)
    .setGas(10000) 
    .setFunction(functionName, params)
    .execute(hederaClient);

    console.log("call gas used:", callResult.gasUsed);
    return callResult;
}

exports.callContractNoArgs = async (contractId, functionName, hederaClient) => {
    let callResult = await new ContractCallQuery()
    .setContractId(contractId)
    .setGas(10000) 
    .setFunction(functionName)
    .execute(hederaClient);

    console.log("call gas used:", callResult.gasUsed);
    return callResult;
}

exports.sendContract = async (contractId, functionName, params, hederaClient) => {
    const getRec = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setMaxTransactionFee(new Hbar(10))
        .setGas(1000000) 
        .setFunction(functionName, params)
        .execute(hederaClient);

    var result = await getRec.getRecord(hederaClient);
    return result;
}

exports.sendContractPayable = async (contractId, toPay, functionName, params, hederaClient) => {
    const getRec = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setMaxTransactionFee(new Hbar(10))
        .setGas(1000000) 
        .setPayableAmount(toPay)
        .setFunction(functionName, params)
        .execute(hederaClient);

    var result = await getRec.getRecord(hederaClient);
    return result;
}

exports.solidityAddress = (address) => {
    let len = address.toString(16).length;
    let zeroCount = 40 - len;
    let zeros = "0x";
    for(let i = 0; i < zeroCount; i++) {
        zeros += "0";
    }
    let hexAddress = zeros + address.toString(16);
    console.log("HEXADDRESS: " + hexAddress);
    return(hexAddress);
}

exports.accountNumber = (accountID) => {
    const account = accountID.slice(accountID.lastIndexOf(".") + 1);
    return account;
}

exports.sendFromContract = async (address, mx, client) => {
	console.log("Address: " + address);
	let faucetJson = fs.readFileSync('MX_hedera_faucet.json');
	let faucet = JSON.parse(faucetJson);

	let date = new Date();
	let last = 0;
	let addresses = Object.keys(faucet);

	for(i in addresses) {
		if(address == addresses[i]) {
			last = faucet[address];
		}
    }
    
    let account = this.accountNumber(address);
    let hexAddress = this.solidityAddress(parseInt(account));
    let sum = new BigNumber(5000);

    let params = new ContractFunctionParams()
    .addAddress(hexAddress)
    .addUint256(sum);
    console.log("HEX: " + hexAddress);
    console.log(sum + " type: " + typeof(sum));
	console.log('Last: ' + addresses + " " + last);

	if(last + 86400000 < date.getTime()) {
        this.sendContract(mx, "transferFromContract", params, client).then((res) => {
            faucet[address] = date.getTime();
				fs.writeFile('MX_hedera_faucet.json', JSON.stringify(faucet), function(err) {
                    if(err) throw err;
                    console.log("Write file")
                });
            console.log("Inside res: " + res);
            return(res);
        });
	} else {
		return('Already used your daily limit!');
	}
};


