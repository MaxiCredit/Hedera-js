//@@TODO use catch() before then()
require("dotenv").config();

const {
    Client, FileCreateTransaction, ContractCreateTransaction, Hbar, Ed25519PrivateKey,
    ContractFunctionParams, ContractCallQuery, ContractExecuteTransaction, CryptoTransferTransaction, AccountBalanceQuery
} = require("@hashgraph/sdk");
var fs = require('fs');
const StringDecoder = require('string_decoder').StringDecoder;
const BigNumber = require("bignumber.js");
const lib = require('./lib');
const rp = require('request-promise');
const apiKey = "369621eb-bfde-317d-8fe4-fa3f9743c2f7";
const ethTX = require('./set-eth-tx');
require("dotenv").config();
const paypal = require('@paypal/checkout-server-sdk');
//console.log(paypal);
let clientId = "AVt5Iuf9ZjOPigO_sGzNs0y7pqvYlLVP03rp-Wa7zKdEsXyCjndUFj9Xn-kP1sTxP1hUN9lQDAWmJYo5"; 
let clientSecret = "EHpwvH3AIGct-fBkj1JzqicaTjezBiPsMXkB5DY-gvsLdgzuTvn9MDFrpd1AnKx2i9oUs61o88P-iSk-"; 
// This sample uses SandboxEnvironment. In production, use LiveEnvironment
let environment = new paypal.core.SandboxEnvironment(clientId, clientSecret); // LiveEnvironment(clientId, clientSecret)
let paypalClient = new paypal.core.PayPalHttpClient(environment);

const requestOptions = {
    method: 'GET',
    uri: 'https://api.coingecko.com/api/v3/simple/price?ids=hedera-hashgraph%2Cbitcoin&vs_currencies=usd'
};

const dragonglassRequestEvents = {
	method: 'GET',
	uri: 'https://api-testnet.dragonglass.me/hedera/api/contracts/0.0.73154/calls?contractMethodName=519acb87',
	headers: { 'x-api-key': apiKey },
	json: true,
	gzip: true
}

const dexAbiJson = fs.readFileSync("mxx_eth.abi");
const dexAbi = JSON.parse(dexAbiJson);
const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.WebsocketProvider("wss://ropsten.infura.io/ws/v3/..."));
const changeFromETH = new web3.eth.Contract(dexAbi, '0x17070EdD831C8BE6CC6f49A429d37134D7Dfb745');
const ethAddr = "0xbA85271E915c385fe37bEDeC7Be046259885801b";
const ethPrKey = Buffer.from("...", "hex");


var express = require('express');
var router = express.Router();
const MXContractId = "0.0.28999";
const TestUsers = "0.0.96168";
const TestCredit = "0.0.96171";
const MXx = "0.0.73154";
const mxOwner = "0.0." + process.env.ACCOUNT_ID;
const ownerPrKey = process.env.PRIVATE_KEY;
console.log(mxOwner);
let hbarPrice = 0;
let usdPrice = 0;
let dailyBasePrice = 0;

getHbarPrice();

router.get('/', function(req, res){
    res.render('test2', {
        page : "main"
    });
});

router.get('/admin', function(req, res) {
    res.render('admin');
});

router.get('/dex', function(req, res) {
    res.render('dex');
});

router.get('/reg', function(req, res) {
    res.render('reg_dev');
});

router.get('/api', function(req, res) {
    res.render('api');
});

