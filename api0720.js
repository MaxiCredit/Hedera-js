let account = "";
let prKey = "";
let score = "";
let newAcc = [];
let currentOffer = "";
var shopHederaAddress = "0.0.24011";
var orderSort;
var offerData = [];

let modalFlag = false;
let newAccSaved = false;

var mcApi = {
    test : function() {
        console.log(document.URL);
    }
}
    
function calcDate(sec, target) {
    let remainDay = parseInt(sec / 86400);
    let rd = sec % 86400;
    let remainHour = parseInt(rd / 3600);
    let rh = sec % 3600;
    let remainMin = parseInt(rh / 60);
    target.day = remainDay;
    target.hour = remainHour;
    target.min = remainMin;
}

function calculateRemaining(resultTime, currentTime, target) {
    console.log(resultTime, currentTime);
    let remains = resultTime - currentTime;
    if(remains < 1) remains = 0;
    calcDate(remains, target);
} 

function annumInterest(sec, periods, rate) {
    //console.log(sec, typeof(sec), periods, typeof(periods), rate, typeof(rate));
    var secInYears = 365 * 86400;
    var loanLengthYearMultipliler = secInYears / (parseInt(sec));
    var annumRate = (Math.pow(((1000 + parseInt(rate)) / 1000), loanLengthYearMultipliler * parseInt(periods)) - 1) * 100;
    //console.log("ANNUAL RATE: " + annumRate);
    return annumRate;
}

function calcRedeem() {
    let capital = parseInt(document.getElementById("accept-offer-amount").value);
    let interest = offerData[currentOffer].interest;
    let periods = offerData[currentOffer].periods;
    if(capital > 1999 && capital <= offerData[currentOffer].amount) {
        let redeem = capital * interest / 1000 / (1 - (1 / (Math.pow(1 + (interest / 1000), periods))));
        document.getElementById("offer-details").innerHTML = "Kézhez kapott összeg: " + parseInt(capital * 995 / 1000) + "MX (" + parseInt(capital * 995 /1000 * 3.15) + "Ft), törlesztő részlet: " + parseInt(redeem) + "MX (" + parseInt(redeem * 3.15) + "Ft), összesen visszafizetendő: " + parseInt(redeem * periods) + "MX (" + parseInt(redeem * periods * 3.15) + "Ft)";
    } else {
        document.getElementById("offer-details").innerHTML = "Minimum 2000MX, maximum " + offerData[currentOffer].amount + "MX összegű hitel vehető fel ezen ajánlat keretében";
    }
}

function myAjax(type, url, req, callback) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            //console.log(this.response);
            callback(null, this.response);
        } else {
            //callback(this.status, null);
        }
    };
    xhttp.open(type, url, true);
    xhttp.send(req);
}

function appendModal(type, id) {
    if(modalFlag == false) {
        createModal(type, id);
    } else {
        let modal = document.getElementsByClassName("modal");
        document.body.removeChild(modal);
        createModal(type, id);
    }
}

function createModal(type, args) {
    //console.log("Create modal", type);
    let modal = document.createElement("div");
    modal.setAttribute("id", "modal");
    modal.setAttribute("class", "modal d-block");
    modal.style.overflowY = "auto";
    let modalDialog = document.createElement("div");
    modalDialog.setAttribute("id", "modal-dialog");
    modalDialog.setAttribute("class", "modal-dialog");
    modalDialog.style.overflowY = "auto";
    let modalContent = document.createElement("div");
    modalContent.setAttribute("id", "modal-content");
    modalContent.setAttribute("class", "modal-content");
    modalContent.style.overflowY = "auto";
    let modalHeader = document.createElement("div");
    modalHeader.setAttribute("class", "modal-header");
    modalHeader.setAttribute("id", "modal-header");
    let modalBody = document.createElement("div");
    modalBody.setAttribute("class", "modal-body");
    modalBody.setAttribute("id", "modal-body");
    modalBody.style.overflowY = "auto";
    let modalFooter = document.createElement("div");
    modalFooter.setAttribute("class", "modal-footer");

    let close = document.createElement("button");
    let buttonText = document.createTextNode("Bezár");
    close.appendChild(buttonText);
    close.setAttribute("id", "dismiss-button");
    close.setAttribute("onclick", "closeModal()");
    close.setAttribute("class", "btn btn-primary");

    modalFooter.appendChild(close);
    document.body.appendChild(modal);
    setModal(type, args, modalHeader, modalBody);

    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalContent.appendChild(modalFooter);
    modalDialog.appendChild(modalContent);
    modal.appendChild(modalDialog);
    
    
    //apiDiv.replaceChild(modal, document.getElementById("mc_api_table"));
    modalFlag = true;
}

