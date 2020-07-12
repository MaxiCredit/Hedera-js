let offers = [];
let account = "";
let prKey = "";
let score = "";
let newAcc = [];
let currentOffer = "";

let modalFlag = false;
let newAccSaved = false;

function calcDate(sec, target) {
    let remainDay = parseInt(sec / 86400);
    let rd = sec % 86400;
    let remainHour = parseInt(rd / 3600);
    let rh = sec % 3600;
    let remainMin = parseInt(rh / 60);
    target.remainDay = remainDay;
    target.remainHour = remainHour;
    target.remainMin = remainMin;
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

let apiDiv = document.getElementById("mc_api");

function appendModal(type, id) {
    if(modalFlag == false) {
        createModal(type, id);
    } else {
        let modal = document.getElementsByClassName("modal");
        document.body.removeChild(modal);
        createModal(type, id);
    }
}

function createModal(type, str) {
    console.log("Create modal", type);
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
    setModal(type, str, modalHeader, modalBody);

    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalContent.appendChild(modalFooter);
    modalDialog.appendChild(modalContent);
    modal.appendChild(modalDialog);
    
    
    //apiDiv.replaceChild(modal, document.getElementById("mc_api_table"));
    modalFlag = true;
}

function setModal(type, id, modalHeader, modalBody) {
    console.log("SET modal:", type);
    switch(type) {
        case "login" : loginModal(modalHeader, modalBody);
            break;
        case "saveNewAccount" : saveNewAccountModal(modalHeader, modalBody);
            break;
        case "acceptOffer" : acceptOfferModal(modalHeader, modalBody);
            break;
        case "register" : registerModal(modalHeader, modalBody);
            break;
        default :
    }
}

function loginModal(modalHeader, modalBody) {

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
    
        let loginKey = document.createElement("input");
        loginKey.setAttribute("type", "file");
        loginKey.setAttribute("id", "login-key");
        loginKey.setAttribute("class", "mb-3");
    
        modalHeader.appendChild(loginTitle);
        loginDiv.appendChild(loginUserTitle);
        loginDiv.appendChild(loginUser);
        loginDiv.appendChild(loginPwTitle);
        loginDiv.appendChild(loginPw);
        loginDiv.appendChild(loginKeyTitle);
        loginDiv.appendChild(loginKey);
    
        let br = document.createElement("br");
        loginDiv.appendChild(br);
    
        let loginButton = document.createElement("button");
        loginButton.setAttribute("class", "btn btn-primary mr-2");
        loginButton.setAttribute("onclick", "login()");
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
        createModal("acceptOffer", currentOffer);
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
    let offerMaxText = document.createTextNode("Maximum elfogadható hitel összeg: " + offers[currentOffer].amount + "MX (" + offers[currentOffer].amount * 3.15 + "Ft)");
    offerMaxTitle.appendChild(offerMaxText);

    let offerAnnumRateTitle = document.createElement("p");
    let offerAnnumRateText = document.createTextNode("Éves kamat: " + parseFloat(annumInterest(offers[currentOffer].length, offers[currentOffer].periods, offers[currentOffer].interest)).toFixed(2) + "%");
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
    $.post("http://3.126.151.244:3000//register", {"pr" : prKey, "acc" : account, "firstname" : rFirstName, "lastname" : rLastName, "birthday" : rBirthDate, "motherfirstname" : rMotherFirst, "motherlastname" : rMotherLast, "id" : rId, "citizen" : rCitizen, "country" : rCountry, "city" : rCity, "address" : rAddress, "email" : rEmail, "phone" : rPhone, "birthName" : rBirthName}, function(data, status) {
        console.log(data);
        console.log(data.receipt.status);
        if(data.receipt.status == "SUCCESS") {
            //$("#score").html("Hitelminősítés: regisztráció megerősítés alatt");
           // $("#reg-user").empty();
            //$("#reg-user").html("Hamarosan ellenőrzött felhasználó leszel");
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
            alert("Sikeres regisztráció");
            /*
            $("#private-key").val("");
            
            $("#register-tab").html("My details");
            $("#register").attr("class" , "tab-pane fade");
            $("#acc").attr("class" , "tab-pane fade show active");
            $("#reg-user").attr("class" , "d-visible p-3");
            $("#mod-user").attr("class" , "d-none");*/
        }

    });
}

function calcRedeem() {
    let capital = parseInt(document.getElementById("accept-offer-amount").value);
    let interest = offers[currentOffer].interest;
    let periods = offers[currentOffer].periods;
    if(capital > 1999 && capital <= offers[currentOffer].amount) {
        let redeem = capital * interest / 1000 / (1 - (1 / (Math.pow(1 + (interest / 1000), periods))));
        document.getElementById("offer-details").innerHTML = "Kézhez kapott összeg: " + parseInt(capital * 995 / 1000) + "MX (" + parseInt(capital * 995 /1000 * 3.15) + "Ft), törlesztő részlet: " + parseInt(redeem) + "MX (" + parseInt(redeem * 3.15) + "Ft), összesen visszafizetendő: " + parseInt(redeem * periods) + "MX (" + parseInt(redeem * periods * 3.15) + "Ft)";
    } else {
        document.getElementById("offer-details").innerHTML = "Minimum 2000MX, maximum " + offers[currentOffer].amount + "MX összegű hitel vehető fel ezen ajánlat keretében";
    }
}


function acceptOffer() {
    let offerToAccept = currentOffer;
    console.log("offerToAccept: " + offerToAccept);
    let capital = offers[currentOffer].amount;
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
        let interest = offers[currentOffer].interest;
        let periods = offers[currentOffer].periods;
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
        /*
        $.post('acceptOffer', {'pr' : prKey, 'acc' : account, 'payback' : payback, 'offerToAccept' : offerToAccept, 'amount' : amount}, function(data, status) {
            console.log(status);
            console.log(data);
        });*/
    }
}