router.post('/client', (req, res) => {
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();
        clientData = buffer.split('&');
        if(clientData[0] && clientData[1]) {
            let privateKey = clientData[0].slice(clientData[0].indexOf('=') + 1);
            let accountID = clientData[1].slice(clientData[1].indexOf('=') + 1);

            const client = lib.createHederaClient(accountID, privateKey);
            if(client[1] != "ERROR" && privateKey != "" && accountID != "") {
                let httpRes = 0;
                let accountNumber = lib.accountNumber(accountID);
                console.log(accountNumber);
                let address = lib.solidityAddress(parseInt(accountNumber));
                console.log(address);
                let params = new ContractFunctionParams().addAddress(address);
                let response = {
                    hbarBalance : 0,
                    mxBalance: 0,
                    registration: "You are not registered!",
                    hbarPrice: hbarPrice
                }
                lib.getBalance(client, accountNumber).catch((e) => {
                    console.log("CLIENT CATCH at getAccountBalance: " + e);
                    res.send("ERROR, at getAccountBalance: " + e);
                    httpRes = 1;
                }).then((result) => {
                    if(httpRes == 0) {
                        let hbarBalance = result.toString();
                        response.hbarBalance = hbarBalance;
                        //console.log("GET MX balance", hbarBalance);
                        lib.callContract(MXContractId, "balanceOf", params, client).catch((err) => {
                            console.log("CLIENT CATCH at get MX balance: " + err);
                            if(httpRes == 0) res.send("ERROR, at get MX balance: " + err);
                            httpRes = 2;
                        }).then((r) => {
                            //console.log(r.getUint256(0).toString());
                            let mxBalance = r.getUint256(0).toString();
                            response.mxBalance = mxBalance;
                            if(httpRes == 0) {
                                lib.callContract(TestUsers, "checkUsersAddress", params, client).catch((er) => {
                                    console.log("CLIENT CATCH at isUserByAddress: " + er);
                                    if(httpRes == 0) res.send("ERROR, at checkUsersAddress: " + er);
                                    httpRes = 5;
                                }).then((result1) => {
                                    
                                    let isUser = result1.getBool(0);
                                    console.log("Is user: " + isUser);
                                    if(!isUser) {
                                        if(httpRes == 0) res.send(JSON.stringify(response));
                                        httpRes = 7;
                                        console.log("RES: " + httpRes);
                                    }
                                    if(httpRes == 0 && isUser) {
                                        lib.callContract(TestUsers, "getUserByAddress", params, client).catch((error) => {
                                            console.log("CLIENT CATCH at getUserByAddress: " + error);
                                            if(httpRes == 0) res.send("ERROR, at client  getUserByAddress: " + error);
                                            httpRes = 3;
                                        }).then((resu) => {
                                            console.log("RES: " + httpRes);
                                            let userId = resu.getInt256(0);
                                            let params1 = new ContractFunctionParams()
                                                .addUint256(userId);
                                            lib.callContract(TestUsers, "getUserPublicData", params1, client).catch((erro) => {
                                                console.log("CLIENT CATCH at getUserPublicData: " + erro);
                                                if(httpRes == 0) res.send("ERRO, at client getUserPublicData: " + erro);
                                                httpRes = 4;
                                            }).then((resul) => {
                                                let scoreFromSC = resul.getUint256(0).toString();
                                                let scoreToUI = parseInt(scoreFromSC) > 0 ? scoreFromSC : "You are not verified yet!"; 
                                                response.registration = scoreToUI;
                                                //create object for res.send
                                                console.log(hbarPrice);
                                                if(httpRes == 0) res.send(JSON.stringify(response));
                                                httpRes = 6;
                                            });
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                res.send("ERROR");
            }
        } else {
            res.send("ERROR, missing arguments");
        }
    });
});

router.post('/sendHbar', (req, res) => {
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();
        clientData = buffer.split('&');
        let privateKey = clientData[0].slice(clientData[0].indexOf('=') + 1);
        let accountID = clientData[1].slice(clientData[1].indexOf('=') + 1);
        let address = clientData[2].slice(clientData[2].indexOf('=') + 1);
        let amount = clientData[3].slice(clientData[3].indexOf('=') + 1);
        let client = lib.createHederaClient(accountID, privateKey);
        if(client[1] != "ERROR" && address && amount > 0) {
            let sum = new Hbar(parseFloat(amount));
            let response = "";
            console.log("Amount to send:", sum, " hbar");
            new CryptoTransferTransaction()
                .addSender(accountID, sum)
                .addRecipient(address, sum)
                .build(client)
                .execute(client).catch((e) => response = e).then((r) => {
                    response = "SUCCESS";
                    res.send(response);
                });
        } else {
            res.send("ERROR");
        }
    });
});

router.post('/sendMaxit', (req, res) => {
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();
        let clientData = buffer.split('&');
        //console.log(buffer);
        let privateKey = clientData[0].slice(clientData[0].indexOf('=') + 1);
        let accountID = clientData[1].slice(clientData[1].indexOf('=') + 1);
        let address = clientData[2].slice(clientData[2].indexOf('=') + 1);
        let amount = clientData[3].slice(clientData[3].indexOf('=') + 1);
        let client = lib.createHederaClient(accountID, privateKey);
        if(client[1] != "ERROR" && address && amount > 0) {
            let accountNumber = lib.accountNumber(address);
            console.log(accountNumber);
            let hexAddress = lib.solidityAddress(parseInt(accountNumber));
            console.log(address);
            let sum = new BigNumber(amount);
            let params = new ContractFunctionParams()
                .addAddress(hexAddress)
                .addUint256(sum);
            lib.sendContract(MXContractId, "transfer", params, client).catch(error => {
                res.send("ERROR when send MX: " + error);
            }).then((result) => {
                res.send(result);
            });    
        } else {
            res.send("ERROR when send MX, wrong or missing arguments");
        }
    });
});

router.post('/register', (req, res) => {
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();
        let clientData = buffer.split('&');
        //console.log(buffer);
        let privateKey = clientData[0].slice(clientData[0].indexOf('=') + 1);
        let accountID = clientData[1].slice(clientData[1].indexOf('=') + 1);
        let firstname = clientData[2].slice(clientData[2].indexOf('=') + 1);
        let lastname = clientData[3].slice(clientData[3].indexOf('=') + 1);
        let birth = clientData[4].slice(clientData[4].indexOf('=') + 1);
        let motherfirst = clientData[5].slice(clientData[5].indexOf('=') + 1);
        let motherlast = clientData[6].slice(clientData[6].indexOf('=') + 1);
        let id = clientData[7].slice(clientData[7].indexOf('=') + 1);
        let citizen = clientData[8].slice(clientData[8].indexOf('=') + 1);
        let country = clientData[9].slice(clientData[9].indexOf('=') + 1);
        let city = clientData[10].slice(clientData[10].indexOf('=') + 1);
        let address = clientData[11].slice(clientData[11].indexOf('=') + 1);
        let email = clientData[12].slice(clientData[12].indexOf('=') + 1);
        let phone = clientData[13].slice(clientData[13].indexOf('=') + 1);
        let birthname = clientData[14].slice(clientData[14].indexOf('=') + 1);

        let client = lib.createHederaClient(accountID, privateKey);
        if(client[1] != "ERROR" && firstname && lastname && birth && motherfirst && motherlast && id && citizen && country && city && address && email && phone && birthname) {
            let age = new BigNumber(parseInt(birth));
            let phoneNumber = new BigNumber(parseInt(phone));
                        
            let params = new ContractFunctionParams()
                .addString(firstname)
                .addString(lastname)
                .addString(birthname)
                .addUint256(age)
                .addString(motherfirst)
                .addString(motherlast)
                .addString(id)
                .addString(citizen)
                .addString(country)
                .addString(city)
                .addString(address)
                .addString(email)
                .addUint256(phoneNumber);
            lib.sendContract(TestUsers, "registerUser", params, client).catch(error => {
                res.send("ERROR at Register user: " + error);
            }).then((result) => {
                res.send(result);
            });    
        } else {
            res.send("ERROR when Register user, wrong or missing argument");
        }
    });
});

router.post('/createCreditOffer', (req, res) => {
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();
        let clientData = buffer.split('&');
        //console.log(buffer);
        let privateKey = clientData[0].slice(clientData[0].indexOf('=') + 1);
        let accountID = clientData[1].slice(clientData[1].indexOf('=') + 1);
        let amount = clientData[2].slice(clientData[2].indexOf('=') + 1);
        let type = clientData[3].slice(clientData[3].indexOf('=') + 1);
        let length = clientData[4].slice(clientData[4].indexOf('=') + 1);
        let periods = clientData[5].slice(clientData[5].indexOf('=') + 1);
        let interest = clientData[6].slice(clientData[6].indexOf('=') + 1);
        let score = clientData[7].slice(clientData[7].indexOf('=') + 1);
        let last = clientData[8].slice(clientData[8].indexOf('=') + 1);

        let client = lib.createHederaClient(accountID, privateKey);
        if(client[1] != "ERROR" && amount > 1999 && type && length > 299 && periods > 0 && interest > 0 && score > 0 && last > 0) {
            let accountNumber = lib.accountNumber(TestCredit);
            let hexAddress = lib.solidityAddress(parseInt(accountNumber));
            console.log(hexAddress);
            let args = new ContractFunctionParams()
                .addAddress(hexAddress)
                .addUint256(new BigNumber(amount));
            let params = new ContractFunctionParams()
                .addUint256(new BigNumber(amount))
                .addUint256(new BigNumber(type))
                .addUint256(new BigNumber(length))
                .addUint256(new BigNumber(periods))
                .addUint256(new BigNumber(interest))
                .addUint256(new BigNumber(score))
                .addUint256(new BigNumber(last))
            lib.sendContract(MXContractId, "approve", args, client).catch(er => {
                res.send("ERROR at approve for create credit offer: " + er); 
            }).then((re) => {
                console.log("ALLOWANCE");
                console.log(re.receipt.status);
                lib.sendContract(TestCredit, "createCreditOffer", params, client).catch(error => {
                    res.send("ERROR at create credit offer: " + error);
                }).then((result) => {
                    res.send(result.receipt.status);
                }); 
            });   
        } else {
            res.send("ERROR at create credit offer, wrong or missing argument");
        }
    });
});

router.post('/createCreditClaim', (req, res) => {
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();
        let clientData = buffer.split('&');
        //console.log(buffer);
        let privateKey = clientData[0].slice(clientData[0].indexOf('=') + 1);
        let accountID = clientData[1].slice(clientData[1].indexOf('=') + 1);
        let allowance = clientData[2].slice(clientData[2].indexOf('=') + 1);
        let amount = clientData[3].slice(clientData[3].indexOf('=') + 1);
        let type = clientData[4].slice(clientData[4].indexOf('=') + 1);
        let length = clientData[5].slice(clientData[5].indexOf('=') + 1);
        let periods = clientData[6].slice(clientData[6].indexOf('=') + 1);
        let interest = clientData[7].slice(clientData[7].indexOf('=') + 1);
        let last = clientData[8].slice(clientData[8].indexOf('=') + 1);
        
        console.log("CREATE CLAIM:", allowance, amount, type, length, periods, interest, last);
        let client = lib.createHederaClient(accountID, privateKey);
        if(client[1] != "ERROR" && allowance > 1999 && amount > 1999 && type && length > 299 && periods > 0 && interest > 0 && last > 0) {
            let accountNumber = lib.accountNumber(TestCredit);
            let hexAddress = lib.solidityAddress(parseInt(accountNumber));
            console.log(hexAddress + " " + allowance);
            let args = new ContractFunctionParams()
            .addAddress(hexAddress)
            .addUint256(new BigNumber(allowance));
            let params = new ContractFunctionParams()
            .addUint256(new BigNumber(amount))
            .addUint256(new BigNumber(type))
            .addUint256(new BigNumber(length))
            .addUint256(new BigNumber(periods))
            .addUint256(new BigNumber(interest))
            .addUint256(new BigNumber(last))
            lib.sendContract(MXContractId, "approve", args, client).catch(er => {
                res.send("ERROR at approve for create credit claim: " + er);
            }).then((re) => {
                console.log("ALLOWANCE");
                console.log(re.receipt.status);
                lib.sendContract(TestCredit, "createCreditClaim", params, client).catch(error => {
                    res.send("ERROR at create credit claim: " + error);
                }).then((result) => {
                    res.send(result.receipt.status);
                }); 
            });   
        } else {
            res.send("ERROR at create credit claim, wrong or missing arguments");
        }
    });
});