function setModal(type, args, modalHeader, modalBody) {
    //console.log("SET modal:", type);
    switch(type) {
        case "login" : loginModal(modalHeader, modalBody, args);
            break;
        case "saveNewAccount" : saveNewAccountModal(modalHeader, modalBody);
            break;
        case "acceptOffer" : acceptOfferModal(modalHeader, modalBody);
            break;
        case "register" : registerModal(modalHeader, modalBody);
            break;
        case "pay" : payModal(modalHeader, modalBody, args);
            break;
        case "listOffers" : listOfferModal(modalHeader, modalBody);
        default :
    }
}

function closeModal() {
    if(document.getElementById("modal")) {
        let modal = document.getElementById("modal");
        //console.log(modal);
        document.body.removeChild(modal);
    } else {
        console.log("NO modal");
    }

    //apiDiv.removeChild(modal);
    //listOffers("mc_api", "modal");
    modalFlag = false;
}

function pay(url, amount) {
    var payButton = document.createElement("button");
    payButton.innerHTML = "Fizetés Maxittal";
    payButton.setAttribute("onclick", "payWithMX(" + amount + ")"); //amount in MX
    if(url) {
        document.getElementById(url).appendChild(payButton);
    } else {
        document.body.appendChild(payButton);
    }
}

function payWithMX(amount) {
    createModal("pay", amount);
}

function payModal(modalHeader, modalBody, amount) {
    var title = document.createElement("h3");
    title.innerHTML = "Fizetés";
    var price = document.createElement("p");
    price.innerHTML = amount + "MX";

    var payWithMXButton = document.createElement("button");
    payWithMXButton.innerHTML = "Fizetés";
    payWithMXButton.setAttribute("onclick", "openLogin('pay', " + amount + ")");

    var getLoanButton = document.createElement("button");
    getLoanButton.innerHTML = "Hitel";
    getLoanButton.setAttribute("onclick", "openLogin('loan', " + amount + ")");

    modalHeader.appendChild(title);
    modalBody.appendChild(price);
    modalBody.appendChild(payWithMXButton);
    modalBody.appendChild(getLoanButton);
}

function loginAjax(req, type, amount) {
    myAjax("POST", "http://3.126.151.244:3000/client", req, function(err, res) {
        if(!err) {
            //console.log(res, type, typeof(type));
            //console.log("LOGGED");
            var data = JSON.parse(res);
            if(type == "pay") {
                if(data.mxBalance < amount) {
                    console.log("Insufficent balance");
                } else {
                    console.log("pay");
                    var sendMXReq = "pr=" + prKey + "&acc=" + account + "&to=" + shopHederaAddress + "&amount=" + amount;
                    myAjax("POST", "http://3.126.151.244:3000/sendMaxit", sendMXReq, function(error, result) {
                        if(!error) {
                            alert("SIKERES FIZETÉS");
                            closeModal();
                        } else {
                            alert("HIBA");
                        }
                    });
                }
            }
            if(type == "loan") {
                score = data.registration;
                if(score > 0) {
                    closeModal();
                    createModal("listOffers", currentOffer);
                } else if(score == 0 || score == "You are not verified yet!") {
                    closeModal();
                    alert("Jelenleg nem vagy megerősített felhasználó! A regisztrációd nem sokára ellenőrzésre kerül.");
                } else {
                    closeModal();
                    createModal("register", "");
                }
            }
        } else {
            console.log(err);
        }
    });
}

function login(type, amount) {
    console.log("Login:", type, amount);
    var keyFile = document.getElementById("login-key").files[0];
    account = document.getElementById("login-user").value;
    prKey = document.getElementById("login-pw").value;
    
    if(account && prKey) {
        let req = "pr=" + prKey + "&acc=" + account;
        loginAjax(req, type, amount);
    } else {
        if(keyFile) {
            console.log(keyFile);
            var reader = new FileReader();
            reader.readAsText(keyFile, 'UTF-8');
            reader.onload = function(evt) {
                let key = JSON.parse(evt.target.result);
                console.log(key[0]);
                account = key[0].shard + "." + key[0].realm + "." + key[0].account;
                prKey = key[1];
                let req = "pr=" + prKey + "&acc=" + account;
                loginAjax(req, type, amount);
            }
        } else {
            console.log("Hiányzó számlaszám vagy privátkulcs!");
            document.getElementById('login-text').style.color = "red";
            document.getElementById('login-text').innerHTML = "Hiányzó számlaszám vagy privátkulcs!";
        }
    }
}

function openLogin(type, amount) {
    let args = [type, amount];
    closeModal();
    createModal("login", args);
}

function setLoginText() {
    console.log(document.getElementById('login-key').files[0].name);
    document.getElementById('login-text').style.color = "black";
    document.getElementById('login-text').innerHTML = document.getElementById('login-key').files[0].name;
}

function newAccount() {
    myAjax("POST", "http://3.126.151.244:3000/createAccount", "", function(err, res) {
        if(!err) {
            let data = JSON.parse(res);
            newAcc.push(data[1]);
            newAcc.push(data[2]);
            console.log(newAcc);
            closeModal();
            createModal("saveNewAccount", "");
        } else {

        }
    });
}

