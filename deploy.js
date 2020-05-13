const {
    Client, FileCreateTransaction, FileAppendTransaction, ContractCreateTransaction, Hbar, Ed25519PrivateKey,
    ContractFunctionParams, ContractCallQuery, ContractExecuteTransaction, BadKeyError_1
} = require("@hashgraph/sdk");
const fs = require('fs');
const BigNumber = require("bignumber.js");
let args = process.argv;

const client = new Client({
    network: {"1.testnet.hedera.com:50211": "0.0.4"},
    operator: {
        account: { shard: 0, real: 0, account: 23538},
        privateKey: "..."
    },
});

const size = 2500;
const smartContract = require("./sm0508/credit.json");

const smartContractByteCode = smartContract.object;
console.log("contract bytecode size:", smartContractByteCode.length, "bytes");

const rounds = parseInt(smartContractByteCode.length / size);

let byteCode = rounds < 1 ? smartContractByteCode : smartContractByteCode.substr(0, size);
console.log(client._operatorPublicKey);
console.log("contract bytecode size:", byteCode.length, "bytes");
let fileID;

let append = async (newFileId, byteCode, client) => {
    let fileAppend = new FileAppendTransaction()
    .setMaxTransactionFee(new Hbar(10))
    .setFileId(newFileId)
    .setContents(byteCode)
    .execute(client);

    console.log(await fileAppend);
}

// First we must upload a file containing the byte code
(async () => {
    const byteCodeFileId = (await (await new FileCreateTransaction()
    .setMaxTransactionFee(new Hbar(10))
    .addKey(client._operatorPublicKey)
    .setContents(byteCode)
    .execute(client))
    .getReceipt(client))
    .getFileId();

    console.log("contract bytecode file:", byteCodeFileId.toString());
    fileID = byteCodeFileId.toString();

    let roundCounter = 1;
    if(rounds > 0) {
        let currentByteCode;
        let content = (roundCounter) => {
            let firstIndex = roundCounter * size;
            let lastIndex = firstIndex + size;
            if(lastIndex > smartContractByteCode.length) lastIndex = smartContractByteCode.length;
    
            currentByteCode = smartContractByteCode.substr(firstIndex, size);
            console.log(fileID, currentByteCode.length);
        }

        let nextRound = (roundCounter) => {
            console.log("ROUNDS: " + roundCounter);
            content(roundCounter);
            append(fileID, currentByteCode, client).catch(console.log).then((r) => {
                if(roundCounter < rounds) {
                    roundCounter ++;
                    nextRound(roundCounter);
                } else {
                    (async () => {
                        const record = await (await new ContractCreateTransaction()
                        .setMaxTransactionFee(new Hbar(100))
                        // Failing to set this to an adequate amount
                        // INSUFFICIENT_GAS
                        .setGas(200000) // ~1260
                        // Failing to set parameters when parameters are required
                        // CONTRACT_REVERT_EXECUTED
                        .setBytecodeFileId(fileID)
                        .execute(client))
                        .getRecord(client);

                        const newContractId = record.receipt.getContractId();

                        console.log("contract create gas used:", record.getContractCreateResult().gasUsed);
                        console.log("contract create transaction fee:", record.transactionFee.asTinybar());
                        console.log("contract:", newContractId.toString());
                    })();
                }
            });
        }

        nextRound(roundCounter);
    }
})();