router.post('/offers', (req, res) => {
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();

        //let accountID = buffer.slice(buffer.indexOf('=') + 1);
        //console.log(accountID);
        
        let client = lib.createHederaClient(mxOwner, ownerPrKey);
        if(client[1] != "ERROR") {
            let offers = [];

        lib.callContractNoArgs(TestCredit, "creditOfferCounter", client).catch((e) => {
            console.log("CATCH at creditOfferCounter: " + e);
            res.send("CATCH at creditOfferCounter: " + e);
        }).then((result) => {
            //console.log("CREDITOFFERSCOUNT");
            //console.log(result.getUint256(0).toString());
            offersCount = result.getUint256(0);
            counter = 0;
            if(offersCount > 0) getCreditOffers(counter, offersCount);
            else res.send("There is no credit offer");
        });

        getCreditOffers = (counter, offersCount) => {
            let params2 = new ContractFunctionParams()
            .addUint256(new BigNumber(counter));
            lib.callContract(TestCredit, "creditOffers", params2, client).catch((er) => {
                console.log("CATCH at creditOffers: " + er);
                res.send("CATCH at creditOffers: " + er);
            }).then((re) => {
                //console.log(res.getUint256(0).toString() + " " + res.getUint256(2).toString() + " " + res.getUint256(4).toString());
                let lender = re.getUint256(0).toString();
                let amount = re.getUint256(2).toString();
                let length = re.getUint256(4).toString();
                let periods = re.getUint256(5).toString();
                let interest = re.getUint256(6).toString();
                let score = re.getUint256(7).toString();
                let last = re.getUint256(8).toString();

                offers[counter] = {lender, amount, length, periods, interest, score, last};
                counter++;
                if(counter < offersCount) {
                    //console.log("Counter: " + counter + " offerCount: " + offersCount);
                    getCreditOffers(counter, offersCount);
                } else {
                    res.send(JSON.stringify(offers));
                }
            });
        }
        } else {
            res.send("ERROR at get credit offers");
        }
    });
});

router.post('/acceptOffer', (req, res) => {
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();
        let clientData = buffer.split('&');
        //console.log(buffer);
        let privateKey = clientData[0].slice(clientData[0].indexOf('=') + 1);
        let accountID = clientData[1].slice(clientData[1].indexOf('=') + 1);
        let allowance = clientData[2].slice(clientData[2].indexOf('=') + 1);
        let offerID = clientData[3].slice(clientData[3].indexOf('=') + 1);
        let amount = clientData[4].slice(clientData[4].indexOf('=') + 1);
        
        let client = lib.createHederaClient(accountID, privateKey);
        if(client[1] != "ERROR" && allowance > 1999 && offerID && amount > 1999) {
            let accountNumber = lib.accountNumber(TestCredit);
            let hexAddress = lib.solidityAddress(parseInt(accountNumber));
            console.log(hexAddress);
            let args = new ContractFunctionParams()
            .addAddress(hexAddress)
            .addUint256(new BigNumber(allowance));
            let params = new ContractFunctionParams()
            .addUint256(new BigNumber(offerID))
            .addUint256(new BigNumber(amount));
            console.log("PARAMS: " + offerID + " " + amount + " " + allowance);
            lib.sendContract(MXContractId, "approve", args, client).catch(er => {
                res.send("ERROR when aprove for accept offer: " + er);
            }).then((re) => {
                console.log("ALLOWANCE");
                console.log(re.receipt.status);
                lib.sendContract(TestCredit, "acceptCreditOffer", params, client).catch((e) => {
                    console.log(e.record);
                    res.send("ERROR when accept offer: " + e);
                }).then((result) => {
                    console.log("ACCEPT CREDIT OFFER: " + result.receipt.status);
                    res.send("SUCCESS");
                }); 
            }); 
        } else {
            res.send("ERROR when accept offer, wrong or missing argument");
        }
    });
});

router.post('/changeOffer', (req, res) => {
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();
        let clientData = buffer.split('&');
        //console.log(buffer);
        let privateKey = clientData[0].slice(clientData[0].indexOf('=') + 1);
        let accountID = clientData[1].slice(clientData[1].indexOf('=') + 1);
        let offerID = clientData[2].slice(clientData[2].indexOf('=') + 1);
        let amount = clientData[3].slice(clientData[3].indexOf('=') + 1);
        
        let client = lib.createHederaClient(accountID, privateKey);
        if(client[1] != "ERROR" && offerID && amount > 0) {
            let params = new ContractFunctionParams()
            .addUint256(new BigNumber(offerID))
            .addUint256(new BigNumber(amount));
            lib.sendContract(TestCredit, "changeCreditOfferAmount", params, client).catch((e) => {
                console.log(e.record);
                res.send("ERROR when change offer: " + e);
            }).then((result) => {
                console.log("CHANGE CREDIT OFFER: " + result.receipt.status);
                res.send(result.receipt.status);
            }); 
        } else {
            res.send("ERROR when change offer, wrong or missing argument");
        }
    });
});