function saveNewAccount() {
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
    newAccSaved = true;
    prKey = newAcc[1];
    account = newAcc[0].shard + "." + newAcc[0].realm + "." + newAcc[0].account;
    newAcc = [];
    console.log(newAcc);
}

function loginFromNewAccount() {
    console.log("LOGIN after new acc:", prKey, account);
    if(newAccSaved == true) {
        closeModal();
        createModal("register", "");
    } else {
        alert("Mentsd el a belépési azonosítóidat, a Mentés fájlba gombbal!");
    }
}

function loginModal(modalHeader, modalBody, args) {
    console.log("LoginModal:", args);
    if(account == "" && prKey == "") {
        let loginDiv = document.createElement("div");
        let loginTitle = document.createElement("p");
        let loginTitleText = document.createTextNode("Belépés");
        loginTitle.appendChild(loginTitleText);
    
        let loginUserTitle = document.createElement("p");
        let loginUserText = document.createTextNode("Számla szám");
        loginUserTitle.appendChild(loginUserText);
        loginUserTitle.setAttribute("class", "mb-1");
    
        let loginUser = document.createElement("input");
        loginUser.setAttribute("type", "text");
        loginUser.setAttribute("placeholder", "0.0.12345");
        loginUser.setAttribute("class", "mb-3");
        loginUser.setAttribute("id", "login-user");
    
        let loginPwTitle = document.createElement("p");
        let loginPwText = document.createTextNode("Privát kulcs");
        loginPwTitle.appendChild(loginPwText);
        loginPwTitle.setAttribute("class", "mb-1");
    
        let loginPw = document.createElement("input");
        loginPw.setAttribute("type", "password");
        loginPw.setAttribute("class", "mb-3");
        loginPw.setAttribute("id", "login-pw");
    
        let loginKeyTitle = document.createElement("p");
        let loginKeyText = document.createTextNode("Belépés kulcs fájl révén");
        loginKeyTitle.appendChild(loginKeyText);
        loginKeyTitle.setAttribute("class", "mb-1");
    
        var loginText = document.createElement("p");
        loginText.setAttribute("id", "login-text");
        let loginKey = document.createElement("label");
        /*
        loginKey.setAttribute("type", "file");
        loginKey.setAttribute("id", "login-key");
        loginKey.setAttribute("class", "mb-3");
        loginKey.style.display = "none";*/
        loginKey.innerHTML = "<button onclick=document.getElementById('login-key').click()>Tallozás</button><input type=file id=login-key style=display:none onchange=setLoginText()>";
                   
        modalHeader.appendChild(loginTitle);
        loginDiv.appendChild(loginUserTitle);
        loginDiv.appendChild(loginUser);
        loginDiv.appendChild(loginPwTitle);
        loginDiv.appendChild(loginPw);
        loginDiv.appendChild(loginKeyTitle);
        loginDiv.appendChild(loginKey);
        loginDiv.appendChild(loginText);
    
        let br = document.createElement("br");
        loginDiv.appendChild(br);
    
        let loginButton = document.createElement("button");
        loginButton.setAttribute("class", "btn btn-primary mr-2");
        loginButton.setAttribute("onclick", "login('" + args[0] + "', " + args[1] + ")");
        let loginButtonText = document.createTextNode("Belépés");
        loginButton.appendChild(loginButtonText);
        loginDiv.appendChild(loginButton);
    
        let newAccountButton = document.createElement("button");
        newAccountButton.setAttribute("class", "btn btn-primary");
        newAccountButton.setAttribute("onclick", "newAccount()");
        let newAccountButtonText = document.createTextNode("Új számla");
        newAccountButton.appendChild(newAccountButtonText);
        loginDiv.appendChild(newAccountButton);
    
        modalBody.appendChild(loginDiv);
    } else {
        closeModal();
        let req = "pr=" + prKey + "&acc=" + account;
        loginAjax(req, args[0], args[1]);
        //createModal("acceptOffer", currentOffer);
    }
}

