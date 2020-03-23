const {Client, Ed25519PrivateKey, AccountCreateTransaction} = require("@hashgraph/sdk");
const BigNumber = require("bignumber.js");

const client = new Client({
    network: {"0.testnet.hedera.com:50211": "0.0.3"},
    operator: {
        account: "...",
        privateKey: "..."
    }
});

(async () => {
    const privateKey = await Ed25519PrivateKey.generate();

    console.log("private =", privateKey);
    console.log("public =", privateKey.publicKey);

    const transactionId = await new AccountCreateTransaction()
        .setKey(privateKey.publicKey)
        .setInitialBalance(10000000000)
        .execute(client);

    const transactionReceipt = await transactionId.getReceipt(client);

    console.log("receipt =", transactionReceipt);

    const newAccountId = transactionReceipt.getAccountId();

    console.log("accountId =", newAccountId);
})();