router.post('/deleteOffer', (req, res) => {
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();
        let clientData = buffer.split('&');
        //console.log(buffer);
        let privateKey = clientData[0].slice(clientData[0].indexOf('=') + 1);
        let accountID = clientData[1].slice(clientData[1].indexOf('=') + 1);
        let offerID = clientData[2].slice(clientData[2].indexOf('=') + 1);
        
        let client = lib.createHederaClient(accountID, privateKey);
        if(client[1] != "ERROR" && offerID) {
            let params = new ContractFunctionParams()
            .addUint256(new BigNumber(offerID));
            lib.sendContract(TestCredit, "deleteOffer", params, client).catch(error => {
                res.send("ERROR when delet offer: " + error);
            }).then((result) => {
                console.log("DELETE CREDIT OFFER: " + result.receipt.status);
                res.send(result.receipt.status);
            }); 
        } else {
            res.send("ERROR when delet offer, wrong arguments");
        }
    });
});

router.post('/claims', (req, res) => {
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();

        //let accountID = buffer.slice(buffer.indexOf('=') + 1);
        //console.log(accountID);
        
        let client = lib.createHederaClient(mxOwner, ownerPrKey);
        if(client[1] != "ERROR") {
            let claims = [];

            lib.callContractNoArgs(TestCredit, "creditClaimCounter", client).catch((e) => {
                console.log("CLAIM catch at creditClaimCounter: " + e);
                res.send("CLAIM catch at creditClaimCounter: " + e);
            }).then((result) => {
                //console.log(result.getUint256(0).toString());
                claimsCount = result.getUint256(0);
                counter = 0;
                if(claimsCount > 0) getCreditClaims(counter, claimsCount);
                else res.send("There is no claim!");
            });

            getCreditClaims = (counter, claimsCount) => {
                let params2 = new ContractFunctionParams()
                .addUint256(new BigNumber(counter));
                lib.callContract(TestCredit, "creditClaims", params2, client).catch((er) => {
                    console.log("CATCH at creditClaim: " + er);
                    res.send("CATCH at creditClaim: " + er);
                }).then((re) => {
                    //console.log(res.getUint256(0).toString() + " " + res.getUint256(2).toString() + " " + res.getUint256(4).toString());
                    let borrower = re.getUint256(0).toString();
                    let borrowerID = re.getUint256(1);
                    let amount = re.getUint256(2).toString();
                    let length = re.getUint256(4).toString();
                    let periods = re.getUint256(5).toString();
                    let interest = re.getUint256(6).toString();
                    //let score = re.getUint256(7).toString();
                    let last = re.getUint256(8).toString();

                    let params3 = new ContractFunctionParams()
                        .addUint256(borrowerID);

                    lib.callContract(TestUsers, "getUserPublicData", params3, client).catch((err) => {
                        console.log("CLAIM CATCH at score: " + err);
                        res.send("CLAIM CATCH at score: " + err);
                    }).then((r) => {
                        let score = r.getUint256(0).toString();
                        let addressCounter = r.getUint256(1).toString();
                        let country = lib.strCheck(r.getString(2));
                        let city = lib.strCheck(r.getString(3));
                        let creditCounter = r.getUint256(4).toString();
                        let age = r.getUint256(6);
                        let scoreFromAcc = r.getUint256(5).toString()

                        console.log("CLAIM SCORE:", score, " age:", age);
                        claims[counter] = {borrower, amount, length, periods, interest, score, last, addressCounter, country, city, creditCounter, age, scoreFromAcc};
                        counter++;
                        if(counter < claimsCount) {
                            //console.log("Counter: " + counter + " claimCount: " + claimsCount);
                            getCreditClaims(counter, claimsCount);
                        } else {
                            res.send(JSON.stringify(claims));
                        }
                    });    
                });
            }
        } else {
            res.send("ERROR when get claims");
        }
    });
});

router.post('/acceptClaim', (req, res) => {
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();
        let clientData = buffer.split('&');
        //console.log(buffer);
        let privateKey = clientData[0].slice(clientData[0].indexOf('=') + 1);
        let accountID = clientData[1].slice(clientData[1].indexOf('=') + 1);
        let claimID = clientData[2].slice(clientData[2].indexOf('=') + 1);
        let amount = parseInt(clientData[3].slice(clientData[3].indexOf('=') + 1));
        let accNum = lib.accountNumber(accountID);
        let hexAccAddress = lib.solidityAddress(parseInt(accNum));
        console.log(accountID + " " + hexAccAddress);

        let client = lib.createHederaClient(accountID, privateKey);
        if(client[1] != "ERROR" && claimID && amount > 1999) {
            let accountNumber = lib.accountNumber(TestCredit);
            let hexAddress = lib.solidityAddress(parseInt(accountNumber));
            console.log(hexAddress + " " + claimID + " " + amount);
            let args = new ContractFunctionParams()
            .addAddress(hexAddress)
            .addUint256(new BigNumber(amount));
            let param = new ContractFunctionParams()
            .addAddress(hexAccAddress)
            .addAddress(hexAddress);
            let params = new ContractFunctionParams()
            .addUint256(new BigNumber(claimID))
            .addUint256(new BigNumber(amount));
            lib.sendContract(MXContractId, "approve", args, client).catch((er) => {
                console.log("ERROR at approve to accept claim:", er);
            }).then((re) => {
                console.log("ALLOWANCE");
                console.log(re.receipt.status);
                lib.callContract(MXContractId, "allowance", param, client).catch((e) => {
                    console.log("ERROR at check allowance:", e);
                }).then((r) => {
                    console.log("ALLOWANCE", r.getUint256(0).toString());
                    
                    lib.sendContract(TestCredit, "acceptCreditClaim", params, client).catch((error) => {
                        console.log("ERROR at accept claim:", error);
                    }).then((result) => {
                        console.log("ACCEPT CREDIT CLAIM: " + result.receipt.status);
                        res.send(result.receipt.status);
                    });
                });
            }); 
        } else {
            res.send("ERROR");
        }
    });
});

router.post('/changeClaim', (req, res) => {
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();
        let clientData = buffer.split('&');
        //console.log(buffer);
        let privateKey = clientData[0].slice(clientData[0].indexOf('=') + 1);
        let accountID = clientData[1].slice(clientData[1].indexOf('=') + 1);
        let claimID = clientData[2].slice(clientData[2].indexOf('=') + 1);
        let amount = clientData[3].slice(clientData[3].indexOf('=') + 1);
        
        let client = lib.createHederaClient(accountID, privateKey);
        if(client[1] != "ERROR" && claimID && amount > 0) {
            let params = new ContractFunctionParams()
            .addUint256(new BigNumber(claimID))
            .addUint256(new BigNumber(amount));
            lib.sendContract(TestCredit, "changeCreditClaimAmount", params, client).catch(error => {
                res.send("CATCH at CHANGE CREDIT CLAIM: " + error);
            }).then((result) => {
                console.log("CHANGE CREDIT CLAIM: " + result.receipt.status);
                res.send("SUCCESS changeClaim");
            }); 
        } else {
            res.send("ERROR when change claim, wrong or missing arguments");
        }
    });
});