function saveNewAccountModal(modalHeader, modalBody) {
    let newAccountHead = document.createElement("p");
    let newAccountHeadText = document.createTextNode("Új számla");
    newAccountHead.appendChild(newAccountHeadText);

    let newAccountTitle = document.createElement("p");
    let newAccountText = document.createTextNode("Számla szám");
    newAccountTitle.appendChild(newAccountText);
    let newAccount = document.createElement("p");
    newAccount.innerHTML = newAcc[0].shard + "." + newAcc[0].realm + "." + newAcc[0].account;


    let newPrKeyTitle = document.createElement("p");
    let newPrKeyText = document.createTextNode("Privát kulcs");
    newPrKeyTitle.appendChild(newPrKeyText);
    let newPrKey = document.createElement("p");
    newPrKey.style.overflow = "auto";
    newPrKey.innerHTML = newAcc[1];

    let newKeyLoginButton = document.createElement("button");
    newKeyLoginButton.setAttribute("class", "btn btn-primary");
    newKeyLoginButton.setAttribute("onclick", "loginFromNewAccount()");
    let newKeyLoginButtonText = document.createTextNode("Belépés");
    newKeyLoginButton.appendChild(newKeyLoginButtonText);

    let newKeySaveButton = document.createElement("button");
    newKeySaveButton.setAttribute("class", "btn btn-primary");
    newKeySaveButton.setAttribute("onclick", "saveNewAccount()");
    let newKeySaveButtonText = document.createTextNode("Mentés fájlba");
    newKeySaveButton.appendChild(newKeySaveButtonText);
    
    modalHeader.appendChild(newAccountHead);
    modalBody.appendChild(newAccountTitle);
    modalBody.appendChild(newAccount);
    modalBody.appendChild(newPrKeyTitle);
    modalBody.appendChild(newPrKey);
    modalBody.appendChild(newKeySaveButton);
    modalBody.appendChild(newKeyLoginButton);
}

function listOfferModal(modalHeader, modalBody) {
    var listOfferHead = document.createElement("h3");
    listOfferHead.innerHTML = "Ajánlatok";
    modalHeader.appendChild(listOfferHead);

    var listOfferDiv = document.createElement("div");
    listOfferDiv.setAttribute("id", "list-offer-div");
    
    modalBody.appendChild(listOfferDiv);
    modalBody.style.background = "gray";
    modalBody.style.heightMin = "200px";

    listOfferDiv.innerHTML = "<br/><br/><p>Várj egy pillanatot!</p><p>Nem sokára láthatod az ajánlatokat</p><br/><br/>";
    
    function list() {
        listOffers("list-offer-div");
    }

    setTimeout(list, 1);
}

function acceptOfferModal(modalHeader, modalBody) {
    let offerHead = document.createElement("p");
    let offerHeadText = document.createTextNode("Ajánlat részletei");
    offerHead.appendChild(offerHeadText);
    modalHeader.appendChild(offerHead);

    let scoreTitle = document.createElement("p");
    let scoreText = document.createTextNode("Saját hitelminősítés: " + score);
    scoreTitle.appendChild(scoreText);

    let offerIdTitle = document.createElement("p");
    let offerIdText = document.createTextNode("Ajánlat azonosító: " + currentOffer);
    offerIdTitle.appendChild(offerIdText);

    let offerMinTitle = document.createElement("p");
    let offerMinText = document.createTextNode("Minimum elfogadható hitel összeg: 2000MX (6300Ft)");
    offerMinTitle.appendChild(offerMinText);

    let offerMaxTitle = document.createElement("p");
    let offerMaxText = document.createTextNode("Maximum elfogadható hitel összeg: " + offerData[currentOffer].amount + "MX (" + offerData[currentOffer].amount * 3.15 + "Ft)");
    offerMaxTitle.appendChild(offerMaxText);

    let offerAnnumRateTitle = document.createElement("p");
    let offerAnnumRateText = document.createTextNode("Éves kamat: " + parseFloat(annumInterest(offerData[currentOffer].length, offerData[currentOffer].periods, offerData[currentOffer].interest)).toFixed(2) + "%");
    offerAnnumRateTitle.appendChild(offerAnnumRateText);
    
    let acceptTitle = document.createElement("p");
    let acceptText = document.createTextNode("Felveendő hitel összege");
    acceptTitle.appendChild(acceptText);
/*
    let acceptTitle = document.createElement("p");
    let acceptText = document.createTextNode("Felveendő hitel összege");
    acceptTitle.appendChild(acceptText);
*/
    let offerDetails = document.createElement("p");
    //let offerDetailsText = document.createTextNode("Felveendő hitel összege");
    //acceptTitle.appendChild(acceptText);
    offerDetails.setAttribute("id", "offer-details");

    let offerAccept = document.createElement("input");
    offerAccept.setAttribute("id", "accept-offer-amount");
    //offerAccept.setAttribute("onfocus", "calcRedeem()");

    let offerDetailsButton = document.createElement("button");
    offerDetailsButton.innerHTML = "Részletek";
    offerDetailsButton.setAttribute("onclick", "calcRedeem()");
    offerDetailsButton.setAttribute("class", "btn btn-primary");

    let offerAcceptButton = document.createElement("button");
    offerAcceptButton.innerHTML = "Hitel felvétele";
    offerAcceptButton.setAttribute("onclick", "acceptOffer()");
    offerAcceptButton.setAttribute("class", "btn btn-primary mx-2");

    modalBody.appendChild(scoreTitle);
    modalBody.appendChild(offerIdTitle);
    modalBody.appendChild(offerMinTitle);
    modalBody.appendChild(offerMaxTitle);
    modalBody.appendChild(offerAnnumRateTitle);
    modalBody.appendChild(acceptTitle);
    modalBody.appendChild(offerAccept);
    modalBody.appendChild(offerDetails);
    modalBody.appendChild(offerDetailsButton);
    modalBody.appendChild(offerAcceptButton);
}

