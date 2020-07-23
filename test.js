let privateKey = "";
let currentAccount = "";
let currentMXBalance;
let currentHbarBalance;
let ethAddr;
let logged = 0;
let score = "You are not registered!";
let hbarPrice = 0;
let loginKeyFile = "";

let currentTab = $("#main");
let lastTab = $("#loan-claims");
let prevMxx = $("#credit-offer-btn");
let prevMX = $("#send-receive-btn");
//console.log(paypal_sdk);

window.onbeforeunload = function () {
    if(logged == 1) {
        return 'Are you sure you want to leave?';
    }
}

$(window).on("load", () => {
    //console.log(currentAccount);
    $("#login-modal").show();
});

if (typeof window.ethereum !== 'undefined') {
    console.log('MetaMask is installed!');
}

ethereum.request({ method: 'eth_requestAccounts' }).catch(console.log).then(res => {
    ethAddr = res[0];
    console.log(res);
    console.log(ethAddr);
});

if(typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
    console.log(web3.currentProvider);
    console.log(web3.version);
} else {
    console.error('web3 was undefined');
}

const ST6Address = '0x646c49b692cea87aa4dbb13f34346fa781067f21';
const stable = new web3.eth.Contract(erc20_abi, ST6Address);
const changeFromETH = new web3.eth.Contract(abi, '0x17070EdD831C8BE6CC6f49A429d37134D7Dfb745');

let buyMXPrice = 0;
let sellMXPrice = 0;
let buyUSDPrice = 0;
let sellUSDPrice = 0;
let MXPrices = {};

let getHbarPrice = () => {
    $.get('getHbarPrice', (data, status) => {
        //console.log(data);
        MXPrices = JSON.parse(data);
        //console.log(MXPrices);
        buyMXPrice = parseInt(MXPrices.hbar) * 101 / 100;
        sellMXPrice = parseInt(MXPrices.hbar) * 99 / 100;
        /*
        let buyMXPriceHbar = buyMXPrice / 100000000;
        let sellMXPriceHbar = sellMXPrice / 100000000;
        console.log("MX:", buyMXPrice);
        $("#buy-mx-price").html("Current buy price: " + buyMXPriceHbar.toFixed(4) + " hbars");
        $("#sell-mx-price").html("Current sell price: " + sellMXPriceHbar.toFixed(4) + " hbars");*/
        buyUSDPrice = parseInt(MXPrices.usd) * 1005 / 1000;
        sellUSDPrice = parseInt(MXPrices.usd) * 995 / 1000;;
    });
}

getHbarPrice();

$("#login-btn").click(() => {
    //console.log("LOGIN");
    let login = (privateKey, currentAccount) => {
        if(privateKey && currentAccount) {
            refreshAccount(privateKey, currentAccount, (err, res) => {
                if(!err) {

                    $("#login-acc").val("");
                    $("#login-prkey").val("");
                    $("#login-modal").hide();
                } else {
                    $("#login-acc").val("");
                    $("#login-prkey").val("");
                    $("#login-error").html("HIBA, probáld újra");
                }
            });
        } else {
            $("#login-error").html("Hiányzó számlaszám vagy privátkulcs!");
        }  
    }

    if($("#login-acc").val() && $("#login-prkey").val()) {
        //console.log("MACI");
        currentAccount = $("#login-acc").val();
        privateKey = $("#login-prkey").val();
        login(privateKey, currentAccount);
    } else {
        //var file = $('#login-key').prop('files')[0];
        //$("#choosen-key").html(file.name);
        //console.log(file);
        var reader = new FileReader();
        reader.readAsText(loginKeyFile, 'UTF-8');
        reader.onload = (evt) => {
            let key = JSON.parse(evt.target.result);
            console.log(key[0]);
            currentAccount = key[0].shard + "." + key[0].realm + "." + key[0].account;
            privateKey = key[1];
            login(privateKey, currentAccount);
        }
        loginKeyFile = "";
    } 
});

$("#login-key").change(() => {
    loginKeyFile = $('#login-key').prop('files')[0];
    $("#choosen-key").html(loginKeyFile.name);
});
/*
$("#login-with-key").click(() => {
    var file = $('#login-key').prop('files')[0];
    var reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    reader.onload = (evt) => {
        let key = JSON.parse(evt.target.result);
        console.log(key[0]);

        refreshAccount(privateKey, currentAccount, (err, res) => {
            if(!err) {
                $("#login-acc").val("");
                $("#login-prkey").val("");
                $("#login-modal").hide();
            } else {
                $("#login-acc").val("");
                $("#login-prkey").val("");
                $("#login-error").html("HIBA, probáld újra");
            }
        });
    }
});*/

$("#main-tab").click(() => {
    $("#wallet").attr("class", "section type-4 p-3 d-none");
    $("#lender").attr("class", "section type-4 p-3 d-none");
    $("#borrower").attr("class", "section type-4 p-3 d-none");
    $("#main").attr("class", "section type-4 p-3 d-block");
    currentTab = $("#main");
    console.log(currentTab);
});

let walletClick = (id) => {
    $(".mx-button").attr("class", "btn btn-secondary mx-button");
    $('#qrcode').empty();
    currentTab.attr("class", "section type-4 p-3 d-none");
    lastTab.attr("class", "d-none");
    $(id).attr("class", "d-block");
    $("#wallet").attr("class", "section type-4 p-3 d-block");
    currentTab = $("#wallet");
    lastTab = $(id);
    $('#qrcode').qrcode({width: 128, height: 128, text: currentAccount});
    $('#qrcode').show();
} 

$(".wallet-tab").click(() => {
    console.log("WALLET");
    /*
    $("#change").attr("class", "d-none");
    */
    walletClick("#tx");
    $("#wallet-title").html("Maxit/Hbar küldése, fogadása");
});

$(".lender-tab").click(() => {
    currentTab.attr("class", "section type-4 p-3 d-none");
    lastTab.attr("class", "d-none");
    $("#lender").attr("class", "section type-4 p-3 d-block");
    $("#loan-claims").attr("class", "d-block");
    $("#lending-title").html("Kölcsönadó - Hitel kérelmek");
    listClaims("lender-main");
    currentTab = $("#lender");
    lastTab = $("#loan-claims");
    prevMX.attr("class", "btn btn-secondary mx-button");
    $("#loan-claims-btn").attr("class", "btn btn-dark mx-button");
    prevMX = $("#loan-claims-btn");
});

$(".borrower-tab").click(() => {
    currentTab.attr("class", "section type-4 p-3 d-none");
    lastTab.attr("class", "d-none");
    $("#borrower").attr("class", "section type-4 p-3 d-block");
    $("#loan-offers").attr("class", "d-block");
    $("#borrower-title").html("Kölcsönvevő - Hitel ajánlatok"); 
    listOffers("borrower-main");
    currentTab = $("#borrower");    
    lastTab = $("#loan-offers");
    prevMX.attr("class", "btn btn-secondary mx-button");
    $("#loan-offers-btn").attr("class", "btn btn-dark mx-button");
    prevMX = $("#loan-offers-btn");
});

refreshAccount = (privateKey, currentAccount, callback) => {
    console.log("ACCOUNT:", currentAccount);
    $.post('client', {"pr" : privateKey, 'acc' : currentAccount}, function(data, status) {
        //console.log("ACCOUNT:");
        //console.log(data);
        //console.log(status);
        if(status == "success" && data.slice(0,5) != "ERROR") {
            let clientData = JSON.parse(data);
            console.log(clientData);
            $("#address").html("Számla: " + currentAccount);
            $("#hbar-balance").html(parseFloat(clientData.hbarBalance).toFixed(2) + " Hbar");
            $("#mx-balance").html(clientData.mxBalance + " MX");
            currentMXBalance = clientData.mxBalance;
            currentHbarBalance = clientData.hbarBalance;
            logged = 1;
            score = clientData.registration;
            if(score > 0) {
                $("#personal-info-text").html("Módosítás");
                $("#reg-user").attr("class", "d-none");
                $("#score").html("Hitelminősítés: " + clientData.registration);
            } else {
                if(score == "You are not registered!") {
                    $("#score").html("Hitelminősítés: nem regisztrált felhasználó");
                } else {
                    $("#score").html("Hitelminősítés: regisztráció megerősítés alatt");
                }
            }
            callback(null, status);
        } else {
            callback(status, data);
        }
    });
}