router.post('/deleteClaim', (req, res) => {
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();
        let clientData = buffer.split('&');
        //console.log(buffer);
        let privateKey = clientData[0].slice(clientData[0].indexOf('=') + 1);
        let accountID = clientData[1].slice(clientData[1].indexOf('=') + 1);
        let claimID = clientData[2].slice(clientData[2].indexOf('=') + 1);
        
        let client = lib.createHederaClient(accountID, privateKey);
        if(client[1] != "ERROR" && claimID) {
            let params = new ContractFunctionParams()
            .addUint256(new BigNumber(claimID));
            lib.sendContract(TestCredit, "deleteClaim", params, client).catch(error => {
                res.send("CATCH at DELETE CREDIT CLAIM: " + error);
            }).then((result) => {
                console.log("DELETE CREDIT CLAIM: " + result.receipt.status);
                res.send("SUCCESS deleteClaim");
            }); 
        } else {
            res.send("ERROR when delete claim, wrong arguments");
        }
    });
});

router.post('/listCredits', (req, res) => {
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();
        let clientData = buffer.split('&');
        //console.log(buffer);
        let privateKey = clientData[0].slice(clientData[0].indexOf('=') + 1);
        let accountID = clientData[1].slice(clientData[1].indexOf('=') + 1);
        
        let client = lib.createHederaClient(accountID, privateKey);
        if(client[1] != "ERROR") {
            let myCredits = [];
            let accountShort = lib.accountNumber(accountID);
            let address2 = lib.solidityAddress(parseInt(accountShort));
            let params = new ContractFunctionParams()
            .addAddress(address2);
            lib.callContract(TestUsers, "getUserByAddress", params, client).catch(erro => {
                res.send("CATCH at list credits getUserByAddress: " + erro);
            }).then((resu) => {
                console.log("LIST CREDITS GETUSERSBYADDRESS");
                let userId = resu.getUint256(0);
                console.log(userId.toString());
                
                let params3 = new ContractFunctionParams()
                    .addUint256(userId);
                lib.callContract(TestUsers, "getUserPublicData", params3, client).catch(e => {
                    res.send("CATCH at list credits getUserPublicData: " + e);
                }).then((r) => {
                    console.log("LIST CREDITS GETUSERPUBLICDATA");
                    console.log(r.getUint256(0).toString() + " " + (r.getUint256(6)/365/24/3600).toString() + " " + r.getUint256(4).toString());
                    let myCreditCounter = r.getUint256(4).toString();
                    console.log("My credit counter", myCreditCounter);
                    let counter = 0;
                    if(myCreditCounter > 0) getMyCredits(counter, myCreditCounter, client);
                    else res.send("No credits");
                });
            });

            getMyCredits = (counter, myCreditCounter, client) => {
                console.log("counter", counter);
                let params5 = new ContractFunctionParams()
                    .addUint256(new BigNumber(counter));
                lib.callContract(TestUsers, "getMyCredit", params5, client).catch(er => {
                    res.send("CATCH at list credits getMyCredit: " + er);
                }).then((re) => {
                    let creditAddress = re.getAddress(0).toString();
                    console.log("Mycredit (" + counter + ") " + creditAddress);
                    if(creditAddress != "0000000000000000000000000000000000000000") {
                        let hederaAddress = parseInt(creditAddress, 16);
                        lib.callContractNoArgs(hederaAddress, "getAllDetails", client).catch(error => {
                            res.send("CATCH at list credits get all details: " + error);
                        }).then((result) => {
                            
                            console.log(result.getUint256(1).toString() + " " + result.getUint256(7).toString() + " " + result.getUint256(8).toString());
                            let loanId = result.getUint256(0).toString();
                            let initialCapital = result.getUint256(1).toString();
                            let interestRate = result.getUint256(2).toString();
                            let toPayBack = result.getUint256(3).toString();
                            let periods = result.getUint256(4).toString();
                            let length = result.getUint256(5).toString();
                            let start = result.getUint256(6).toString();
                            let capital = result.getUint256(7).toString();
                            let lastReedem = result.getUint256(8).toString();
                            myCredits[counter] = {loanId, initialCapital, interestRate, toPayBack, periods, length, start, capital, lastReedem};
                            counter++;
                            if(counter < myCreditCounter) {
                                getMyCredits(counter, myCreditCounter, client);
                            } else {
                                //console.log(myCredits);
                                res.send(JSON.stringify(myCredits));
                            }
                        });
                    } else {
                        res.send(JSON.stringify(myCredits));
                    }
                });
            }
        } else {
            res.send("ERROR when list credits");
        }
    });
});

router.post('/listMyLendings', (req, res) => {
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();
        let clientData = buffer.split('&');
        //console.log(buffer);
        let privateKey = clientData[0].slice(clientData[0].indexOf('=') + 1);
        let accountID = clientData[1].slice(clientData[1].indexOf('=') + 1);
        let myLendings =[];
        
        let client = lib.createHederaClient(accountID, privateKey);
        if(client[1] != "ERROR") {
            lib.callContractNoArgs(TestCredit, "creditCounter", client).catch(error => {
                res.send("CATCH at list my lendings credit counter: " + error);
            }).then((result) => {
                let creditCount = parseInt(result.getUint256(0));
                let creditCounter = 0;
                let myLendingCounter = 0;
                console.log("CREDITS: " + creditCount + " creditCounter: " + creditCounter + " my credit: " + myLendingCounter);
                //res.send(result.getUint256(0).toString());
                if(creditCount > 0) getMyLendings(creditCounter, creditCount, myLendingCounter, client);
                else res.send("No lendings");
            });
        }

        getMyLendings = (creditCounter, creditCount, myLendingCounter, client) => {
            let params5 = new ContractFunctionParams()
                .addUint256(new BigNumber(creditCounter));
            lib.callContract(TestCredit, "Credits", params5, client).catch(er => {
                res.send("CATCH at list my lendings credits: " + er);
            }).then((re) => {
                let creditAddress = re.getAddress(0).toString();
                if(creditAddress != "0000000000000000000000000000000000000000") {
                    let hederaAddress = parseInt(creditAddress, 16);
                    lib.callContractNoArgs(hederaAddress, "getAllDetails", client).catch(erro => {
                        res.send("CATCH at list my lendings get all details: " + erro);
                    }).then((resul) => {
                        console.log("Mycredit (" + myLendingCounter + ") " + creditAddress + " credit counter: " + creditCounter);
                        let ownerOfLoan = "0.0." + parseInt(resul.getAddress(9), 16);
                        console.log("OWNER: " + ownerOfLoan + " " + accountID);
                        
                        if(ownerOfLoan == accountID) {
                            let loanId = resul.getUint256(0).toString();
                            let initialCapital = resul.getUint256(1).toString();
                            let interestRate = resul.getUint256(2).toString();
                            let toPayBack = resul.getUint256(3).toString();
                            let periods = resul.getUint256(4).toString();
                            let length = resul.getUint256(5).toString();
                            let start = resul.getUint256(6).toString();
                            let capital = resul.getUint256(7).toString();
                            let lastReedem = resul.getUint256(8).toString();
                            let contractAddress = creditAddress;
                            myLendings[myLendingCounter] = {loanId, initialCapital, interestRate, toPayBack, periods, length, start, capital, lastReedem, contractAddress};
                            myLendingCounter ++;
                        }
                        creditCounter ++;
                        if(creditCounter < creditCount) {
                            getMyLendings(creditCounter, creditCount, myLendingCounter, client);
                        } else {
                           res.send(JSON.stringify(myLendings));
                        }
                    });
                } else {
                    res.send(JSON.stringify(myLendings));
                }
            });
        }
    });
});