function registerModal(modalHeader, modalBody) {
    let regTitle = document.createElement("p");
    let regText = document.createTextNode("Regisztráció");
    regTitle.appendChild(regText);
    //loginUserTitle.setAttribute("class", "mb-1");

    let lastNameTitle = document.createElement("p");
    lastNameTitle.innerHTML = "Vezeték név";
    lastNameTitle.style.marginBottom = "1px";

    let lastName = document.createElement("input");
    lastName.setAttribute("type", "text");
    lastName.setAttribute("class", "mb-3");
    lastName.setAttribute("id", "reg-lastname");

    let firstNameTitle = document.createElement("p");
    firstNameTitle.innerHTML = "Kereszt név";
    firstNameTitle.style.marginBottom = "1px";

    let firstName = document.createElement("input");
    firstName.setAttribute("type", "text");
    firstName.setAttribute("class", "mb-3");
    firstName.setAttribute("id", "reg-firstname");

    let birthLastNameTitle = document.createElement("p");
    birthLastNameTitle.innerHTML = "Születési vezeték név";
    birthLastNameTitle.style.marginBottom = "1px";

    let birthLastName = document.createElement("input");
    birthLastName.setAttribute("type", "text");
    birthLastName.setAttribute("class", "mb-3");
    birthLastName.setAttribute("id", "reg-birth-lastname");

    let birthFirstNameTitle = document.createElement("p");
    birthFirstNameTitle.innerHTML = "Születési kereszt név";
    birthFirstNameTitle.style.marginBottom = "1px";

    let birthFirstName = document.createElement("input");
    birthFirstName.setAttribute("type", "text");
    birthFirstName.setAttribute("class", "mb-3");
    birthFirstName.setAttribute("id", "reg-birth-firstname");

    let birthDateTitle = document.createElement("p");
    birthDateTitle.innerHTML = "Születési idő";
    birthDateTitle.style.marginBottom = "1px";

    let birthDate = document.createElement("input");
    birthDate.setAttribute("type", "date");
    birthDate.setAttribute("class", "mb-3");
    birthDate.setAttribute("id", "reg-birth-date");

    let mothersLastNameTitle = document.createElement("p");
    mothersLastNameTitle.innerHTML = "Anyja születési vezeték neve";
    mothersLastNameTitle.style.marginBottom = "1px";

    let mothersLastName = document.createElement("input");
    mothersLastName.setAttribute("type", "text");
    mothersLastName.setAttribute("class", "mb-3");
    mothersLastName.setAttribute("id", "mothers-lastname");

    let mothersFirstNameTitle = document.createElement("p");
    mothersFirstNameTitle.innerHTML = "Anyja születési kereszt neve";
    mothersFirstNameTitle.style.marginBottom = "1px";

    let mothersFirstName = document.createElement("input");
    mothersFirstName.setAttribute("type", "text");
    mothersFirstName.setAttribute("class", "mb-3");
    mothersFirstName.setAttribute("id", "mothers-firstname");

    let IDTitle = document.createElement("p");
    IDTitle.innerHTML = "Személyi igazolvány száma";
    IDTitle.style.marginBottom = "1px";

    let IDnumber = document.createElement("input");
    IDnumber.setAttribute("type", "text");
    IDnumber.setAttribute("class", "mb-3");
    IDnumber.setAttribute("id", "id-number");

    let citizenTitle = document.createElement("p");
    citizenTitle.innerHTML = "Állampolgárság";
    citizenTitle.style.marginBottom = "1px";

    let citizen = document.createElement("input");
    citizen.setAttribute("type", "text");
    citizen.setAttribute("id", "citizen");
    citizen.setAttribute("class", "mb-3");

    let countryTitle = document.createElement("p");
    countryTitle.innerHTML = "Ország";
    countryTitle.style.marginBottom = "1px";

    let country = document.createElement("input");
    country.setAttribute("type", "text");
    country.setAttribute("id", "country");
    country.setAttribute("class", "mb-3");

    let cityTitle = document.createElement("p");
    cityTitle.innerHTML = "Város";
    cityTitle.style.marginBottom = "1px";

    let city = document.createElement("input");
    city.setAttribute("type", "text");
    city.setAttribute("id", "city");
    city.setAttribute("class", "mb-3");

    let addressTitle = document.createElement("p");
    addressTitle.innerHTML = "Állandó lakcím";
    addressTitle.style.marginBottom = "1px";

    let address = document.createElement("input");
    address.setAttribute("type", "text");
    address.setAttribute("placeholder", "Irányítószám, utca, házszám...");
    address.setAttribute("id", "residental-address");
    address.setAttribute("class", "mb-3");

    let emailTitle = document.createElement("p");
    emailTitle.innerHTML = "Email";
    emailTitle.style.marginBottom = "1px";

    let email = document.createElement("input");
    email.setAttribute("type", "text");
    email.setAttribute("id", "email-address");
    email.setAttribute("class", "mb-3");

    let phoneTitle = document.createElement("p");
    phoneTitle.innerHTML = "Telefonszám";
    phoneTitle.style.marginBottom = "1px";

    let phone = document.createElement("input");
    phone.setAttribute("type", "text");
    phone.setAttribute("placeholder", "0036701002000");
    phone.setAttribute("id", "phone-number");
    phone.setAttribute("class", "mb-3");

    let br = document.createElement("br");

    let regSubmitButton = document.createElement("button");
    regSubmitButton.setAttribute("class", "btn btn-primary");
    regSubmitButton.setAttribute("onclick", "regSubmit()");
    regSubmitButton.innerHTML = "Regisztráció";

    modalHeader.appendChild(regTitle);
    modalBody.appendChild(lastNameTitle);
    modalBody.appendChild(lastName);
    modalBody.appendChild(firstNameTitle);
    modalBody.appendChild(firstName);
    modalBody.appendChild(birthLastNameTitle);
    modalBody.appendChild(birthLastName);
    modalBody.appendChild(birthFirstNameTitle);
    modalBody.appendChild(birthFirstName);
    modalBody.appendChild(birthDateTitle);
    modalBody.appendChild(birthDate);
    modalBody.appendChild(mothersLastNameTitle);
    modalBody.appendChild(mothersLastName);
    modalBody.appendChild(mothersFirstNameTitle);
    modalBody.appendChild(mothersFirstName);
    modalBody.appendChild(IDTitle);
    modalBody.appendChild(IDnumber);
    modalBody.appendChild(citizenTitle);
    modalBody.appendChild(citizen);
    modalBody.appendChild(countryTitle);
    modalBody.appendChild(country);
    modalBody.appendChild(cityTitle);
    modalBody.appendChild(city);
    modalBody.appendChild(addressTitle);
    modalBody.appendChild(address);
    modalBody.appendChild(emailTitle);
    modalBody.appendChild(email);
    modalBody.appendChild(phoneTitle);
    modalBody.appendChild(phone);
    modalBody.appendChild(br);
    modalBody.appendChild(regSubmitButton);
}

