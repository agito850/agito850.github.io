const url = "./apple_2023.json";

let productObject;
let _color, _storage, _storageRAM, _storageSSD, _network;
let iPadPic,iPhonePic,MacPic;
let iPadPrice,iPhonePrice,MacPrice;
// let price;
let totalPrice;
let selection;



let productArray;


window.onload = function () {
    iPadSelection = document.querySelector("#iPad-selection");
    iPhoneSelection = document.querySelector("#iPhone-selection");
    MacSelection = document.querySelector("#Mac-selection");
    iPadPrice = document.querySelector(".iPad-price");
    iPhonePrice = document.querySelector(".iPhone-price");
    MacPrice = document.querySelector(".Mac-price");
    totalPrice = document.querySelector(".total-price");
    iPadPic = document.querySelector(".iPad-pic");
    iPhonePic = document.querySelector(".iPhone-pic");
    MacPic = document.querySelector(".Mac-pic");

    let radioColors = document.querySelectorAll("input[name='color']")
    radioColors.forEach(item => {
        item.addEventListener("change", changeColorImg);
    })

    let radioStorage = document.querySelectorAll("input[name='storage']")
    radioStorage.forEach(item => {
        item.addEventListener("change", checkChose);
    })

    let radioStorageRAM = document.querySelectorAll("input[name='storageRAM']")
    radioStorageRAM.forEach(item => {
        item.addEventListener("change", checkChose);
    })

    let radioStorageSSD = document.querySelectorAll("input[name='storageSSD']")
    radioStorageSSD.forEach(item => {
        item.addEventListener("change", checkChose);
    })

    let radioNetwork = document.querySelectorAll("input[name='network']")
    radioNetwork.forEach(item => {
        item.addEventListener("change", checkChose);
    })


    getProductJson();
}

function getProductJson() {
    let xhr = new XMLHttpRequest();
    xhr.onload = function () {
        productObject = JSON.parse(this.responseText);
    };
    xhr.open("GET", url);
    xhr.send();
}

//在color radio選取切換時, 顯示對應的圖片
function changeColorImg() {
    //取得 選取項目
    let checkedColor = document.querySelector("input[name='color']:checked");
    //確定有選擇到
    if (checkedColor == null) {
        return;
    }
    //賦值給 結果
    _color = checkedColor.value;
    console.log(_color)

    //iPad的情況
    if(document.querySelector("#iPad-page").checked){
        productArray = Object.values(productObject.iPad)
        let filterColorObject = productArray[1].filter(x => x.color == _color)[0]
        iPadPic.innerHTML = `<img src="./img/${filterColorObject.ImgUrl}" alt="">`
    }
    //iPhone的情況
    else if(document.querySelector("#iPhone-page").checked){
        productArray = Object.values(productObject.iPhone)
        let filterColorObject = productArray[1].filter(x => x.color == _color)[0]
        iPhonePic.innerHTML = `<img src="./img/${filterColorObject.ImgUrl}" alt="">`

    }
    //Mac的情況
    else if(document.querySelector("#Mac-page").checked){
        productArray = Object.values(productObject.Mac)
        let filterColorObject = productArray[1].filter(x => x.color == _color)[0]
        MacPic.innerHTML = `<img src="./img/${filterColorObject.ImgUrl}" alt="">`
    }

    
}


//在三個radio選取OK後, 顯示最終選取的規格
function checkChose() {

    //取得 選取項目
    let checkedColor = document.querySelector("input[name='color']:checked");
    let checkedStorage = document.querySelector("input[name='storage']:checked");
    let checkedStorageRAM = document.querySelector("input[name='storageRAM']:checked");
    let checkedStorageSSD = document.querySelector("input[name='storageSSD']:checked");
    let checkedNetwork = document.querySelector("input[name='network']:checked");

    //確定都有選擇到
    //iPad的情況
    if(document.querySelector("#iPad-page").checked){
        if (checkedColor == null || checkedStorage == null || checkedNetwork == null) {
            iPadSelection.innerHTML = "";
            return;
        }
    }
    //iPhone的情況
    else if(document.querySelector("#iPhone-page").checked){
        if (checkedColor == null || checkedStorage == null) {
            iPhoneSelection.innerHTML = "";
            return;
        }

    }
    //Mac的情況
    else if(document.querySelector("#Mac-page").checked){
        if (checkedColor == null || checkedStorageRAM == null || checkedStorageSSD == null) {
            MacSelection.innerHTML = "";
            return;
        }
    }

    //賦值給 結果

    _color = checkedColor.value;
    //iPad的情況
    if(document.querySelector("#iPad-page").checked){
        _storage = checkedStorage.value;
        _network = checkedNetwork.value;
        iPadSelection.innerHTML = `color: ${_color}, storage : ${_storage}, network : ${_network}<br/>`;
    }
    //iPhone的情況
    else if(document.querySelector("#iPhone-page").checked){
        _storage = checkedStorage.value;
        iPhoneSelection.innerHTML = `color: ${_color}, storage : ${_storage}<br/>`;
    }
    //Mac的情況
    else if(document.querySelector("#Mac-page").checked){
        _storageRAM = checkedStorageRAM.value;
        _storageSSD = checkedStorageSSD.value;
        MacSelection.innerHTML = `color: ${_color}, storageRAM : ${_storageRAM}, storageSSD : ${_storageSSD}<br/>`;
    }

    getPrice()
}


//列出符合規格的清單
function getPrice() {

    iPadPrice.innerHTML = "";
    iPhonePrice.innerHTML = "";
    MacPrice.innerHTML = "";
    console.log(productArray[2])
    
    let filterObject;

    //iPad的情況
    if(document.querySelector("#iPad-page").checked){
        filterObject = productArray[2].filter(x => x.storage == _storage && x.network == _network)
        console.log(filterObject)
        iPadPrice.innerHTML = `<h3>NT$ ${JSON.stringify(filterObject[0].price)} </h3>`;
    }
    //iPhone的情況
    else if(document.querySelector("#iPhone-page").checked){
        filterObject = productArray[2].filter(x => x.storage == _storage)
        console.log(filterObject)
        iPhonePrice.innerHTML = `<h3>NT$ ${JSON.stringify(filterObject[0].price)} </h3>`;
    }
    //Mac的情況
    else if(document.querySelector("#Mac-page").checked){
        filterObject = productArray[2].filter(x => x.storageRAM == _storageRAM && x.storageSSD == _storageSSD)
        console.log(filterObject)
        MacPrice.innerHTML = `<h3>NT$ ${JSON.stringify(filterObject[0].price)} </h3>`;
    }

    
    
    totalPrice.innerHTML = `NT$ ${JSON.stringify(filterObject[0].price)} `;
}