router.post('/setCapitalRabat', (req, res) => {
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();
        let clientData = buffer.split('&');
        //console.log(buffer);
        let privateKey = clientData[0].slice(clientData[0].indexOf('=') + 1);
        let accountID = clientData[1].slice(clientData[1].indexOf('=') + 1);
        let loanAddress = clientData[2].slice(clientData[2].indexOf('=') + 1);
        let capital = clientData[3].slice(clientData[3].indexOf('=') + 1);

        let client = lib.createHederaClient(accountID, privateKey);
        if(client[1] != "ERROR" && loanAddress && capital > 0) {
            let loanAddressStr = "0.0." + parseInt(loanAddress, 16);
            console.log("RABAT: " + loanAddressStr + " " + capital);

            let params = new ContractFunctionParams()
            .addUint256(new BigNumber(capital));
            
            lib.sendContract(loanAddressStr, "setCapitalRabat", params, client).catch(error => {
                res.send("CATCH when set capital rabat: " + error);
            }).then((result) => {
                console.log("SET CAPITAL RABAT: " + result.receipt.status);
                res.send(result.receipt.status);
            }); 
        } else {
            res.send("ERROR when set capital rabat, wrong or missing argument");
        }
    });
});

router.post('/setInterestRabat', (req, res) => {
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();
        let clientData = buffer.split('&');
        //console.log(buffer);
        let privateKey = clientData[0].slice(clientData[0].indexOf('=') + 1);
        let accountID = clientData[1].slice(clientData[1].indexOf('=') + 1);
        let loanAddress = clientData[2].slice(clientData[2].indexOf('=') + 1);
        let interest = clientData[3].slice(clientData[3].indexOf('=') + 1);

        let client = lib.createHederaClient(accountID, privateKey);
        if(client[1] != "ERROR" && loanAddress && interest) {
            let loanAddressStr = "0.0." + parseInt(loanAddress, 16);
            console.log("RABAT: " + loanAddressStr + " " + interest);

            let params = new ContractFunctionParams()
            .addUint256(new BigNumber(interest));
            
            lib.sendContract(loanAddressStr, "setInterestRabat", params, client).catch(error => {
                res.send("CATCH when set interest rabat: " + error);
            }).then((result) => {
                console.log("SET INTEREST RABAT: " + result.receipt.status);
                res.send(result.receipt.status);
            }); 
        } else {
            res.send("ERROR when set interest rabat, wrong or missing argument");
        }
    });
});

router.post('/restructLoan', (req, res) => {
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();
        let clientData = buffer.split('&');
        //console.log(buffer);
        let privateKey = clientData[0].slice(clientData[0].indexOf('=') + 1);
        let accountID = clientData[1].slice(clientData[1].indexOf('=') + 1);
        let loanAddress = clientData[2].slice(clientData[2].indexOf('=') + 1);
        let periods = clientData[3].slice(clientData[3].indexOf('=') + 1);

        let client = lib.createHederaClient(accountID, privateKey);
        if(client[1] != "ERROR" && loanAddress && periods > 0) {
            let loanAddressStr = "0.0." + parseInt(loanAddress, 16);
            console.log("RABAT: " + loanAddressStr);

            let params = new ContractFunctionParams()
            .addUint256(new BigNumber(periods));
            lib.sendContract(loanAddressStr, "reStructure", params, client).catch(error => {
                res.send("CATCH when restruct loan: " + error);
            }).then((result) => {
                console.log("RESTRUCTURE LOAN: " + result.receipt.status);
                res.send(result.receipt.status);
            }); 
        } else {
            res.send("ERROR when restruct loan, wrong or missing argument");
        }
    });
});

router.post('/adminLogin', (req, res) => {
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();
        clientData = buffer.split('&');
        let user = parseInt(clientData[0].slice(clientData[0].indexOf('=') + 1));
        let pw = clientData[1].slice(clientData[1].indexOf('=') + 1);
        console.log(user);

        if(user == 23811 && pw == "302e020100300506032b657004220420eb5acf63d7bcd960fb134e14ec6a6e8925a09b78769e402f526cd4b4b09ad17c") {
            res.send("Success login");
        } else {
            res.send("Wrong user or pw");
        }
    });
});

router.post('/getUserDetailsAdmin', (req, res) => {
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();
        clientData = buffer.split('&');
        let user = "0.0." + clientData[0].slice(clientData[0].indexOf('=') + 1);
        let pw = clientData[1].slice(clientData[1].indexOf('=') + 1);
        let userId = clientData[2].slice(clientData[2].indexOf('=') + 1);
        console.log("getUserDetailsAdmin id:", userId);

        let response = [];

        const client = lib.createHederaClient(user, pw);
        if(client[1] != "ERROR" && userId) {
            let params = new ContractFunctionParams()
                .addUint256(new BigNumber(userId));

            lib.callContract(TestUsers, "getUserPrivateData1", params, client).catch((error) => {
                console.log("ERROR at getUserPrivateData1: " + error);
                res.send("ERROR at getUserPrivateData1: " + error);
            }).then((result) => {
                //console.log(result);
                response[0] = lib.strCheck(result.getString(0));
                response[1] = lib.strCheck(result.getString(1));
                console.log(result.getUint256(2).toString());
                let birth = new Date(parseInt(result.getUint256(2)) * 1000 - ((70 * 365 + 17) * 24 * 60 * 60 * 1000));
                response[2] = birth.toDateString();
                response[3] = lib.strCheck(result.getString(3));
                response[4] = lib.strCheck(result.getString(4)); 
                response[5] = lib.strCheck(result.getString(5));
                console.log(response);
                lib.callContract(TestUsers, "getUserPrivateData2", params, client).catch((err) => {
                    console.log("ERROR at getUserPrivateData2: " + err);
                    res.send("ERROR at getUserPrivateData2: " + err);
                }).then((resul) => {
                    response[6] = lib.strCheck(resul.getString(0));
                    response[7] = lib.strCheck(resul.getString(1));
                    response[8] = resul.getUint256(2);
                    response[9] = lib.strCheck(resul.getString(3));
                    response[10] = lib.strCheck(resul.getString(4));
                    lib.callContract(TestUsers, "getUserPublicData", params, client).catch((er) => {
                        console.log("ERROR at getUserPublicData: " + er);
                        res.send("ERROR at getUserPublicData: " + er);
                    }).then((resu) => {
                        response[11] = resu.getUint256(0);
                        response[12] = resu.getUint256(1);
                        response[13] = lib.strCheck(resu.getString(2));
                        response[14] = lib.strCheck(resu.getString(3));
                        response[15] = resu.getUint256(4);
                        response[16] = resu.getUint256(5);
                        response[17] = resu.getUint256(6);
                        lib.callContract(TestUsers, "getPendingUser", params, client).catch((e) => {
                            console.log("ERROR at getPendingUser: " + e);
                            res.send("ERROR at getPendingUser: " + e);
                        }).then((re) => {
                            response[18] = re.getBool(0);
                            res.send(response);
                        });
                    });
                });
            });
        }
    });
});    