function regSubmit() {
    let rFirstName = document.getElementById("reg-firstname").value;
    let rLastName = document.getElementById("reg-lastname").value;
    let rBirthName = document.getElementById("reg-birth-firstname").value + " " + document.getElementById("reg-birth-lastname").value; 
    let rBirth = document.getElementById("reg-birth-date").value; 
    let rBirthFormatted = new Date(rBirth);
    let rBirthDate = (rBirthFormatted.getTime() + ((70 * 365 + 17) * 24 * 60 * 60 * 1000)) / 1000;
    let rMotherFirst = document.getElementById("mothers-firstname").value; 
    let rMotherLast = document.getElementById("mothers-lastname").value; 
    let rId = document.getElementById("id-number").value; 
    let rCitizen = document.getElementById("citizen").value; 
    let rCountry = document.getElementById("country").value; 
    let rCity = document.getElementById("city").value; 
    let rAddress = document.getElementById("residental-address").value; 
    let rEmail = document.getElementById("email-address").value; 
    let rPhone = document.getElementById("phone-number").value;
    console.log("personal datas: " + rFirstName + " " + rLastName + " " + rBirthName + " " + rBirthDate + " " + rMotherFirst + " " + rMotherLast + " " + rId + " " + rCitizen + " "
          + rCountry + " " + rCity + " " + rAddress + " " + rEmail + " " + rPhone);
    //user(rName, rBirthDate, rMother, rId, rCountry, rCity, rAddress, rEmail, rPhone, rKey, TestUsersAbi);
    let req = "pr=" + prKey + "&acc=" + account + "&firstname=" + rFirstName + "&lastname=" + rLastName + "&birthday=" + rBirthDate + "&motherfirstname=" +
     rMotherFirst + "&motherlastname=" + rMotherLast + "&id=" + rId + "&citizen=" + rCitizen + "&country=" + rCountry + "&city=" + rCity + "&address=" + rAddress + "&email=" + 
     rEmail + "&phone=" + rPhone +  "&birthName=" + rBirthName;
    myAjax("POST", "http://3.126.151.244:3000/register", req, function(status, data) {
        console.log(data);
        console.log(Object.values(data));
        var state = JSON.parse(data);
        //console.log(data.receipt.status);
        if(state.receipt.status == "SUCCESS") {
            //$("#score").html("Hitelminősítés: regisztráció megerősítés alatt");
           // $("#reg-user").empty();
            //$("#reg-user").html("Hamarosan ellenőrzött felhasználó leszel");
            score = 0;
            document.getElementById("reg-firstname").value = "";
            document.getElementById("reg-lastname").value = "";
            document.getElementById("reg-birth-firstname").innerHTML = "";
            document.getElementById("reg-birth-firstname").value = "";
            document.getElementById("reg-birth-lastname").innerHTML = "";
            document.getElementById("reg-birth-lastname").value = "";
            document.getElementById("reg-birth-date").value = "";
            document.getElementById("mothers-firstname").value = ""; 
            document.getElementById("mothers-lastname").value = "";
            document.getElementById("id-number").value = "";
            document.getElementById("country").value = "";
            document.getElementById("citizen").value = "";
            document.getElementById("city").value = "";
            document.getElementById("residental-address").value = "";
            document.getElementById("email-address").value = "";
            document.getElementById("phone-number").value = "";
 
            alert("Sikeres regisztráció");
        }

    });
}