$("#refresh").click(() => {
    if(privateKey != "" && currentAccount != "") {
        refreshAccount(privateKey, currentAccount, (err, res) => {});
    } else {
        alertModal("Hiányzó számlaszám vagy privátkulcs!");
    }   
});

/*
$("#login-btn").click(() => { 
    $("#disclaimer").show();
    $("#disclaimer-accept-btn").click(() => {
        if($("#login-tab").html() == "Login") {
            console.log("LOGIN");
            
            privateKey = $("#pr-key").val();
            account = "0.0." + $("#account-id").val();
            console.log(privateKey);
            console.log(account);
    
            getBalance('login');
        }  
        $("#disclaimer").hide();
    });
});

$("#disclaimer-run-btn").click(() => {
    $("#disclaimer").hide();
    privateKey = "";
    account = "";
    $("#account-id").val("");
    $("#pr-key").val("");
});

$("#login-tab").click(() => {
    if($("#login-tab").html() == "Logout") {
        console.log("LOGOUT");
        privateKey = "";
        account = "";
        $("#account-id").val("");
        $("#pr-key").val("");
        $("#pr-key-reg").val("");
        $("#account-id-reg").val("");
        $("#login-tab").html("Login");
        $("#login-card").show();
        $("#acc-tab").attr("class" , "nav-link invisible");
        $("#lend-tab").attr("class" , "nav-link invisible");
        $("#my-offer-claim-tab").attr("class" , "nav-link invisible");
        $("#tx-tab").attr("class" , "nav-link invisible");
        $("#history-tab").attr("class" , "nav-link invisible");
        $("#create-offer-tab").attr("class" , "nav-link invisible");
        $("#offer-claim-tab").attr("class" , "nav-link invisible");
        $("#register-tab").html("My details");
        $("#register-tab").attr("class" , "nav-link invisible");
        $("#my-lendings").empty();
        $("#hedera-details").empty();
        $('#qrcode').empty();
        $("#reg-user").attr("class" , "d-none");
        $("#mod-user").attr("class" , "d-none");
    }     
});

getBalance = (type) => {
    if(privateKey != "" && account != "") {
        $.post('client', {"pr" : privateKey, 'acc' : account}, function(data, status) {
            console.log(data);
            console.log(status);
            let HbarBalance = parseFloat(data.slice(0, data.indexOf('---'))).toFixed(2);
            let MXBalance = data.slice(data.indexOf('---') + 3, data.indexOf('&&&'));
            score = data.slice(data.indexOf('&&&') + 3, data.indexOf('///'));
            hbarPrice = data.slice(data.indexOf('///') + 3);
            if(data != "ERROR") {
                if(type == "login") {
                    logged = 1;
                    $("#login-tab").html("Logout");
                    $("#login-card").hide();
                    $("#acc-tab").attr("class" , "nav-link active visible");
                    $("#lend-tab").attr("class" , "nav-link visible");
                    $("#my-offer-claim-tab").attr("class" , "nav-link visible");
                    $("#tx-tab").attr("class" , "nav-link visible");
                    $("#history-tab").attr("class" , "nav-link visible");
                    $("#create-offer-tab").attr("class" , "nav-link visible");
                    $("#offer-claim-tab").attr("class" , "nav-link visible");
                    $("#register-tab").attr("class" , "nav-link visible");
                    $("#login-tab").attr("class" , "nav-link");
                    $("#login").attr("class" , "tab-pane fade");
                    $("#acc").attr("class" , "tab-pane fade show active");
                    $('#qrcode').qrcode({width: 128, height: 128, text: account});
                    $('#qrcode').show();
                    if(score == "You are not registered!") {
                        $("#reg-user").attr("class" , "visible");
                    }

                    if(score == "You are not verified yet!") {
                        $("#reg-user").attr("class" , "d-none");
                        $("#mod-user").attr("class" , "d-none");
                    }

                    if(score > 0) {
                        $("#register-tab").html("My details");
                        $("#mod-user").attr("class" , "visible");
                    }
                }              

                $(".hedera-address").html("Hedera address " + account);
                $(".hedera-balance").html("Hbar balance " + HbarBalance);
                $(".maxit-balance").html("Maxit balance " + MXBalance);
                $(".my-credit-score").html("Credit score " + score);
                $("#hedera-details").empty();
                $("#hedera-details").append("<tr><td>Hedera address</td><td>" + account + "</td></tr><tr><td>Hedera balance</td><td>" + 
                    HbarBalance + " hbar</td></tr><tr><td>Maxit balance</td><td>" + MXBalance + " MX</td></tr><tr><td>Credit score</td><td id=\"score\">" + score + "</td></tr>");
            } else {
                alert("Wrong account ID or private key");
                privateKey = "";
                account = "0.0.";
                $("#pr-key").val("");
                $("#account-id").val("");
            }
        });
    }
}

$(".refresh-account").click(() => {
    console.log("clicked refresh");
    getBalance('');
});

$("#register-btn").click(() => {
    $("#login-tab").attr("class" , "nav-link");
    $("#login").attr("class" , "tab-pane fade");
    $("#register").attr("class" , "tab-pane fade show active");
    $("#reg-selector").attr("class", "visible");
    $("#reg-user-login").attr("class", "d-none");
    $("#new-acc").attr("class", "d-none");
    $("#reg-user").attr("class" , "d-none");
    $("#register-tab").attr("class" , "nav-link active visible");
});

$("#register-user-btn").click(() => {
    $("#reg-selector").attr("class", "d-none");
    $("#reg-user-login").attr("class", "visible");
});

$("#new-account-btn").click(() => {
    $("#reg-selector").attr("class", "d-none");
    $("#new-acc").attr("class", "visible");
});

$("#login-btn-reg").click(() => {
    
    if($("#login-tab").html() == "Login") {
        console.log("LOGIN");
        
        privateKey = $("#pr-key-reg").val();
        account += $("#account-id-reg").val();
        console.log(privateKey);
        console.log(account);

        getBalance('login-reg');
    }     
});
*/
$("#reg-birth-firstname-copy").click(() => {
    $("#reg-birth-firstname").html($("#reg-firstname").val());
    $("#reg-birth-firstname").val($("#reg-firstname").val());
});

$("#reg-birth-lastname-copy").click(() => {
    $("#reg-birth-lastname").html($("#reg-lastname").val());
    $("#reg-birth-lastname").val($("#reg-lastname").val());
});

$("#reg-submit").click(function() {
    let rFirstName = $("#reg-firstname").val();
    let rLastName = $("#reg-lastname").val();
    let rBirthName = $("#reg-birth-firstname").val() + " " + $("#reg-birth-lastname").val();
    let rBirth = $("#reg-birth-date").val();
    let rBirthFormatted = new Date(rBirth);
    let rBirthDate = (rBirthFormatted.getTime() + ((70 * 365 + 17) * 24 * 60 * 60 * 1000)) / 1000;
    let rMotherFirst = $("#mothers-firstname").val();
    let rMotherLast = $("#mothers-lastname").val();
    let rId = $("#id-number").val();
    let rCitizen = $("#citizen").val();
    let rCountry = $("#country").val();
    let rCity = $("#city").val();
    let rAddress = $("#residental-address").val();
    let rEmail = $("#email-address").val();
    let rPhone = $("#phone-number").val();
    console.log("personal datas: " + rFirstName + " " + rLastName + " " + rBirthName + " " + rBirthDate + " " + rMotherFirst + " " + rMotherLast + " " + rId + " " + rCitizen + " "
          + rCountry + " " + rCity + " " + rAddress + " " + rEmail + " " + rPhone);
    //user(rName, rBirthDate, rMother, rId, rCountry, rCity, rAddress, rEmail, rPhone, rKey, TestUsersAbi);
    $.post("register", {"pr" : privateKey, "acc" : currentAccount, "firstname" : rFirstName, "lastname" : rLastName, "birthday" : rBirthDate, "motherfirstname" : rMotherFirst, "motherlastname" : rMotherLast, "id" : rId, "citizen" : rCitizen, "country" : rCountry, "city" : rCity, "address" : rAddress, "email" : rEmail, "phone" : rPhone, "birthName" : rBirthName}, function(data, status) {
        console.log(data);
        console.log(data.receipt.status);
        if(data.receipt.status == "SUCCESS") {
            $("#score").html("Hitelminősítés: regisztráció megerősítés alatt");
           // $("#reg-user").empty();
            $("#reg-user").html("Hamarosan ellenőrzött felhasználó leszel");
            score = 0;
            $("#reg-firstname").val("");
            $("#reg-lastname").val("");
            $("#reg-birth-firstname").html("");
            $("#reg-birth-firstname").val("");
            $("#reg-birth-lastname").html("");
            $("#reg-birth-lastname").val("");
            $("#reg-birth-date").val("");
            $("#mothers-firstname").val("");
            $("#mothers-lastname").val("");
            $("#id-number").val("");
            $("#country").val("");
            $("#citizen").val("");
            $("#city").val("");
            $("#residental-address").val("");
            $("#email-address").val("");
            $("#phone-number").val("");
            $("#private-key").val("");
            alertModal("Sikeres regisztráció");
            $("#register-tab").html("My details");
            $("#register").attr("class" , "tab-pane fade");
            $("#acc").attr("class" , "tab-pane fade show active");
            $("#reg-user").attr("class" , "d-visible p-3");
            $("#mod-user").attr("class" , "d-none");
        }

    });
});

