const lib = require("./lib");
const {Client, Ed25519PrivateKey, AccountCreateTransaction} = require("@hashgraph/sdk");
const BigNumber = require("bignumber.js");

const TestUsers = "0.0.168447";
const TestCredit = "0.0.169081";

const client = new Client({
    network: {"0.testnet.hedera.com:50211": "0.0.3"},
    operator: {
        account: "0.0.32593",
        privateKey: "302e020100300506032b657004220420b567e9ab212f88ef11cabfed7bdcbe18c679a3866ce9e7583c6589d6a4b8b41f"
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