function acceptOffer() {
    let offerToAccept = currentOffer;
    console.log("offerToAccept: " + offerToAccept);
    let capital = offerData[currentOffer].amount;
    let amount = parseInt(document.getElementById("accept-offer-amount").value);
        console.log("amount: " + amount + " " + typeof(amount));
    if(amount == 0 || amount == "") {
          alert("Add meg az összeget, amit kölcsön vennél");
    } else if(amount > capital) {
          alert("Maximum " + capital);
    } else if(amount < 2000) {
        alert("Minimum 2000 MX");
    } else if(score == "You are not verified yet!" || score == "You are not registered!" || score == 0) {
        alert("Csak regisztrált felhasználók vehetnek fel hitelt!");
    } else {        
        let capital = amount;
        let interest = offerData[currentOffer].interest;
        let periods = offerData[currentOffer].periods;
        let redeem = capital * interest / 1000 / (1 - (1 / (Math.pow(1 + (interest / 1000), periods))));
        let payback = parseInt(redeem * periods * 125 / 100);

        console.log("Redeem at accept offer: " + redeem); 
        console.log("redeem: " + redeem + " offer: " + offerToAccept);
        console.log("capital: " + capital + " interest: " + interest + " periods: " + periods + " payback: " + payback);
        
        let req = "pr=" + prKey + "&acc=" + account + "&payback=" + payback + "&offerToAccept=" + offerToAccept + "&amount=" + amount;
        myAjax("POST", "http://3.126.151.244:3000/acceptOffer", req, (err, res) => {
            if(!err) {
                console.log(res, typeof(res));
                closeModal();
                if(res == "SUCCESS") {
                    alert("Sikeresen felvetél " + capital + "MX (" + parseInt(capital) * 3.15 + "Ft) összegű hitelt");
                    listOffers("mc_api", "mc_api_table");
                } else {
                    alert("HIBA, ellenőrizd a hitel felvétel részletei!");
                }                
            } else {
                console.log(err);
            }
        });
    }
}

function setElementsStyle(parentNode, tag, styleAttr, val) {
    var elems = parentNode.getElementsByTagName(tag);
    for(var x = 0; x < elems.length; x++) {
        elems[x].style[styleAttr] = val;
    }
}
//
function nextOffer(data, i) {
    if(i < data.length) {
        var date = {};
        calcDate(data[i].length, date);
        currentOffer = i;
        document.getElementById("offer").innerHTML = "<p>" + data[i].amount + "MX</p><p>" + date.day + " nap</p><p>" + data[i].periods + "</p><p>" + data[i].interest / 10 + "%</p><p>" + data[i].score + "</p>";
        setElementsStyle(document.getElementById("offer"), "p", "margin", "2px");
        i ++;
        document.getElementById("next-button").setAttribute("onclick", "nextOffer(" + JSON.stringify(data) + ", " + i + ")");
        i -= 2;
        document.getElementById("prev-button").setAttribute("onclick", "prevOffer(" + JSON.stringify(data) + ", " + i + ")");
    } 
}

function prevOffer(data, i) {
    if(i < data.length) {
        var date = {};
        calcDate(data[i].length, date);
        currentOffer = i;
        document.getElementById("offer").innerHTML = "<p>" + data[i].amount + "MX</p><p>" + date.day + " nap</p><p>" + data[i].periods + "</p><p>" + data[i].interest / 10 + "%</p><p>" + data[i].score + "</p>";
        setElementsStyle(document.getElementById("offer"), "p", "margin", "2px");
        i --;
        document.getElementById("prev-button").setAttribute("onclick", "prevOffer(" + JSON.stringify(data) + ", " + i + ")");
        i = i + 2;
        document.getElementById("next-button").setAttribute("onclick", "nextOffer(" + JSON.stringify(data) + ", " + i + ")");
    } 
}