let newAcc = [];
$("#new-account").click(() => {
    $.post('createAccount', (data, status) => {
        console.log(data);
        console.log(status);
        if(data[0] == "SUCCESS") {
            $("#new-account-number").html("Számlaszám: " + data[1].shard + "." + data[1].realm + "." + data[1].account);
            $("#new-account-prkey").html("Privát kulcs: " + data[2]);
            $("#new-account-modal").show();
            newAcc.push(data[1]);
            newAcc.push(data[2]);
        }
    });
});

$("#save-new-account").click(() => {
    let fileToSave = new Blob([JSON.stringify(newAcc)], {
        type: 'application/json',
        name: newAcc[0].account + "_key.json"
    });
    let e = document.createEvent('MouseEvents');
    let a = document.createElement('a');

    a.download = newAcc[0].account + "_key.json";
    a.href = window.URL.createObjectURL(fileToSave);
    a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
    e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    a.dispatchEvent(e);
    newAcc = [];
    console.log(newAcc);
});

$("#close-new-account-modal").click(() => {
    $("#new-account-modal").hide();
    $("#register-tab").attr("class" , "d-none");
    $("#new-acc").attr("class", "d-none");
    $("#register").attr("class" , "tab-pane fade");
    $("#login").attr("class" , "tab-pane fade show active");
    $("#login-tab").html("Login");
    $("#login-card").show();
});

var offerNgApp = angular.module("mcApp", []);
offerNgApp.controller("mcCtrl", function($scope) {
    var redeem;
    var totalPayback;
    var profit; 
    $scope.offerAnnumRate = function() {
        if($scope.offerRate) {
            return((annumInterest($scope.offerLength * 86400, $scope.offerPeriods, parseInt($scope.offerRate * 10))).toFixed(2) + "%");
        }
        else return "";
    };
    $scope.offerRedeem = function() {
        redeem = parseInt($scope.offerAmount) * (parseInt($scope.offerRate * 10)) / 1000 / (1 - (1 / (Math.pow(1 + ((parseInt($scope.offerRate * 10)) / 1000), parseInt($scope.offerPeriods)))));
        //redeem = parseInt($scope.offerAmount) * (parseInt($scope.offerRate) * 10) / 1000 / (1 - (1 / (Math.pow(1 + (parseInt($scope.offerRate) * 10) / 1000), parseInt($scope.offerPeriods))));
        if($scope.offerRate) return(parseInt(redeem) + "MX");
        else return "";
    };
    $scope.offerTotalPayback = function() {
        totalPayback = redeem * parseInt($scope.offerPeriods);
        profit = (totalPayback - parseInt($scope.offerAmount)) * 0.9;
        let pay = parseInt($scope.offerAmount) + profit;
        if($scope.offerRate) return(parseInt(pay) + "MX");
        else return "";
    }
    $scope.offerProfit = function() {
        if($scope.offerRate) return(parseInt(profit) + "MX");
        else return "";
    }

    $scope.claimAnnumRate = function() {
        if($scope.claimRate) {
            return((annumInterest($scope.claimLength * 86400, $scope.claimPeriods, parseInt($scope.claimRate * 10))).toFixed(2) + "%");
        }
        else return "";
    };
    $scope.claimAmountToBorrower = function() {
        if($scope.claimAmount) return(parseInt($scope.claimAmount * 995 / 1000) + "MX");
        else return "";
    }
    $scope.claimRedeem = function() {
        redeem = parseInt($scope.claimAmount) * (parseInt($scope.claimRate * 10)) / 1000 / (1 - (1 / (Math.pow(1 + ((parseInt($scope.claimRate * 10)) / 1000), parseInt($scope.claimPeriods)))));
        //redeem = parseInt($scope.offerAmount) * (parseInt($scope.offerRate) * 10) / 1000 / (1 - (1 / (Math.pow(1 + (parseInt($scope.offerRate) * 10) / 1000), parseInt($scope.offerPeriods))));
        if($scope.claimRate) return(parseInt(redeem) + "MX");
        else return "";
    };
    $scope.claimTotalPayback = function() {
        totalPayback = redeem * parseInt($scope.claimPeriods);
        if($scope.claimRate) return(parseInt(totalPayback) + "MX");
        else return "";
    }

    $scope.changeDetails = function() {
        let changeSum;
        let changeType;
        if(!$scope.changeType) {
            changeType = $scope.selectCurrency + "buy";
        } else {
            changeType = $scope.selectCurrency + $scope.changeType;
        }
        let changeDetailsResponse;
        if($scope.changeAmount) {
            switch(changeType) {
                case 'Hbarbuy' : 
                    changeSum = (buyMXPrice * parseInt($scope.changeAmount) / 100000000).toFixed(2);
                    changeDetailsResponse = $scope.changeAmount + " Maxit " + changeSum + " Hbarba kerül";
                    break;
                case 'Hbarsell' :
                    changeSum = (sellMXPrice * parseInt($scope.changeAmount) / 100000000).toFixed(2);
                    changeDetailsResponse = $scope.changeAmount + " Maxitért " + changeSum + " Hbart kapsz";
                    break;
                case 'Tetherbuy' : 
                    changeSum = parseInt($scope.changeAmount) * buyUSDPrice / 10000;
                    changeDetailsResponse = $scope.changeAmount + " Maxit " + changeSum + " Tetherbe kerül";
                    break;
                case 'Tethersell' :
                    changeSum = parseInt($scope.changeAmount) * sellUSDPrice / 10000;
                    changeDetailsResponse = $scope.changeAmount + " Maxitért " + changeSum + " Tethert kapsz";
                    break;
                default:
            }
            return changeDetailsResponse;
        } else return "";
    }
});

$(".send-receive-btn").click(function() {
    walletClick("#tx");
    $("#wallet-title").html("Maxit/Hbar küldése, fogadása");

});

$(".change-btn").click(function() {
    getHbarPrice();
    walletClick("#change")
    $("#wallet-title").html("Maxit váltó");
});

$(".account-info-btn").click(function() {
    walletClick("#account-info")
    $("#wallet-title").html("Számla információ");
});

$(".personal-btn").click(function() {
    //lastTab.attr("class", "d-none");
    //$("#personal").attr("class", "d-block");
    walletClick("#personal");
    console.log(score);
    //Check if a user is registered
    if(score == "You are not registered!") {
        $("#reg-user").attr("class", "d-block");
        $("#mod-user").attr("class", "d-none");
        $("#wallet-title").html("Regisztráció");
    }

    if(score == "You are not verified yet!") {
        $("#reg-user").empty();
        $("#reg-user").html("Hamarosan ellenőrzött felhasználó leszel");
        $("#reg-user").attr("class", "d-block p-3");
        $("#mod-user").attr("class", "d-none");
        $("#wallet-title").html("Regisztráció");
    }

    if(score > 0) {
        $("#reg-user").attr("class", "d-none");
        $("#mod-user").attr("class", "d-block");
        $("#wallet-title").html("Személyes adatok módosítása");
    }
    //if user is registered
    //
    //lastTab = $("#personal");
});