function closeModal() {
    let modal = document.getElementById("modal");
    console.log(modal);
    document.body.removeChild(modal);
    //apiDiv.removeChild(modal);
    //listOffers("mc_api", "modal");
    modalFlag = false;
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

function loginAjax(req) {
    myAjax("POST", "http://3.126.151.244:3000/client", req, function(err, res) {
        if(!err) {
            console.log(res);
            let data = JSON.parse(res);
            score = data.registration;
            if(score > 0) {
                closeModal();
                createModal("acceptOffer", currentOffer);
            } else if(score == 0 || score == "You are not verified yet!") {
                closeModal();
                alert("Jelenleg nem vagy megerősített felhasználó! A regisztrációd nem sokára ellenőrzésre kerül.");
            } else {
                closeModal();
                createModal("register", "");
            }
        } else {
            console.log(err);
        }
    });
}

function login() {
    let keyFile = document.getElementById("login-key").files[0];
    account = document.getElementById("login-user").value;
    prKey = document.getElementById("login-pw").value;
    
    if(account && prKey) {
        let req = "pr=" + prKey + "&acc=" + account;
        loginAjax(req);
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
                loginAjax(req);
            }
        } else {
            console.log("Hiányzó számlaszám vagy privátkulcs!");
        }
    }
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

function listOffers(url, old_table) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let data = this.response; 
            if(data != "There is no credit offer") {
                //console.log(data); 
                offers = JSON.parse(data);
                let table = document.createElement("table");
                table.setAttribute("class", "table table-dark table-hover");
                table.setAttribute("id", "mc_api_table");
                let table_head_row = document.createElement("tr");
                let table_head_elements = ["Kölcsönadó", "Hitel összege", "Futamidő", "Periódusok", "Kamat", "Minősítés", "Lejárat"];

                for(k = 0; k < table_head_elements.length; k++) {
                    let head_content = document.createTextNode(table_head_elements[k]);
                    let table_head_data = document.createElement("th");
                    table_head_data.appendChild(head_content);
                    table_head_row.appendChild(table_head_data);
                }

                table.appendChild(table_head_row);
                
                for(j = 0; j < offers.length; j++) {
                    let table_row = document.createElement("tr");
                    table_row.setAttribute("class", "offers-row");
                    table_row.setAttribute("id", j);
                    table_row.setAttribute("onclick", "getOfferDetails(" + j + ")");
                    table_row.setAttribute("onmouseover", "style.background='blue'");
                    table_row.setAttribute("onmouseout", "style.background='black'");
                    let values = Object.values(offers[j]);
                    console.log(values);

                    for(i = 0; i < 7; i++) {
                        let contentText = values[i];
                        let date = new Date();
                        let now = date.getTime() / 1000;
                        if(values[1] > 1999 && values[6] > now) {
                            if(i == 2) {
                                let myDate = {};
                                calcDate(values[i], myDate);
                                contentText = myDate.remainDay + "nap";
                            }
                            if(i == 4) {
                                contentText = values[i] / 10 + "% (" + parseFloat(annumInterest(values[2], values[3], values[4])).toFixed(2) + "%)";
                            }
                            if(i == 6) {
                                let myDate = {};
                                
                                calculateRemaining(values[i], now, myDate);
                                contentText = myDate.remainDay + "nap " + myDate.remainHour + "óra " + myDate.remainMin + "perc"; 
                            }
                            let content = document.createTextNode(contentText);
                            let table_data = document.createElement("td");
                            table_data.appendChild(content);
                            table_row.appendChild(table_data);
                        }
                    }
                    table.appendChild(table_row);
                } else {
                    document.getElementByID(old_table).innerHtml = "<tr><td>Jelenleg nincs ajánlat</td></tr>";
                }

                console.log(old_table);
                console.log(document.getElementById(old_table));
                document.getElementById(url).replaceChild(table, document.getElementById(old_table));
            }
        }
    };
    xhttp.open("POST", "http://3.126.151.244:3000/offers", true);
    xhttp.setRequestHeader("Content-type", "text/plain");
    xhttp.send();
}

listOffers("mc_api", "mc_api_table");

function getOfferDetails(id) {
    currentOffer = id;
    appendModal("login", id);
}