function checkSortType() {
    orderSort = document.getElementsByName("offer-detail-name")[0].value;
    console.log("orderSort", orderSort);
    offerData.sort(function(a,b) {return b[orderSort] - a[orderSort]});
    console.log(offerData);
    var date = {};
    calcDate(offerData[0].length, date);
    currentOffer = 0;
    document.getElementById("offer").innerHTML = "<p>" + offerData[0].amount + "MX</p><p>" + date.day + " nap</p><p>" + offerData[0].periods + "</p><p>" + offerData[0].interest / 10 + "%</p><p>" + offerData[0].score + "</p>";
    setElementsStyle(document.getElementById("offer"), "p", "margin", "2px");
    document.getElementById("next-button").setAttribute("onclick", "nextOffer(" + JSON.stringify(offerData) + ", " + 1 + ")");
    document.getElementById("prev-button").setAttribute("onclick", "prevOffer(" + JSON.stringify(offerData) + ", " + 0 + ")");
}

function sortOffers(data) {
    console.log(data);
    console.log("orderSort", orderSort);
}

function listOffers(url) {
    //console.log(url);
    document.getElementById(url).style.background = "gray";
    document.getElementById(url).style.height = "100%";
    var offers = document.createElement("div");
    offers.innerHTML = "<p>Összeg</p><p>Hossz</p><p>Periódusok</p><p>Kamat</p><p>Minimum minősítés</p>";
    offers.style.margin = "10px";
    offers.style.width = "150px";
    offers.style.display = "inline-block";
    setElementsStyle(offers, "p", "margin", "2px");


    myAjax("POST", "http://3.126.151.244:3000/offers", "", function(err, res) {
        if(!err) {
            //console.log(res);
            var offer = document.createElement("div");
            offer.setAttribute("id", "offer");
            offer.setAttribute("value", 1);
            var offerRawData = JSON.parse(res);
            var date = new Date();
            //console.log("NOW: ", date.getTime());
            for(var j = 0; j < offerRawData.length; j++) {
                if(offerRawData[j].amount > 1999 && offerRawData[j].last > date.getTime() / 1000) {
                    offerData.push(offerRawData[j]);
                }
            }

            var orderingSelect = document.createElement("select");
            orderingSelect.setAttribute("name", "offer-detail-name");
            orderingSelect.innerHTML = "<option value=amount>Összeg</option><option value=length>Hossz</option><option value=interest>Kamat</option><option value=score>Minősítés</option>";
            orderSort = orderingSelect.value;
            orderingSelect.setAttribute("onchange", "checkSortType()");

            offerData.sort(function(a,b) {return b[orderSort] - a[orderSort]});
            var strData = JSON.stringify(offerData);
            currentOffer = 0;
            offer.innerHTML = "<p>" + offerData[0].amount + "MX</p><p>" + offerData[0].length / 86400 + " nap</p><p>" + offerData[0].periods + "</p><p>" + offerData[0].interest / 10 + "%</p><p>" + offerData[0].score + "</p>";
            offer.style.margin = "10px";
            offer.style.paddingLeft = "10px";
            offer.style.width = "120px";
            offer.style.textAlign = "right";
            offer.style.display = "inline-block";
            offer.style.borderLeft = "1px white solid";
            setElementsStyle(offer, "p", "margin", "2px");

            var nextDiv = document.createElement("div");
            var nextButton = document.createElement("button");
            nextButton.setAttribute("id", "next-button");
            nextButton.innerHTML = "Következő ajánlat";
            nextButton.setAttribute("onclick", "nextOffer(" + strData + ", " + 1 + ")");

            var prevButton = document.createElement("button");
            prevButton.setAttribute("id", "prev-button");
            prevButton.innerHTML = "Előző ajánlat";
            prevButton.setAttribute("onclick", "prevOffer(" + strData + ", " + 0 + ")");

            var getOfferDetail = document.createElement("button");
            getOfferDetail.setAttribute("id", "get-offer-detail-button");
            getOfferDetail.innerHTML = "Hitel részletei";
            getOfferDetail.setAttribute("onclick", "getOfferDetails()");

            nextDiv.appendChild(nextButton);
            nextDiv.appendChild(prevButton);
            nextDiv.appendChild(orderingSelect);
            if(prKey != "" && account != "") nextDiv.appendChild(getOfferDetail);

            nextDiv.style.marginBottom = "10px";
            nextDiv.style.marginLeft = "10px";

            if(url) {
                if(url == "list-offer-div") {
                    document.getElementById(url).innerHTML = ""; 
                }
                document.getElementById(url).appendChild(offers);
                document.getElementById(url).appendChild(offer);
                document.getElementById(url).appendChild(nextDiv);
            } else {
                document.body.appendChild(offers);
                document.body.appendChild(offer);
                document.body.appendChild(nextDiv);
            }
        } else {
            console.log(err);
        }
    });
}

function getOfferDetails() {
    closeModal();
    createModal("acceptOffer", currentOffer);
}



//listOffers("mc-offers");
//pay("pay", 100);