$(".mxx-button").click(function() {
    prevMxx.attr("class", "btn btn-secondary mxx-button w-50");
    $(this).attr("class", "btn btn-dark mxx-button w-50");
    prevMxx = $(this);
});

$(".mx-button").click(function() {
    //console.log("prev MX:", prevMX);
    prevMX.attr("class", "btn btn-secondary mx-button");
    $(this).attr("class", "btn btn-dark mx-button");
    prevMX = $(this);
});

$("#send-btn").click(function() {
    var type = $("select[name=token]").val();
    //var type = $("#token").html();
    var to = $("#send-address").val();
    var amount = $("#send-amount").val();
    //check to, amount
    console.log("Type:", type, "to:", to, "amount:", amount);
    console.log(currentHbarBalance, currentMXBalance);
    console.log(typeof(amount), typeof(currentMXBalance));
    switch(type) {
        case "Maxit" :
            if(parseInt(amount) <= parseInt(currentMXBalance)) {
                $.post('sendMaxit', {"pr" : privateKey, "acc" : currentAccount, "to" : to, "amount" : amount}, function(data, status) {
                    //console.log(data);
                    //console.log(status);
                    if(data.receipt.status == "SUCCESS") {
                        $("#send-address").val("");
                        $("#send-amount").val("");
                        refreshAccount(privateKey, currentAccount, (err, res) => {});
                        alertModal("Sikeres Maxit küldés, " + amount + "MX");
                    } else {
                        alertModal("HIBA: " + data);
                    }
                });
            } else {
                alertModal("Nem rendelkezel ennyi Maxittal!");
            }
            break;
        case "Hbar" :
            if(parseFloat(amount) <= parseFloat(currentHbarBalance)) {
                $.post('sendHbar', {"pr" : privateKey, "acc" : currentAccount, "to" : to, "amount" : amount}, function(data, status) {
                    //console.log(data);
                    //console.log(status);
                    if(data == "SUCCESS") {
                        $("#send-address").val("");
                        $("#send-amount").val("");
                        alertModal("Sikeres Hbar küldés, " + amount + "Hbar");
                        let doNothing = () => {
                            refreshAccount(privateKey, currentAccount, (err, res) => {});
                        };
                        setTimeout(doNothing, 1000);                     
                    } else {
                        alertModal("HIBA: " + data);
                    }
                });
            } else {
                alertModal("Nem rendelkezel ennyi Hbarral!"); 
            }
            break;
        case "" :
            alertModal("Adj meg tokent");
            break;
        default:
    }
});

$("#mxx-btn").click(() => {
    let currency = $("select[name=mx-pairs]").val();
    let type = $("input[name=offer-type]:checked").val();
    let amount = $("#mxx-amount").val();

    //console.log(currency, type, amount);

    switch(type) {
        case "buy" : alertModal(amount + " Maxit vétele " + currency + " révén");
            break;
        case "sell" : alertModal(amount + " Maxit eladása " + currency + "ért");
            break;
        default : alertModal("Válasz, hogy vennél vag yeladnál Maxitot!");
    }
    
    let action = currency + type;

    switch(action) {
        case 'Hbarbuy' : 
            if(amount * buyMXPrice / 100000000 < currentHbarBalance) {
                $.post('buyMX', {'pr' : privateKey, 'acc' : currentAccount, 'amount' : amount}, (data, status) => {
                    console.log(data);
                    console.log(status);
                    if(data.slice(0, 5) != "ERROR") {
                        $("#mxx-amount").val("");
                        $("#change-details").html("");
                        refreshAccount(privateKey, currentAccount, (err, res) => {});
                    } else {
                        alertModal("HIBA: " + data);
                    }
                });
            } else {
                alertModal("Maximum " + parseInt(currentHbarBalance / (buyMXPrice / 100000000)) + " Maxitot tudsz venni");
            }

            break;
        case 'Hbarsell' : 
            if(amount <= currentMXBalance) {
                $.post('sellMX', {'pr' : privateKey, 'acc' : currentAccount, 'amount' : amount}, (data, status) => {
                    console.log(data);
                    console.log(status);
                    if(data.slice(0, 5) != "ERROR") {
                        $("#mxx-amount").val("");
                        $("#change-details").html("");
                        let doNothing = () => {
                            refreshAccount(privateKey, currentAccount, (err, res) => {});
                        };
                        setTimeout(doNothing, 1000);
                    } else {
                        alertModal("HIBA: tranzakció azonosító " + data.slice(78, 110));
                    }
    
                });
            } else {
                alertModal("Maximum " + currentMXBalance + " Maxitot tudsz eladni");
            }

            break;
        case 'Tetherbuy' : 
            let tetherPrice = new BigNumber(parseInt(amount * 10000 * 1005 / 1000));
            let hederaAddress = solidityAddress(parseInt(accountNumber(currentAccount)));
            console.log("hedera address:", hederaAddress);
            stable.methods.approve('0x17070EdD831C8BE6CC6f49A429d37134D7Dfb745', tetherPrice).send({from : ethAddr}, (err, res) => {
                if(!err) {
                    alertModal("Tether elköltése engedélyezve, összeg: " + amount * 1005 / 100000);
                    changeFromETH.methods.convertToHederaMX(amount, hederaAddress).send({from : ethAddr}, (err, res) => {
                        if(!err) {
                            alertModal("Tether kifizetve, összeg: " + amount * 1005 / 100000);
                            //refreshAccount(privateKey, currentAccount, (err, res) => {});
                        } else {
                            console.log(err);
                        }
                    });
                } else {
                    console.log(err);
                }
            });
            break;
        case 'Tethersell' : 
            if(amount <= currentMXBalance) {
                $.post('sellMXtoTether', {'pr' : privateKey, 'acc' : currentAccount, 'amount' : amount, 'eth' : ethAddr}, (data, status) => {
                    console.log(data);
                    console.log(status);
                    if(status == "success") {
                        $("#mxx-amount").val("");
                        let doNothing = () => {
                            refreshAccount(privateKey, currentAccount, (err, res) => {});
                        };
                        setTimeout(doNothing, 1000);
                    } 
                });
            } else {
                alertModal("Maximum " + currentMXBalance + " Maxitot tudsz eladni");
            }
            break;
        default: alertModal('HIBA, nem választottad ki, hogy vennél vagy eladnál, melyik kriptovalutával szemben vagy mekkora összegben!');
    }
});

let toPayUSD = 0;
let toPayHUF = 0;
let mxAmount = 0;
paypal_sdk.Buttons({
    createOrder: function(data, actions) {
      // This function sets up the details of the transaction, including the amount and line item details.
      mxAmount = parseInt($("#paypal-mx-amount").val());
      
      //toPayUSD = parseFloat((mxAmount * 10 + 300) / 966).toFixed(2);
      toPayHUF = parseInt((mxAmount * 3100 + 90000) / 966);
      console.log("Paypal MX vásárlás: " + mxAmount + " " + currentAccount + " " + toPayHUF);
      return actions.order.create({
        purchase_units: [{
          amount: {
            /*
            currency_code: "USD",
            value: toPayUSD
            */
            currency_code: "HUF",
            value: toPayHUF
          }
        }]
      });
    },
    onApprove: function(data, actions) {
        // This function captures the funds from the transaction.
        return actions.order.capture().then(function(details) {
            console.log(details);
          // This function shows a transaction success message to your buyer.
          alertModal('Fizetve ' + toPayHUF + ' HUF, Paypal tranzakció azonosító: ' + details.id);

          $.get("paypalCheck?orderId=" + details.id + "&account=" + currentAccount + "&mxAmount=" + mxAmount, (data, status) => {
            console.log(data);
            console.log(status);
            if(data == mxAmount + " MX has been sent to " + currentAccount) {
                $("#paypal-mx-amount").val("");
                alertModal("SIKER");
                refreshAccount(privateKey, currentAccount, (err, res) => {}); 
            } else {
                alertModal('Paypal tranzakció azonosító: ' + details.id + ' amennyiben nem érkezik meg a vásárolt Maxitjai a számlájára, ezen azonosítóra hivatkozzon reklamációja során');
            }
          });
        });
    }
}).render('#paypal');