router.post('/setChecked', (req, res) => {
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();
        clientData = buffer.split('&');
        let user = "0.0." + clientData[0].slice(clientData[0].indexOf('=') + 1);
        let pw = clientData[1].slice(clientData[1].indexOf('=') + 1);
        let userId = clientData[2].slice(clientData[2].indexOf('=') + 1);
        console.log(userId);
        
        const client = lib.createHederaClient(user, pw);
        if(client[1] != "ERROR" && userId) {
            let params = new ContractFunctionParams()
            .addUint256(new BigNumber(userId));

            lib.sendContract(TestUsers, "setChecked", params, client).catch((error) => {
                console.log("ERROR at setChecked: " + error);
                res.send("ERROR at setChecked: " + error);
            }).then((result) => {
                console.log(result.receipt.status);
                res.send(result.receipt.status);
            });
        }
    });
});  

router.post('/createAccount', (req, res) => {
    console.log("NEW ACCOUNT");
    let response = [];
    let client = lib.createHederaClient(mxOwner, ownerPrKey);
    if(client[1] != "ERROR") {
        lib.createNewAccount(client).catch((e) => {
            console.log(e);
            res.send("ERROR when creating new account: " + e);
        }).then((r) => {
            console.log(r);
            response.push("SUCCESS");
            response.push(r[0]);
            response.push(r[1]);
            res.send(response);
        });
    } else {
        res.send("ERROR when creating new account: " + client[0]);
    }
});

router.get('/getHbarPrice', (req, res) => {
    let MXPrices = {
        hbar: hbarPrice,
        usd: usdPrice,
        dailyBase: dailyBasePrice
    }
    res.send(JSON.stringify(MXPrices));
});

router.post('/buyMX', (req, res) => {
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();
        clientData = buffer.split('&');
        let privateKey = clientData[0].slice(clientData[0].indexOf('=') + 1);
        let accountID = clientData[1].slice(clientData[1].indexOf('=') + 1);
        let amount = clientData[2].slice(clientData[2].indexOf('=') + 1);
        //console.log(userId)
        
        const client = lib.createHederaClient(accountID, privateKey);
        if(client[1] != "ERROR" && amount > 0) {
            let toPay = parseInt(amount * hbarPrice * 101 / 100);
            console.log("TOPAY: " + toPay);
            let params = new ContractFunctionParams()
                .addUint256(new BigNumber(amount));
            lib.sendContractPayable(MXx, toPay, "buyToken", params, client).catch((error) => {
                console.log("ERROR at buy token: " + error);
                res.send("ERROR at buy token: " + error);
            }).then((result) => {
                console.log(result.receipt.status);
                res.send("SUCCESS");
            });
        } else {
            res.send("ERROR at buy token, wrong or missing argument")
        }
    });
});  

router.post('/sellMX', (req, res) => {
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();
        clientData = buffer.split('&');
        let privateKey = clientData[0].slice(clientData[0].indexOf('=') + 1);
        let accountID = clientData[1].slice(clientData[1].indexOf('=') + 1);
        let amount = clientData[2].slice(clientData[2].indexOf('=') + 1);
        //console.log(userId)

        const client = lib.createHederaClient(accountID, privateKey);
        if(client[1] != "ERROR" && amount > 0) {
            let mxAddress = lib.accountNumber(MXx);
            let hexMxAddress = lib.solidityAddress(parseInt(mxAddress));
    
            let accountNumber = lib.accountNumber(accountID);
            let hexAccountAddress = lib.solidityAddress(parseInt(accountNumber));
            
            let params = new ContractFunctionParams()
                .addAddress(hexAccountAddress);
            let params1 = new ContractFunctionParams()
                .addAddress(hexMxAddress)
                .addUint256(new BigNumber(amount));
            let params2 = new ContractFunctionParams()
                .addUint256(new BigNumber(amount));
    
            lib.callContract(MXContractId, "getTokenBalance", params, client).catch((e) => {
                console.log("ERROR at getTokenBalance: " + e);
                res.send("ERROR at getTokenBalance: " + e);
            }).then((r) => {
                let mxBalance = parseInt(r.getUint256(0));
                console.log(mxBalance);
                if(mxBalance > amount) {
                    lib.sendContract(MXContractId, "approve", params1, client).catch((err) => {
                        console.log("ERROR at sell token: " + err);
                        res.send("ERROR at approve for sell token: " + err);
                    }).then((re) => {
                        console.log(re.receipt.status);
                        lib.sendContract(MXx, "sellToken", params2, client).catch((error) => {
                            console.log("ERROR at sell token: " + error);
                            res.send("ERROR at sell token: " + error);
                        }).then((result) => {
                            console.log(result.receipt.status);
                            res.send("SUCCESS");
                        });
                    });
                } else {
                    res.send("Unsufficient MX balance");
                }
            });
        } else {
            res.send("ERROR at sell token, wrong or missing argument");
        }
    });
});  


router.post('/', function(req, res){
   res.send('POST route on things.');
});

