//@@TODO use catch() before then()

const {
    Client, FileCreateTransaction, ContractCreateTransaction, Hbar, Ed25519PrivateKey,
    ContractFunctionParams, ContractCallQuery, ContractExecuteTransaction, CryptoTransferTransaction
} = require("@hashgraph/sdk");
const StringDecoder = require('string_decoder').StringDecoder;
const BigNumber = require("bignumber.js");
const lib = require('./lib');
const rp = require('request-promise');
const requestOptions = {
    method: 'GET',
    uri: 'https://api.coingecko.com/api/v3/simple/price?ids=hedera-hashgraph%2Cbitcoin&vs_currencies=usd'
};

var express = require('express');
var app = express();
var router = express.Router();
const MXContractId = "0.0.193972";
const TestUsers = "0.0.192457";
const TestCredit = "0.0.192463";
const mxOwner = "0.0.32592";
const mxDex = "0.0.198981";
const ownerPrKey = "...";
let hbarPrice = 0;

getHbarPrice();

router.get('/', function(req, res){
    res.render('view', {
        page : "main"
    });
});

router.get('/admin', function(req, res) {
    res.render('admin');
});
/*
router.get('/dex', function(req, res) {
    res.render('dex');
});
*/
router.post('/client', (req, res) => {
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
        
        const client = lib.createHederaClient(accountID, privateKey);
        if(client[1] != "ERROR") {
            let httpRes = 0;
            let accountNumber = lib.accountNumber(accountID);
            console.log(accountNumber);
            let address = lib.solidityAddress(parseInt(accountNumber));
            console.log(address);
            let params = new ContractFunctionParams().addAddress(address);
            client.getAccountBalance(accountNumber).catch((e) => {
                console.log("CATCH at getAccountBalance: " + e);
                res.send("ERROR");
                httpRes = 1;
            }).then((result) => {
                if(httpRes == 0) {
                    let hbarBalance = result.toString();
                    console.log("GET MX balance");
                    lib.callContract(MXContractId, "balanceOf", params, client).catch((err) => {
                        console.log("CATCH at get MX balance: " + err);
                        if(httpRes == 0) res.send("ERROR");
                        httpRes = 2;
                    }).then((r) => {
                        //console.log(r.getUint256(0).toString());
                        let mxBalance = r.getUint256(0).toString();
                        if(httpRes == 0) {
                            lib.callContract(TestUsers, "checkUsersAddress", params, client).catch((er) => {
                                console.log("CATCH at isUserByAddress: " + er);
                                if(httpRes == 0) res.send("ERROR");
                                httpRes = 5;
                            }).then((result1) => {
                                
                                let isUser = result1.getBool(0);
                                console.log("Is user: " + isUser);
                                if(!isUser) {
                                    if(httpRes == 0) res.send(hbarBalance + "---" + mxBalance + "&&&You are not registered!" + "///" + hbarPrice);
                                    httpRes = 7;
                                    console.log("RES: " + httpRes);
                                }
                                if(httpRes == 0 && isUser) {
                                    lib.callContract(TestUsers, "getUserByAddress", params, client).catch((error) => {
                                        console.log("CATCH at getUserByAddress: " + error);
                                        if(httpRes == 0) res.send("ERROR");
                                        httpRes = 3;
                                    }).then((resu) => {
                                        console.log("RES: " + httpRes);
                                        let userId = resu.getInt256(0);
                                        let params1 = new ContractFunctionParams()
                                            .addUint256(userId);
                                        lib.callContract(TestUsers, "getUserPublicData", params1, client).catch((erro) => {
                                            console.log("CATCH at getUserPublicData: " + erro);
                                            if(httpRes == 0) res.send("ERROR");
                                            httpRes = 4;
                                        }).then((resul) => {
                                            let scoreFromSC = resul.getUint256(0).toString();
                                            let scoreToUI = parseInt(scoreFromSC) > 0 ? scoreFromSC : "You are not verified yet!"; 
                                            //create object for res.send
                                            console.log(hbarPrice);
                                            if(httpRes == 0) res.send(hbarBalance + "---" + mxBalance + "&&&" + scoreToUI + "///" + hbarPrice);
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
    });
});

router.post('/faucet', (req, res) => {
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();
        let privateKey = ownerPrKey;
        let accountID = mxOwner;
        let client = lib.createHederaClient(accountID, privateKey);
        if(client[1] != "ERROR") {
            let address = buffer.slice(('=') + 1);
            console.log(address);
            lib.sendFromContract(address, MXContractId, client).then((result) => {
                console.log(result);
                res.send(result);
            });
        } else {
            res.send("ERROR");
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
        if(client[1] != "ERROR") {
            let sum = parseInt(amount);
            let response = "";
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
        console.log(buffer);
        let privateKey = clientData[0].slice(clientData[0].indexOf('=') + 1);
        let accountID = clientData[1].slice(clientData[1].indexOf('=') + 1);
        let address = clientData[2].slice(clientData[2].indexOf('=') + 1);
        let amount = clientData[3].slice(clientData[3].indexOf('=') + 1);
        let client = lib.createHederaClient(accountID, privateKey);
        if(client[1] != "ERROR") {
            let accountNumber = lib.accountNumber(address);
            console.log(accountNumber);
            let hexAddress = lib.solidityAddress(parseInt(accountNumber));
            console.log(address);
            let sum = new BigNumber(amount);
            let params = new ContractFunctionParams()
                .addAddress(hexAddress)
                .addUint256(sum);
            lib.sendContract(MXContractId, "transfer", params, client).then((result) => {
                res.send(result);
            });    
        } else {
            res.send("ERROR");
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
        console.log(buffer);
        let privateKey = clientData[0].slice(clientData[0].indexOf('=') + 1);
        let accountID = clientData[1].slice(clientData[1].indexOf('=') + 1);
        let name = clientData[2].slice(clientData[2].indexOf('=') + 1);
        let birth = clientData[3].slice(clientData[3].indexOf('=') + 1);
        let mother = clientData[4].slice(clientData[4].indexOf('=') + 1);
        let id = clientData[5].slice(clientData[5].indexOf('=') + 1);
        let country = clientData[6].slice(clientData[6].indexOf('=') + 1);
        let city = clientData[7].slice(clientData[7].indexOf('=') + 1);
        let address = clientData[8].slice(clientData[8].indexOf('=') + 1);
        let email = clientData[9].slice(clientData[9].indexOf('=') + 1);
        let phone = clientData[10].slice(clientData[10].indexOf('=') + 1);

        let client = lib.createHederaClient(accountID, privateKey);
        if(client[1] != "ERROR") {
            let age = new BigNumber(parseInt(birth));
            let docID = new BigNumber(parseInt(id));
            let phoneNumber = new BigNumber(parseInt(phone));
            let personalID = new BigNumber(parseInt(Math.random() * 10000));
            console.log("Personal ID: " + personalID); //SHOULD delete this line
            
            let params = new ContractFunctionParams()
                .addString(name)
                .addUint256(age)
                .addString(mother)
                .addUint256(docID)
                .addUint256(personalID)
                .addString(country)
                .addString(city)
                .addString(address)
                .addString(email)
                .addUint256(phoneNumber);
            lib.sendContract(TestUsers, "registerUser", params, client).then((result) => {
                res.send(result);
            });    
        } else {
            res.send("ERROR");
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
        console.log(buffer);
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
        if(client[1] != "ERROR") {
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
            lib.sendContract(MXContractId, "approve", args, client).then((re) => {
                console.log("ALLOWANCE");
                console.log(re);
                lib.sendContract(TestCredit, "createCreditOffer", params, client).then((result) => {
                    res.send(result);
                }); 
            });   
        } else {
            res.send("ERROR");
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
        console.log(buffer);
        let privateKey = clientData[0].slice(clientData[0].indexOf('=') + 1);
        let accountID = clientData[1].slice(clientData[1].indexOf('=') + 1);
        let allowance = clientData[2].slice(clientData[2].indexOf('=') + 1);
        let amount = clientData[3].slice(clientData[3].indexOf('=') + 1);
        let type = clientData[4].slice(clientData[4].indexOf('=') + 1);
        let length = clientData[5].slice(clientData[5].indexOf('=') + 1);
        let periods = clientData[6].slice(clientData[6].indexOf('=') + 1);
        let interest = clientData[7].slice(clientData[7].indexOf('=') + 1);
        let last = clientData[8].slice(clientData[8].indexOf('=') + 1);
        
        let client = lib.createHederaClient(accountID, privateKey);
        if(client[1] != "ERROR") {
            let accountNumber = lib.accountNumber(TestCredit);
            let hexAddress = lib.solidityAddress(parseInt(accountNumber));
            console.log(hexAddress);
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
            lib.sendContract(MXContractId, "approve", args, client).then((re) => {
                console.log("ALLOWANCE");
                console.log(re);
                lib.sendContract(TestCredit, "createCreditClaim", params, client).then((result) => {
                    res.send(result);
                }); 
            });   
        } else {
            res.send("ERROR");
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
        }).then((result) => {
            //console.log("CREDITOFFERSCOUNT");
            //console.log(result.getUint256(0).toString());
            offersCount = result.getUint256(0);
            counter = 0;
            if(offersCount > 0) getCreditOffers(counter, offersCount);
            else res.send("There is no offer");
        });

        getCreditOffers = (counter, offersCount) => {
            let params2 = new ContractFunctionParams()
            .addUint256(new BigNumber(counter));
            lib.callContract(TestCredit, "creditOffers", params2, client).catch((er) => {
                console.log("CATCH at creditOffers: " + er);
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
            res.send("ERROR");
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
        console.log(buffer);
        let privateKey = clientData[0].slice(clientData[0].indexOf('=') + 1);
        let accountID = clientData[1].slice(clientData[1].indexOf('=') + 1);
        let allowance = clientData[2].slice(clientData[2].indexOf('=') + 1);
        let offerID = clientData[3].slice(clientData[3].indexOf('=') + 1);
        let amount = clientData[4].slice(clientData[4].indexOf('=') + 1);
        
        let client = lib.createHederaClient(accountID, privateKey);
        if(client[1] != "ERROR") {
            let accountNumber = lib.accountNumber(TestCredit);
            let hexAddress = lib.solidityAddress(parseInt(accountNumber));
            console.log(hexAddress);
            let args = new ContractFunctionParams()
            .addAddress(hexAddress)
            .addUint256(new BigNumber(allowance));
            let params = new ContractFunctionParams()
            .addUint256(new BigNumber(offerID))
            .addUint256(new BigNumber(amount));
            lib.sendContract(MXContractId, "approve", args, client).then((re) => {
                console.log("ALLOWANCE");
                console.log(re);
                lib.sendContract(TestCredit, "acceptCreditOffer", params, client).then((result) => {
                    res.send(result);
                }); 
            }); 
        } else {
            res.send("ERROR");
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
                console.log("CATCH at creditClaimCounter: " + e);
            }).then((result) => {
                //console.log("CREDITCLAIMSCOUNT");
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
                }).then((re) => {
                    //console.log(res.getUint256(0).toString() + " " + res.getUint256(2).toString() + " " + res.getUint256(4).toString());
                    let borrower = re.getUint256(0).toString();
                    let amount = re.getUint256(2).toString();
                    let length = re.getUint256(4).toString();
                    let periods = re.getUint256(5).toString();
                    let interest = re.getUint256(6).toString();
                    let score = re.getUint256(7).toString();
                    let last = re.getUint256(8).toString();
                    claims[counter] = {borrower, amount, length, periods, interest, score, last};
                    counter++;
                    if(counter < claimsCount) {
                        //console.log("Counter: " + counter + " claimCount: " + claimsCount);
                        getCreditClaims(counter, claimsCount);
                    } else {
                        res.send(JSON.stringify(claims));
                    }
                });
            }
        } else {
            res.send("ERROR");
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
        console.log(buffer);
        let privateKey = clientData[0].slice(clientData[0].indexOf('=') + 1);
        let accountID = clientData[1].slice(clientData[1].indexOf('=') + 1);
        let claimID = clientData[2].slice(clientData[2].indexOf('=') + 1);
        let amount = clientData[3].slice(clientData[3].indexOf('=') + 1);
        
        let client = lib.createHederaClient(accountID, privateKey);
        if(client[1] != "ERROR") {
            let accountNumber = lib.accountNumber(TestCredit);
            let hexAddress = lib.solidityAddress(parseInt(accountNumber));
            console.log(hexAddress);
            let args = new ContractFunctionParams()
            .addAddress(hexAddress)
            .addUint256(new BigNumber(amount));
            let params = new ContractFunctionParams()
            .addUint256(new BigNumber(claimID))
            .addUint256(new BigNumber(amount));
            lib.sendContract(MXContractId, "approve", args, client).then((re) => {
                console.log("ALLOWANCE");
                console.log(re);
                lib.sendContract(TestCredit, "acceptCreditClaim", params, client).then((result) => {
                    res.send(result);
                }); 
            }); 
        } else {
            res.send("ERROR");
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
        console.log(buffer);
        let privateKey = clientData[0].slice(clientData[0].indexOf('=') + 1);
        let accountID = clientData[1].slice(clientData[1].indexOf('=') + 1);
        
        let client = lib.createHederaClient(accountID, privateKey);
        if(client[1] != "ERROR") {
            let myCredits = [];
            let accountShort = lib.accountNumber(accountID);
            let address2 = lib.solidityAddress(parseInt(accountShort));
            let params = new ContractFunctionParams()
            .addAddress(address2);
            lib.callContract(TestUsers, "getUserByAddress", params, client).then((resu) => {
                console.log("GETUSERSBYADDRESS");
                let userId = resu.getUint256(0);
                console.log(userId.toString());
                
                let params3 = new ContractFunctionParams()
                    .addUint256(userId);
                lib.callContract(TestUsers, "getUserPublicData", params3, client).then((r) => {
                    console.log("GETUSERPUBLICDATA");
                    console.log(r.getUint256(0).toString() + " " + (r.getUint256(2)/365/24/3600).toString() + " " + r.getUint256(5).toString());
                    let myCreditCounter = r.getUint256(5).toString();
                    let counter = 0;
                    getMyCredits(counter, myCreditCounter, client);
                });
            });

            getMyCredits = (counter, myCreditCounter, client) => {
                let params5 = new ContractFunctionParams()
                    .addUint256(new BigNumber(counter));
                lib.callContract(TestUsers, "getMyCredit", params5, client).then((re) => {
                    let creditAddress = re.getAddress(0).toString();
                    if(creditAddress != "0000000000000000000000000000000000000000") {
                        let hederaAddress = parseInt(creditAddress.slice(creditAddress.lastIndexOf("000000") + 1), 16);
                        lib.callContractNoArgs(hederaAddress, "getAllDetails", client).then((result) => {
                            console.log("Mycredit (" + counter + ") " + creditAddress);
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
                                res.send(JSON.stringify(myCredits));
                            }
                        });
                    }
                });
            }
        } else {
            res.send("ERROR");
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
        let userId = clientData[0].slice(clientData[0].indexOf('=') + 1);
        console.log(userId)

        let response = [];
        let params = new ContractFunctionParams()
            .addUint256(new BigNumber(userId));
        const client = lib.createHederaClient(mxOwner, ownerPrKey);
        if(client[1] != "ERROR") {
            lib.callContract(TestUsers, "getUserPrivateData1", params, client).catch((error) => {
                console.log("ERROR at getUserPrivateData1: " + error);
            }).then((result) => {
                //console.log(result);
                response[0] = result.getString(0);
                response[1] = result.getUint256(1);
                response[2] = result.getString(2);
                response[3] = result.getUint256(3);
                response[4] = result.getUint256(4);
                lib.callContract(TestUsers, "getUserPrivateData2", params, client).catch((err) => {
                    console.log("ERROR at getUserPrivateData2: " + err);
                }).then((resul) => {
                    response[5] = resul.getString(0);
                    response[6] = resul.getString(1);
                    response[7] = resul.getUint256(2);
                    lib.callContract(TestUsers, "getUserPublicData", params, client).catch((er) => {
                        console.log("ERROR at getUserPublicData: " + er);
                    }).then((resu) => {
                        response[8] = resu.getUint256(0);
                        response[9] = resu.getUint256(1);
                        response[10] = resu.getUint256(2);
                        response[11] = resu.getString(3);
                        response[12] = resu.getString(4);
                        response[13] = resu.getUint256(5);
                        lib.callContract(TestUsers, "getPendingUser", params, client).catch((e) => {
                            console.log("ERROR at getPendingUser: " + e);
                        }).then((re) => {
                            response[14] = re.getBool(0);
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
        let userId = clientData[0].slice(clientData[0].indexOf('=') + 1);
        console.log(userId)

        let params = new ContractFunctionParams()
            .addUint256(new BigNumber(userId));
        const client = lib.createHederaClient(mxOwner, ownerPrKey);
        if(client[1] != "ERROR") {
            lib.sendContract(TestUsers, "setChecked", params, client).catch((error) => {
                console.log("ERROR at setChecked: " + error);
                res.send("ERROR: " + error);
            }).then((result) => {
                console.log(result);
                res.send(result.receipt.status);
            });
        }
    });
});  

router.post('/dexBidAccept', (req, res) => {
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
        let price = clientData[3].slice(clientData[3].indexOf('=') + 1);
        let last = clientData[4].slice(clientData[4].indexOf('=') + 1);
        //console.log(userId)
        let toPay = amount * price;
        let params = new ContractFunctionParams()
            .addUint256(new BigNumber(amount))
            .addUint256(new BigNumber(price))
            .addUint256(new BigNumber(last));
        const client = lib.createHederaClient(accountID, privateKey);
        if(client[1] != "ERROR") {
            lib.sendContractPayable(mxDex, toPay, "setOrderHbarBid", params, client).catch((error) => {
                console.log("ERROR at setOrderHbarBid: " + error);
                res.send("ERROR: " + error);
            }).then((result) => {
                console.log(result);
                res.send(result.receipt.status);
            });
        }
    });
});  

router.post('/dexAskAccept', (req, res) => {
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
        let price = clientData[3].slice(clientData[3].indexOf('=') + 1);
        let last = clientData[4].slice(clientData[4].indexOf('=') + 1);
        //console.log(userId)
        let accountNumber = lib.accountNumber(mxDex);
        let hexAddress = lib.solidityAddress(parseInt(accountNumber));
        let params = new ContractFunctionParams()
            .addAddress(hexAddress)
            .addUint256(new BigNumber(amount));
       
        let params1 = new ContractFunctionParams()
            .addUint256(new BigNumber(amount))
            .addUint256(new BigNumber(price))
            .addUint256(new BigNumber(last));
        const client = lib.createHederaClient(accountID, privateKey);
        if(client[1] != "ERROR") {
            lib.sendContract(MXContractId, "approve", params, client).catch((error) => {
                console.log("ERROR at approve: " + error);
                res.send("ERROR: " + error);
            }).then((result) => {
                console.log("Approve: " + result.receipt.status);
                                         
                lib.sendContract(mxDex, "setOrderHbarAsk", params1, client).catch((erro) => {
                    console.log("ERROR at setOrderHbarAsk: " + erro);
                    res.send("ERROR: " + erro);
                }).then((resul) => {
                    console.log("Set ask: " + resul.receipt.status);
                    res.send(resul.receipt.status);
                });
            });
        }
    });
});  

router.get('/getDexOrders', (req, res) => {
    const client = lib.createHederaClient(mxOwner, ownerPrKey);
    if(client[1] != "ERROR") {
        let counter = 0;
        lib.callContractNoArgs(mxDex, "orderCounter", client).catch((error) => {
            console.log("ERROR at orderCounter: " + error);
            res.send("ERROR: " + error);
        }).then((result) => {
            let orderCount = result.getUint256(0);
            console.log("ORDER NUM: " + orderCount.toString());
            let response = [];
            //console.log(r.getUint256(7).toString());
            getOrders(counter, orderCount, response);
        });
    }   

    getOrders = (counter, orderCount, response) => {
        let params = new ContractFunctionParams()
            .addUint256(new BigNumber(counter));
        lib.callContract(mxDex, "orders", params, client).catch((e) => {
            console.log("ERROR at orders: " + e);
            res.send("ERROR: " + e);
        }).then((r) => {
            console.log("ORDER details " + counter + " : " + r.getUint256(0).toString() + " " + r.getUint256(1).toString() + " " + r.getUint256(7).toString());
            let details = {};
            details.id = counter;
            details.type = r.getUint256(0) > 0 ? "Ask" : "Bid";
            details.amount = parseInt(r.getUint256(2));
            details.price = parseInt(r.getUint256(3));
            details.last = r.getUint256(4);
            details.owner = r.getAddress(6);
            response.push(details);
            counter ++;
            if(counter < orderCount) {
                getOrders(counter, orderCount, response);
            } else {
                res.send(response);
            }
        });
    }
});

router.post('/dexHitMarket', (req, res) => {
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
        let orderId = clientData[2].slice(clientData[2].indexOf('=') + 1);
        let amount = clientData[3].slice(clientData[3].indexOf('=') + 1);
        let price = clientData[4].slice(clientData[4].indexOf('=') + 1);
        let type = clientData[5].slice(clientData[5].indexOf('=') + 1);
        console.log("Hit details: " + orderId + " : " + amount + " " + price + " " + type);

        let params1 = new ContractFunctionParams()
        .addUint256(new BigNumber(orderId))
        .addUint256(new BigNumber(amount))
        .addUint256(new BigNumber(100))
        .addUint256(new BigNumber(400));


        let hitBid = (amount, params1) => {
            let accountNumber = lib.accountNumber(mxDex);
            let hexAddress = lib.solidityAddress(parseInt(accountNumber));
            let params = new ContractFunctionParams()
                .addAddress(hexAddress)
                .addUint256(new BigNumber(amount));

            lib.sendContract(MXContractId, "approve", params, client).catch((error) => {
                console.log("ERROR at approve: " + error);
                res.send("ERROR: " + error);
            }).then((result) => {
                console.log("Approve: " + result.receipt.status);
                                         
                lib.sendContract(mxDex, "acceptBidHbar", params1, client).catch((erro) => {
                    console.log("ERROR at acceptBidHbar: " + erro);
                    res.send("ERROR: " + erro);
                }).then((resul) => {
                    console.log("Hit bid: " + resul.receipt.status);
                    res.send(resul.receipt.status);
                });
            });
        }

        let hitAsk = (amount, params1) => {
            let toPay = amount * price;
            console.log(toPay + " type: " + typeof(toPay));
            lib.sendContractPayable(mxDex, toPay, "acceptAskHbar", params1, client).catch((error) => {
                console.log("ERROR at acceptAskHbar: " + error);
                res.send("ERROR: " + error);
            }).then((result) => {
                console.log("Hit ask: " + result.receipt.status);
                res.send(result.receipt.status);
            });
        }

        const client = lib.createHederaClient(accountID, privateKey);
        if(client[1] != "ERROR") {
            switch(type) {
                case "Bid" : hitBid(amount, params1);
                    break;
                case "Ask" : hitAsk(amount, params1);
                    break;
                default : console.log("NO ORDER TYPE!");
            }
        }
    });
});  

router.post('/', function(req, res){
   res.send('POST route on things.');
});

setInterval(getHbarPrice, 10000);

parseJsonToObject = (str) => {
    try {
        let obj = JSON.parse(str);
        return obj;
    } catch(e) {
        return e;
    }
}
  
function getHbarPrice() {
  rp(requestOptions).catch((err) => {
    console.log('API call error:', err.message);
  }).then(response => {
    let priceObj = parseJsonToObject(response);
    console.log(priceObj["hedera-hashgraph"].usd);
    let HbarUSD = parseFloat(priceObj["hedera-hashgraph"].usd);
    let Hederaprice = 100 / HbarUSD * 10000;
    console.log(Hederaprice);
    hbarPrice = parseInt(Hederaprice);
  });
}
  
module.exports = router;