$("#loan-claims-btn").click(() => {
    lastTab.attr("class", "d-none");
    $("#loan-claims").attr("class", "d-block");
    listClaims("lender-main");
    $("#lending-title").html("Kölcsönadó - Hitel kérelmek");
    lastTab = $("#loan-claims");
});

$("#my-offers-btn").click(() => {
    lastTab.attr("class", "d-none");
    $("#my-loan-offers").attr("class", "d-block");
    listOffers("lender-my-offers");
    $("#lending-title").html("Kölcsönadó - Saját ajánlataim");
    lastTab = $("#my-loan-offers");
});

$("#create-offer-btn").click(() => {
    $("#lending-title").html("Kölcsönadó - Új hitel ajánlat");
    lastTab.attr("class", "d-none");
    if(score > 0) {
        $("#create-offer").attr("class", "d-block");
        lastTab = $("#create-offer");
    } else {
        alertModal("Csak regisztrált felhasználók adhatnak kölcsön!");
        $("#wallet").attr("class", "section type-4 p-3 d-none");
        $("#lender").attr("class", "section type-4 p-3 d-none");
        $("#borrower").attr("class", "section type-4 p-3 d-none");
        $("#main").attr("class", "section type-4 p-3 d-block");
        currentTab = $("#main");
        console.log(currentTab);
    }
});

$("#my-lendings-btn").click(() => {
    lastTab.attr("class", "d-none");
    $("#my-lendings").attr("class", "d-block");
    $("#lending-title").html("Kölcsönadó - Hiteleim"); 
    listLendings();
    lastTab = $("#my-lendings");
    //console.log("lastTab", lastTab);
});

$("#loan-offers-btn").click(() => {
    lastTab.attr("class", "d-none");
    $("#loan-offers").attr("class", "d-block");
    listOffers("borrower-main");
    $("#borrower-title").html("Kölcsönvevő - Hitel ajánlatok"); 
    lastTab = $("#loan-offers");
});

$("#my-claims-btn").click(() => {
    lastTab.attr("class", "d-none");
    $("#my-loan-claims").attr("class", "d-block");
    listClaims("borrower-my-claims");
    $("#borrower-title").html("Kölcsönvevő - Saját kérelmeim");
    lastTab = $("#my-loan-claims");
});

$("#create-claim-btn").click(() => {
    $("#borrower-title").html("Kölcsönvevő - Új hitel kérelem");
    lastTab.attr("class", "d-none");
    if(score > 0) {
        $("#create-claim").attr("class", "d-block");
        lastTab = $("#create-claim");
    } else {
        alertModal("Csak regisztrált felhasználók kérhetnek kölcsön!");
        $("#wallet").attr("class", "section type-4 p-3 d-none");
        $("#lender").attr("class", "section type-4 p-3 d-none");
        $("#borrower").attr("class", "section type-4 p-3 d-none");
        $("#main").attr("class", "section type-4 p-3 d-block");
        currentTab = $("#main");
        console.log(currentTab);
    }
});

$("#my-credits-btn").click(() => {
    lastTab.attr("class", "d-none");
    $("#my-credits").attr("class", "d-block");
    $("#borrower-title").html("Kölcsönvevő - Hiteleim"); 
    listCredits();
    lastTab = $("#my-credits");
});


$("#list-old-credits").click(() => {
    $.post('listCredits', {'pr' : privateKey, 'acc' : currentAccount}, function(data, status) {
        //console.log(status);
        //console.log(data);
        if(status = "SUCCESS") {
            let myCredits = JSON.parse(data);
            let lengthDHM = {};

            $("#history-table").empty();
            for(let i in myCredits) {
                //console.log(claims[i].borrower + " " + account.slice(account.lastIndexOf(".") + 1));
                if(myCredits[i].capital == 0) {
                    calcDate(myCredits[i].length, lengthDHM);
                    $("#history-table").append("<tr><td>" + myCredits[i].capital + " / " + myCredits[i].initialCapital + "</td><td>" + 
                        myCredits[i].toPayBack + "</td><td>" + myCredits[i].interestRate / 10 + "</td><td>" + myCredits[i].lastReedem + " / " + 
                        myCredits[i].periods + "</td><td>" + lengthDHM.remainDay + "D " + lengthDHM.remainHour + "H " + lengthDHM.remainMin + "M"  + "</td></tr>");
                }
            }
        }
    });
});

listCredits = () => {
    $.post('listCredits', {'pr' : privateKey, 'acc' : currentAccount}, function(data, status) {
        //console.log(status);
        //console.log(data);
        if(status = "SUCCESS" && data != "No credits") {
            let myCredits = JSON.parse(data);
            let lengthDHM = {};

            $("#my-loans").empty();
            for(let i in myCredits) {
                //console.log(claims[i].borrower + " " + account.slice(account.lastIndexOf(".") + 1));
                var loanLength = parseInt(myCredits[i].length);
                var periods = parseInt(myCredits[i].periods);
                var interestRate = parseInt(myCredits[i].interestRate);
                var yearlyRate = annumInterest(loanLength, periods, interestRate);
                if(myCredits[i].capital > 0) {
                    calcDate(myCredits[i].length, lengthDHM);
                    $("#my-loans").append("<tr><td>" + myCredits[i].capital + " / " + myCredits[i].initialCapital + "</td><td>" + 
                        myCredits[i].toPayBack + "</td><td>" + myCredits[i].interestRate / 10 + " (" + yearlyRate.toFixed(2) + "%)</td><td>" + myCredits[i].lastReedem + " / " + 
                        myCredits[i].periods + "</td><td>" + lengthDHM.remainDay + " nap  " + lengthDHM.remainHour + " óra  " + lengthDHM.remainMin + " perc</td></tr>");
                }		
            }
        }
    });
}


let myLendings = [];
listLendings = () => {
    $.post('listMyLendings', {'pr' : privateKey, 'acc' : currentAccount}, function(data, status) {
        //console.log(status);
        
        if(status = "SUCCESS" && data != "No lendings") {
            myLendings = JSON.parse(data);
            console.log(myLendings);
            let lengthDHM = {};
            
            $("#my-liabilities").empty();
            for(let i in myLendings) {
                //console.log("my Lendings ", myLendings[i].lastReedem, myLendings[i].periods);
                if(parseInt(myLendings[i].lastReedem) < parseInt(myLendings[i].periods)) {
                    calcDate(myLendings[i].length, lengthDHM);
                    var loanLength = parseInt(myLendings[i].length);
                    var periods = parseInt(myLendings[i].periods);
                    var interestRate = parseInt(myLendings[i].interestRate);
                    var yearlyRate = annumInterest(loanLength, periods, interestRate);
                    //console.log(lengthDHM);
                    $("#my-liabilities").append("<tr class=my-lendings-row id=sr" + i + "><td>" + myLendings[i].capital + " / " + myLendings[i].initialCapital + "</td><td>" + 
                    myLendings[i].toPayBack + "</td><td>" + myLendings[i].interestRate / 10 + " (" + yearlyRate.toFixed(2) + "%)</td><td>" + myLendings[i].lastReedem + " / " + 
                    myLendings[i].periods + "</td><td>" + lengthDHM.remainDay + " nap " + lengthDHM.remainHour + " óra " + lengthDHM.remainMin + " perc</td></tr>");
                    $("#sr" + i).val(i);
                }
            }
        }
    });
}

$("#list-my-old-lendings").click(() => {
    $.post('listMyLendings', {'pr' : privateKey, 'acc' : currentAccount}, function(data, status) {
        //console.log(status);
        //console.log(data);
        if(status = "SUCCESS") {
            myLendings = JSON.parse(data);
            $("#history-table").empty();
            for(let i in myLendings) {
                //console.log(claims[i].borrower + " " + account.slice(account.lastIndexOf(".") + 1));
                if(myLendings[i].lastReedem == myLendings[i].periods) {
                    $("#history-table").append("<tr><td>" + myLendings[i].capital + " / " + myLendings[i].initialCapital + "</td><td>" + 
                    myLendings[i].toPayBack + "</td><td>" + myLendings[i].interestRate / 10 + "</td><td>" + myLendings[i].lastReedem + " / " + 
                    myLendings[i].periods + "</td><td>" + myLendings[i].length + "</td></tr>");
                }
            }
        }
    });
});