//should be post
router.get('/paypalCheck', (req, res) => {
    console.log("Paypal:", req.query);
    let orderId = req.query.orderId;
    let hederaAccount = req.query.account;
    let mxAmount = req.query.mxAmount;
    console.log(orderId, hederaAccount, mxAmount);
    let request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});
    paypalClient.execute(request).catch(e => console.log(e)).then(r => {
        console.log(r.result.status, r.result.purchase_units[0].payments.captures[0].seller_receivable_breakdown.net_amount);  
        //convertToHederaMX(address _buyer, uint _amount)
        const hederaClient = lib.createHederaClient(23538, "302e020100300506032b65700422042049b657a1fa5de553edf9224bda0fcc93d522f307dc570d6a2fbe54e631a775f3");
        if(hederaClient[1] != "ERROR" && mxAmount > 0) {
            let params = new ContractFunctionParams()
                .addAddress(lib.solidityAddress(parseInt(lib.accountNumber(hederaAccount))))
                .addUint256(new BigNumber(parseInt(mxAmount)));
            lib.sendContract(MXx, "convertToHederaMX", params, hederaClient).catch(error => {
                console.log("ERROR when ConvertToHederaMX" + error);
                res.send("ERROR when ConvertToHederaMX" + error);
            }).then(result => {
                console.log("ConvertToHederaMX", result.receipt.status);
                res.send(mxAmount + " MX has been sent to " + hederaAccount);
            });
        } else {
            res.send("ERROR when create hedera client, users MX has not been sent");
        }
    });
});

setInterval(getHbarPrice, 60000);

parseJsonToObject = (str) => {
    try {
        let obj = JSON.parse(str);
        return obj;
    } catch(e) {
        return e;
    }
}

let price = () => {
    let client = lib.createHederaClient(mxOwner, ownerPrKey);
    lib.callContractNoArgs(MXContractId, "getPrices", client).catch(console.log).then((r) => {
        console.log("GETPRICES:", r.getUint256(0).toString());
        hbarPrice = parseInt(r.getUint256(1));
        usdPrice = parseInt(r.getUint256(0));
        dailyBasePrice = parseInt(r.getUint256(2));
    });
}

price();
setInterval(price, 60000);
  
function getHbarPrice() {
  rp(requestOptions).catch((err) => {
    console.log('API call error:', err.message);
  }).then(response => {
    let priceObj = parseJsonToObject(response);
    //console.log(priceObj["hedera-hashgraph"].usd);
    let HbarUSD = parseFloat(priceObj["hedera-hashgraph"].usd);
    let Hederaprice = 100 / HbarUSD * 10000;
    
    let currentHbarPrice = parseInt(Hederaprice);
    let upperBound = hbarPrice * 101 / 100;
    let lowerBound = hbarPrice * 99 / 100;

    console.log(currentHbarPrice + " " + upperBound + " " + lowerBound);
    let HbarUSDprice = new BigNumber(parseInt(HbarUSD * 10000));
    console.log(HbarUSDprice + " " + typeof(HbarUSDprice));
    

    if(currentHbarPrice > upperBound || currentHbarPrice < lowerBound) {
        hbarPrice = currentHbarPrice;
        console.log("NEW hbar price: " + hbarPrice);

        let privateKey = ownerPrKey;
        let accountID = mxOwner;
        let client = lib.createHederaClient(accountID, privateKey);
        
        let params = new ContractFunctionParams()
            .addUint256(new BigNumber(100))
            .addUint256(new BigNumber(hbarPrice))
            .addUint256(HbarUSDprice)
            .addUint256(new BigNumber(1));

        lib.sendContract(MXContractId, "checkPrice", params, client).catch((e) => {
            console.log(e);
        }).then((r) => {
            console.log(r.receipt.status);
        });
    } 
  });
}

const abiJson = fs.readFileSync("erc20.abi");
const abi = JSON.parse(abiJson);
const xchangeETH = new web3.eth.Contract(abi, '0x17070EdD831C8BE6CC6f49A429d37134D7Dfb745');

xchangeETH.events.ConvertToHederaMX()
.on("connected", (sub) => {
    console.log("Stable ID: " + sub);
}).on('data', (e) => {
    //console.log(e);
    console.log(e.raw.data);

    let amount = parseInt(e.raw.data);
    console.log("VALUE: ");
    console.log(e.returnValues._amount);
    console.log(e.returnValues._hederaAddress);
    console.log(amount);
    let params = new ContractFunctionParams()
        .addAddress(e.returnValues._hederaAddress)
        .addUint256(new BigNumber(parseInt(e.returnValues._amount)));
    let client = lib.createHederaClient(mxOwner, ownerPrKey);
    lib.sendContract(MXx, "convertToHederaMX", params, client).catch(console.log).then((r) => {
        console.log(r.receipt.status);
    });
}).on("changed", (log) => {
    console.log(log);
});

let lastMxxEventSize = 0;
let mxxEvents = () => {
    rp(dragonglassRequestEvents).catch(console.log).then((r) => {
        let events = [];
        console.log("Event count", r.data.length, typeof(r.data.length), lastMxxEventSize);
        for(x in r.data) {
            //console.log("ELEM", x);
            //console.log(r.data[x].transactionID);
            //console.log(typeof(r.data[x].transactionID));
            let amount = parseInt(r.data[x].events[1].topics[2], 16);
            let eventsData = r.data[x].events[1].data;

            let addressLong = String.fromCharCode.apply(null, Buffer.from(eventsData, "hex")); 
            let address = addressLong.slice(addressLong.indexOf("*") + 1, addressLong.indexOf("*") + 43);
            let hederaTXID = r.data[x].transactionID;

            //console.log(amount, address);
            let currentEvent = [address, amount, hederaTXID];
            events.push(currentEvent);
        }

        var payMXSellers = (counter, prevNonce) => {
            changeFromETH.methods.convertToBytes32(events[counter - 1][2]).call({from : ethAddr}).catch(console.log).then((resu) => {
                //console.log(resu);
                changeFromETH.methods.ethTXPayStatus(resu).call({from : ethAddr}).catch(console.log).then((re) => {
                    //console.log("ETH: paid hedera sell", re, counter);
                    if(!re) {
                        const contractFunction = changeFromETH.methods.convertFromHederaMX(events[counter - 1][0], events[counter - 1][1] * 10000, events[counter - 1][2]);
                        const functionAbi = contractFunction.encodeABI();
            
                        ethTX.setTx(20000000000, 3000000, '0x17070EdD831C8BE6CC6f49A429d37134D7Dfb745', functionAbi, 3, ethPrKey, prevNonce, (err, res) => {
                            if(!err) {
                                counter--;
                                lastMxxEventSize++;
                                console.log("Send fund to:", counter);
                                if(counter > 0) {
                                    prevNonce++;
                                    payMXSellers(counter, prevNonce);
                                }
                            } else {
                                console.log(err);
                            }
                        });
                    } else {
                        counter--;
                        if(counter > 0) {
                            payMXSellers(counter, prevNonce);
                        }
                    }
                });
            });
        }

        if(r.data.length > lastMxxEventSize) {
            
            let newEventCount = r.data.length - lastMxxEventSize;
            console.log("We have " + newEventCount + " new events");
            /*
            for(let i = 0; i < newEventCount; i++) {
                console.log(events[i]);
            }

*/
            web3.eth.getTransactionCount(ethAddr, (error, result) => {
                if(!error) {
                    payMXSellers(newEventCount, result);
                } else {
                    console.log("GET NONCE ERROR", error);
                }
            });
        }
    });
}

mxxEvents();
setInterval(mxxEvents, 60000);

  
module.exports = router;