$("#my-liabilities").on("click", ".my-lendings-row", function() {
    $("#my-lendings-to-change-id").html("Loan ID: " + $(this).val());
    $("#change-my-lendings-capital-btn").val($(this).val());
    $("#change-my-lendings-interest-btn").val($(this).val());
    $("#change-my-lendings-periods-btn").val($(this).val());
    $("#change-my-lendings-modal").show();
});

$("#close-change-my-lendings-modal").click(() => {
    $("#change-my-lendings-amount").val("");
    $("#change-my-lendings-rate").val("");
    $("#change-my-lendings-periods").val("");
    $("#change-my-lendings-modal").hide();
});

$("#change-my-lendings-modal").on("click", "#change-my-lendings-capital-btn", function() {
    let capital = parseInt($("#change-my-lendings-amount").val());
    let loanToChange = $(this).val();
    console.log("loanToChange: " + loanToChange);

    let currentCapital = parseInt(myLendings[loanToChange].capital);
    //parseInt(prompt("Enter the amount you want to decrease the interest rate of the loan:", "Max. " + currentInterest + ", min. 1"));
    if(capital == 0 || capital == "") {
          alertModal("Please type the amount you wish to decrease the capital of the loan");
    } else if(currentCapital < capital) {
          alertModal( "Should less then " + currentCapital);
    } else {
        $.post('setCapitalRabat', {'pr' : privateKey, 'acc' : currentAccount, 'loanToChange' : myLendings[loanToChange].contractAddress, 'capital' : capital}, function(data, status) {
            console.log(status);
            console.log(data);
        });
    }
    $("#change-my-lendings-modal").hide();
});

$("#change-my-lendings-modal").on("click", "#change-my-lendings-interest-btn", function() {
    let rate = parseInt($("#change-my-lendings-rate").val() * 10);
    let loanToChange = $(this).val();
    console.log("loanToChange: " + loanToChange);

    let currentInterest = parseInt(myLendings[loanToChange].interestRate);
    //parseInt(prompt("Enter the amount you want to decrease the interest rate of the loan:", "Max. " + currentInterest + ", min. 1"));
    if(rate == 0 || rate == "") {
          alertModal("Please type the amount you wish to decrease the capital of the loan");
    } else if(currentInterest < rate) {
          alertModal( "Should less then " + currentInterest);
    } else {
        $.post('setInterestRabat', {'pr' : privateKey, 'acc' : currentAccount, 'loanToChange' : myLendings[loanToChange].contractAddress, 'interest' : rate}, function(data, status) {
            console.log(status);
            console.log(data);
        });
    }
    $("#change-my-lendings-modal").hide();
});

$("#change-my-lendings-modal").on("click", "#change-my-lendings-periods-btn", function() {
    let periods = parseInt($("#change-my-lendings-periods").val());
    let loanToChange = $(this).val();
    console.log("loanToChange: " + loanToChange);
    let decrease = parseInt(myLendings[loanToChange].periods) + 1;

    if(periods == 0 || periods == "") {
          alertModal("Please type the new number of periods");
    } else if(periods < decrease) {
          alertModal( "Should more then " + myLendings[loanToChange].periods);
    } else {
        $.post('restructLoan', {'pr' : privateKey, 'acc' : currentAccount, 'loanToChange' : myLendings[loanToChange].contractAddress, 'periods' : periods}, function(data, status) {
            console.log(status);
            console.log(data);
        });
    }
    $("#change-my-lendings-modal").hide();
});
/*
$("#interest-rate").on("input", () => {
    $("[data-toogle='tooltip-interest']").tooltip();
});

$("#credit-claim-btn").click(() => {
    $("#credit-score").attr("class", "d-none");
});

$("#credit-offer-btn").click(() => {
    $("#credit-score").attr("class", "visible w-75 form-control");
});
*/
$(".new-offer").click(function() {
    if(score == "You are not verified yet!" || score == "You are not registered!") {
        alertModal("Only registered users can create offers/claims!");
    }
    if(score > 0) {
        var type = $(this).attr("name");
        var newType = "#create-" + type;
        console.log(newType);
        var creditAmount = parseInt($(newType).find(".loan-amount").val());
        var loanLength = parseInt($(newType).find(".loan-length").val() * 86400);
        var creditType = 0; //$("input[name=credit-type]:checked").val();
        var periods = parseInt($(newType).find(".loan-periods").val());
        var interestRate = parseInt($(newType).find(".interest-rate").val() * 10);
        var creditScore;
        var lastTo = parseInt($(newType).find(".last-to").val() * 86400);
        var prKey = privateKey;
        console.log(type + " " + creditAmount + " " +  loanLength + " " + periods + " " + interestRate + " " + lastTo + " " + creditType);
        console.log("RATE: " + interestRate);
        var yearlyRate = annumInterest(loanLength, periods, interestRate);
        var confirmOrder = confirm("Az éves kamat: " + parseFloat(yearlyRate).toFixed(2) + "%");

        if(type == 'offer') {
            creditScore = parseInt($("#credit-score").val());
            console.log(creditScore);
        }

        if(loanLength / periods < 86401) {
            alertModal("Egy periódusnak hosszabbnak kell lennie mint egy nap (a hossz legyen nagyobb mint a részletek száma)!");
        } else {
            if(confirmOrder == true) {
                if(creditAmount > 0 && loanLength > 0 && periods > 0 && interestRate > 0 && lastTo > 0) {
                    switch(type) {
                        case 'offer':
                            if(creditScore >  0) {
                                $.post('createCreditOffer', {'prKey' : prKey, 'acc': currentAccount, 'amount' : creditAmount, 'type' : creditType, 'length' :  loanLength, 'periods' : periods, 'interestRate' : interestRate, 'creditScore' : creditScore, 'lastTo' : lastTo}, function(data, status) {
                                    console.log(status);
                                    console.log(data);
                                    clearFields();
                                });
                            } else {
                                alertModal("Tölts ki minden mezőt!"); 
                            }
                            break;
                        case 'claim':
                            var redeem = creditAmount * interestRate / 1000 / (1 - (1 / (Math.pow(1 + (interestRate / 1000), periods))));
                            console.log("Redeem", redeem);
                            var toAllow = parseInt(redeem * periods * 110 / 100);
                            $.post('createCreditClaim', {'prKey' : prKey, 'acc': currentAccount, 'toAllow' : toAllow, 'amount' : creditAmount, 'type' : creditType, 'length' :  loanLength, 'periods' : periods, 'interestRate' : interestRate, 'lastTo' : lastTo}, function(data, status) {
                                console.log(status);
                                console.log(data);
                                clearFields();
                            });
                            break;
                        default: alertModal("Switch between types: Offer/Claim");
                    }
                } else {
                    alertModal("Tölts ki minden mezőt!!");
                }
            }
        }
    }
    
    function clearFields() {
        creditAmount = $(".loan-amount").val("");
        loanLength = $(".loan-length").val("");
        periods = $(".loan-periods").val("");
        interestRate = $(".interest-rate").val("");
        creditScore = $("#credit-score").val("");
        lastTo = $(".last-to").val("");
    }
});

let creditOffers = [];
listOffers = (type) => {
    $.post('offers', {'acc': currentAccount}, (data, status) => {
        //console.log(status);
        //console.log(data, typeof(data));	
        if(status = "SUCCESS" && data != "There is no credit offer") {
            let offers = JSON.parse(data);
            creditOffers = offers;
            let date = new Date();
            let now = parseInt(date.getTime() / 1000);
            let currentOffer = {};
            let offersLength = {};
                       
            $("#borrower-offers-table-body").empty();
            $("#lender-my-offers-table-body").empty();
            for(let i in offers) {
                calculateRemaining(offers[i].last, now, currentOffer);
                calcDate(offers[i].length, offersLength);
                let annualRate = annumInterest(offers[i].length, offers[i].periods, offers[i].interest);
                if(offers[i].lender != currentAccount.slice(currentAccount.lastIndexOf(".") + 1) && offers[i].amount >= 2000 && type == "borrower-main" && now < offers[i].last) {
                    $("#borrower-offers-table-body").append("<tr class=offers-row id=o" + i + "><td>" + offers[i].amount + "</td><td>" + offers[i].interest / 10 + "% (" + annualRate.toFixed(2) + "%)</td><td>" + 
                        offersLength.remainDay + " day(s) " + offersLength.remainHour + " hour(s) " + offersLength.remainMin + " minute(s)</td><td>" + offers[i].periods + "</td><td>" + 
                        currentOffer.remainDay + " day(s) " + currentOffer.remainHour + " hour(s) " + currentOffer.remainMin + " minute(s)</td><td>" + offers[i].score + "</td></tr>");
                    $("#o" + i).val(i);
                }

                if(offers[i].lender == currentAccount.slice(currentAccount.lastIndexOf(".") + 1) && offers[i].amount > 0 && type == "lender-my-offers" && now < offers[i].last) {
                    $("#lender-my-offers-table-body").append("<tr class=my-offers-row id=ct" + i + "><td>" + offers[i].amount + "</td><td>" + offers[i].interest / 10 + "% (" + annualRate.toFixed(2) + "%)</td><td>" + 
                        offersLength.remainDay + " day(s) " + offersLength.remainHour + " hour(s) " + offersLength.remainMin + " minute(s)</td><td>" + offers[i].periods + "</td><td>" + 
                        currentOffer.remainDay + " day(s) " + currentOffer.remainHour + " hour(s) " + currentOffer.remainMin + " minute(s)</td><td>" + offers[i].score + "</td></tr>");
                    $("#ct" + i).val("offer" + i);
                }
            }
        }
    });
}

$(".offers").on("click", ".offers-row", function() {
    let number = $(this).val();
    $("#offer-to-accept-id").html(number);
    var loanLength = parseInt(creditOffers[number].length);
    var periods = parseInt(creditOffers[number].periods);
    var interestRate = parseInt(creditOffers[number].interest);
    var yearlyRate = annumInterest(loanLength, periods, interestRate);
    $("#offer-to-accept-annum-rate").html(yearlyRate.toFixed(2) + "%");
    $("#offer-to-accept-min").html("2000 MX");
    $("#offer-to-accept-max").html(creditOffers[number].amount + " MX");
    $("#accept-offer-btn").val(number);
    $("#offer-to-accept-modal").show();
    console.log("Offer: ", $(this).val(), number);
});

$("#offer-to-accept-modal").on("click", "#accept-offer-btn", function() {
    let offerToAccept = parseInt($(this).val());
    console.log("offerToAccept: " + offerToAccept);
    let capital = parseInt(creditOffers[offerToAccept].amount);
    let amount = parseInt($("#accept-offer-amount").val());
        console.log("amount: " + amount + " " + typeof(amount));
    if(amount == 0 || amount == "") {
          alertModal("Add meg az összeget, amit kölcsön vennél");
    } else if(amount > capital) {
          alertModal("Maximum " + capital);
    } else if(amount < 2000) {
        alertModal("Minimum 2000 MX");
    } else if(score == "You are not verified yet!" || score == "You are not registered!") {
        alertModal("Csak regisztrált felhasználók vehetnek fel hitelt!");
    } else {        
        let capital = amount;
        let interest = creditOffers[offerToAccept].interest;
        let periods = creditOffers[offerToAccept].periods;
        let redeem = capital * interest / 1000 / (1 - (1 / (Math.pow(1 + (interest / 1000), periods))));
        console.log("Redeem at accept offer: " + redeem);
        let payback = parseInt(redeem * periods * 110 / 100);
          console.log("redeem: " + redeem + " offer: " + offerToAccept);
          console.log("capital: " + capital + " interest: " + interest + " periods: " + periods + " payback: " + payback);
          
        $.post('acceptOffer', {'pr' : privateKey, 'acc' : currentAccount, 'payback' : payback, 'offerToAccept' : offerToAccept, 'amount' : amount}, function(data, status) {
            console.log(status);
            console.log(data);
        });
    }
    console.log("Offer: ", $(this).val());
    $("#offer-to-accept-modal").hide();
});

$("#close-offer-to-accept-modal").click(() => {
    $("#offer-to-accept-modal").hide();
});

let creditClaims = [];
listClaims = (type) => {
    $.post('claims', {'acc': currentAccount}, (data, status) => {
        //console.log(status);
        //console.log(data);
        //console.log(account);	
        if(status = "SUCCESS" && data != "There is no claim!") {
            let claims = JSON.parse(data);
            creditClaims = claims;
            let date = new Date();
            let now = parseInt(date.getTime() / 1000);
            let currentClaim = {};
            let claimLength = {};
            $("#lender-claims-table-body").empty();
            $("#borrower-my-claims-table-body").empty();
            for(let i in claims) {
                calculateRemaining(claims[i].last, now, currentClaim);
                calcDate(claims[i].length, claimLength);
                let annualRate = annumInterest(claims[i].length, claims[i].periods, claims[i].interest);
                //console.log(claims[i].borrower + " " + account.slice(account.lastIndexOf(".") + 1));
                //console.log(currentClaim.remainDay + " " + currentClaim.remainHour + " " + currentClaim.remainMin);
                //&& now < claims[i].last
                if(claims[i].borrower != currentAccount.slice(currentAccount.lastIndexOf(".") + 1) && claims[i].amount >= 2000 && type == "lender-main" && now < claims[i].last) {
                    $("#lender-claims-table-body").append("<tr class=claims-row id=c" + i + "><td>" + claims[i].amount + "</td><td>" + claims[i].interest / 10 + "% (" + annualRate.toFixed(2) + "%)</td><td>" + 
                        claimLength.remainDay + " nap " + claimLength.remainHour + " óra " + claimLength.remainMin + " perc </td><td>" + claims[i].periods + "</td><td>" + 
                        currentClaim.remainDay + " nap " + currentClaim.remainHour + " óra " + currentClaim.remainMin + " perc</td><td>" + claims[i].score + "</td></tr>");
                    $("#c" + i).val(i);
                }
                //
                if(claims[i].borrower == currentAccount.slice(currentAccount.lastIndexOf(".") + 1) && claims[i].amount > 0 && type == "borrower-my-claims" && now < claims[i].last) {
                    $("#borrower-my-claims-table-body").append("<tr class=my-offers-row id=ct" + i + "><td>" + claims[i].amount + "</td><td>" + claims[i].interest / 10 + "% (" + annualRate.toFixed(2) + "%)</td><td>" + 
                        claimLength.remainDay + " day(s) " + claimLength.remainHour + " hour(s) " + claimLength.remainMin + " minute(s)</td><td>" + claims[i].periods + "</td><td>" + 
                        currentClaim.remainDay + " day(s) " + currentClaim.remainHour + " hour(s) " + currentClaim.remainMin + " minute(s)</td></tr>");
                    $("#ct" + i).val("claim" + i);
                }
            }
        }
    });
}

$(".claims").on("click", ".claims-row", function() {
    let number = $(this).val();
    $("#claim-to-accept-id").html(number);
    $("#claim-to-accept-address").html(creditClaims[number].borrower);
    let fixedBirthDate = new Date(parseInt(creditClaims[number].age) * 1000 - (70 * 365 + 17) * 86400 * 1000);
    let date = new Date();
    let age = parseInt((date.getTime() - fixedBirthDate) / (365.25 * 86400 * 1000));
    $("#claim-to-accept-age").html(age);
    $("#claim-to-accept-volume-score").html(creditClaims[number].scoreFromAcc);
    $("#claim-to-accept-country").html(creditClaims[number].country);
    $("#claim-to-accept-city").html(creditClaims[number].city);
    var loanLength = parseInt(creditClaims[number].length);
    var periods = parseInt(creditClaims[number].periods);
    var interestRate = parseInt(creditClaims[number].interest);
    var yearlyRate = annumInterest(loanLength, periods, interestRate);
    $("#claim-to-accept-annum-rate").html(yearlyRate.toFixed(2) + "%");
    $("#claim-to-accept-min").html("2000 MX");
    $("#claim-to-accept-max").html(creditClaims[number].amount + " MX");
    $("#accept-claim-btn").val(number);
    $("#claim-to-accept-modal").show();
    console.log("CLAIM: ", $(this).val(), number);
});

$("#claim-to-accept-modal").on("click", "#accept-claim-btn", function() {
    let claimToAccept = parseInt($(this).val());
    console.log("claimToAccept: " + claimToAccept);
    let capital = parseInt(creditClaims[claimToAccept].amount);
    let amount = parseInt($("#accept-claim-amount").val());
        console.log("amount: " + amount + " " + typeof(amount));
    if(amount == 0 || amount == "") {
          alertModal("Add meg az összeget amit kölcsönadnál");
    } else if(amount > capital) {
          alertModal("Maximum " + capital);
    } else if(amount < 2000) {
        alertModal("Minimum 2000 MX");
    } else if(score == "You are not verified yet!" || score == "You are not registered!") {
        alertModal("Csak regisztrált felhasználók adhatnak kölcsön!");
    } else {      
        $.post('acceptClaim', {'pr' : privateKey, 'acc' : currentAccount, 'claimToAccept' : claimToAccept, 'amount' : amount}, function(data, status) {
            console.log(status);
            console.log(data);
        });
    }
    console.log("CLAIM: ", $(this).val());
    $("#claim-to-accept-modal").hide();
});

$("#close-claim-to-accept-modal").click(() => {
    $("#claim-to-accept-modal").hide();
});
/*
$("#list-my-offers").click(() => {
    listOffers();
});

$("#list-my-claims").click(() => {
    console.log("clicked claim list");
    listClaims();
});

$("#list-offers").click(() => {
    listOffers();
});

$("#list-claims").click(() => {
    console.log("clicked claim list");
    listClaims();
});
*/
$(".my-offers").on("click", ".my-offers-row", function() {
    let type = $(this).val().slice(0, 5);
    let number = $(this).val().slice(5);
    $("#offer-to-change-id").html("Your " + type + " ID: " + number);
    $("#change-offers-claims").val($(this).val());
    $("#delete-offers-claims").val($(this).val());
    $("#change-delete-offers-claims-modal").show();
    console.log("ORDER: ", $(this).val(), type, number);
});

$("#change-delete-offers-claims-modal").on("click", "#change-offers-claims", function() {
    let toChangeAmount = parseInt($("#change-offers-claims-amount").val());
    let order = [];
    let type = $(this).val().slice(0, 5);
    let number = $(this).val().slice(5);
    switch(type) {
        case 'offer' : order = creditOffers[number];
            let offerToChange = number;
            console.log("offerToChange: " + offerToChange);
            let decrease = parseInt(creditOffers[offerToChange].amount);
            if(toChangeAmount == 0 || toChangeAmount == "") {
                alertModal("Please type the amount you wish to decrease");
            } else if(toChangeAmount > decrease) {
                alertModal( "Should less then " + decrease);
            } else {
                $.post('changeOffer', {'pr' : privateKey, 'acc' : currentAccount, 'offerToChange' : offerToChange, 'amount' : toChangeAmount}, function(data, status) {
                    console.log(status);
                    console.log(data);
                });
            }
            break;
        case 'claim' : order = creditClaims[number];
                let claimToChange = number;
                console.log("claimToChange: " + claimToChange);
                let capital = parseInt(creditClaims[claimToChange].amount);
                if(toChangeAmount == 0 || toChangeAmount == "") {
                    alertModal("Please type the amount you wish to decrease");
                } else if(toChangeAmount > capital) {
                    alertModal( "Should less then " + capital);
                } else {
                    $.post('changeClaim', {'pr' : privateKey, 'acc' : currentAccount, 'claimToChange' : claimToChange, 'amount' : toChangeAmount}, function(data, status) {
                        //console.log(status);
                        //console.log(data);
                        if(data == "SUCCESS changeClaim") {
                            alertModal("A(z) " + claimToChange + " azonosítójú hitel kérelmedet sikeresen csökkentetted " + toChangeAmount + " Maxittal");
                            listClaims("borrower-my-claims");
                        }
                    });
                }
            break;
        default : console.log("ERROR in change order");
    }
    $("#change-delete-offers-claims-modal").hide();
    console.log("OFFER TO CHANGE: ", $(this).val(), toChangeAmount);
    console.log(order)
});

$("#change-delete-offers-claims-modal").on("click", "#delete-offers-claims", function() {
    console.log("OFFER TO DELETE: ", $(this).val());
    let order = [];
    let type = $(this).val().slice(0, 5);
    let number = $(this).val().slice(5);
    switch(type) {
        case 'offer' : order = creditOffers[number];
            let offerToDelete = number;
            console.log("offerToDelete: " + offerToDelete);
            $.post('deleteOffer', {'pr' : privateKey, 'acc' : currentAccount, 'offerToDelete' : offerToDelete}, function(data, status) {
                    console.log(status);
                    console.log(data);
            });
            break;
        case 'claim' : order = creditClaims[number];
            let claimToDelete = number;
            console.log("claimToDelete: " + claimToDelete);
            $.post('deleteClaim', {'pr' : privateKey, 'acc' : currentAccount, 'claimToDelete' : claimToDelete}, function(data, status) {
                //console.log(status);
                //console.log(data);
                if(data == "SUCCESS deleteClaim") {
                    alertModal("A(z) " + claimToDelete + " azonosítójú hitel kérelmedet sikeresen törölted");
                    listClaims("borrower-my-claims");    
                }
            });
            break;
        default : console.log("ERROR in change order");
    }
    $("#change-delete-offers-claims-modal").hide();
    console.log(order)
});

$("#close-change-delete-offers-claims-modal").click(() => {
    $("#change-delete-offers-claims-modal").hide();
});

alertModal = (alertText) => {
    $("#alert-text").html(alertText);
    $("#alert-modal").show();
}

$("#alert-close-btn").click(() => {
    $("#alert-modal").hide();
});

getHbarPrice = () => {
    $.get('getHbarPrice', (data, status) => {
        let buyMXPrice = parseInt(data) * 101 / 10000000000;
        let sellMXPrice = parseInt(data) * 99 / 10000000000;
        $("#buy-mx-price").html("Current buy price: " + buyMXPrice.toFixed(4) + "hbars");
        $("#sell-mx-price").html("Current sell price: " + sellMXPrice.toFixed(4) + "hbars");

        //console.log(data);
        //console.log(status);
    });
}

setInterval(getHbarPrice, 5000);

calcDate = (sec, target) => {
    let remainDay = parseInt(sec / 86400);
    let rd = sec % 86400;
    let remainHour = parseInt(rd / 3600);
    let rh = sec % 3600;
    let remainMin = parseInt(rh / 60);
    target.remainDay = remainDay;
    target.remainHour = remainHour;
    target.remainMin = remainMin;
}

annumInterest = (sec, periods, rate) => {
    //console.log(sec, typeof(sec), periods, typeof(periods), rate, typeof(rate));
    var secInYears = 365 * 86400;
    var loanLengthYearMultipliler = secInYears / (parseInt(sec));
    var annumRate = (Math.pow(((1000 + parseInt(rate)) / 1000), loanLengthYearMultipliler * parseInt(periods)) - 1) * 100;
    //console.log("ANNUAL RATE: " + annumRate);
    return annumRate;
}

calculateRemaining = (resultTime, currentTime, currentOffer) => {
    let claimRemains = resultTime - currentTime;
    calcDate(claimRemains, currentOffer);
} 

solidityAddress = (address) => {
    let len = address.toString(16).length;
    let zeroCount = 40 - len;
    let zeros = "0x";
    for(let i = 0; i < zeroCount; i++) {
        zeros += "0";
    }
    let hexAddress = zeros + address.toString(16);
    //console.log("HEXADDRESS: " + hexAddress);
    return(hexAddress);
}

accountNumber = (accountID) => {
    const account = accountID.slice(accountID.lastIndexOf(".") + 1);
    return account;
}
