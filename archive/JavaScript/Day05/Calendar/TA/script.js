

const myModalAdd = new bootstrap.Modal('#addModal', {
    keyboard: false
})

const myModalEdit = new bootstrap.Modal('#editModal', {
    keyboard: false
})


// 宣告

let today = new Date()
let year = today.getFullYear()
let month = today.getMonth()



// DOM
const preMonthBtn = document.getElementById("preMonth") //上個月
const thisMonthBtn = document.getElementById("thisMonth") //這個月
const nextMonthBtn = document.getElementById("nextMonth") //下個月
const yearMonthDOM = document.querySelector("h3") //年和月

const tbodyDOM = document.querySelector("tbody")

const addon1DOM = document.getElementById("add-addon1")
const addon2DOM = document.getElementById("add-addon2")
const addon3DOM = document.getElementById("add-addon3")
const addon4Btn = document.getElementById("add-addon4")

const editon1DOM = document.getElementById("edit-addon1")
const editon2DOM = document.getElementById("edit-addon2")
const editon3DOM = document.getElementById("edit-addon3")
const editon4Btn = document.getElementById("edit-addon4")
const editon5Btn = document.getElementById("edit-addon5")



// 事件
preMonthBtn.addEventListener("click", function () {
    // 月份-1
    // 0 ~ 11月
    month--
    if (month === -1) {
        year--
        month = 11
    }
    renderDate()
})
thisMonthBtn.addEventListener("click", function () {
    let thisDate = new Date()
    year = thisDate.getFullYear()
    month = thisDate.getMonth()

    renderDate()
})
nextMonthBtn.addEventListener("click", function () {
    month++
    if (month === 12) {
        year++
        month = 0
    }
    renderDate()
})

//新增 Modal 新增按鈕
addon4Btn.addEventListener("click", function(){
    let key = (addon1DOM.value).split('-').join("")
    console.log(key)
    let obj = {
        title : addon2DOM.value,
        content : addon3DOM.value
    }
    // 找 LocalStorage
    let dataArray = []
    let data = getLocalStorage(key)
    if(data == null){
        dataArray.push(obj)
    }else{
        dataArray = data //先繼承舊資料
        dataArray.push(obj)
    }

    // 寫入 LocalStorage FN
    setLocalStorage(key,dataArray)
    myModalAdd.hide()
    renderDate()
})

//編輯 Modal 修改按鈕
editon4Btn.addEventListener("click", function(){
    // 取得 修改後的內容

    let editDate = editon1DOM.value.split("-").join("")
    let editTitle = editon2DOM.value
    let editContent = editon3DOM.value

    // 取得修改的 index
    let index = editon1DOM.getAttribute("data-index")

    // 取得 LocalStoragey 的資料
    let data = getLocalStorage(editDate)
    console.log(data)

    // 把行程塞進物件
    let obj = {
        title : editTitle,
        content : editContent
    }

    // 更新資料
    data[index] = obj
    setLocalStorage(editDate,data)

    myModalEdit.hide()
    renderDate()
    
})

//編輯 Modal 刪除按鈕
editon5Btn.addEventListener("click", function(){
   
    // 刪除的日期
    let editDate = editon1DOM.value.split("-").join("")

    // 要刪除的是哪一筆?
    let index = editon1DOM.getAttribute("data-index")

    // 取得 LocalStoragey 的資料
    let data = getLocalStorage(editDate)

    // 刪除資料
    data.splice(index,1)

    setLocalStorage(editDate,data)

    myModalEdit.hide()
    renderDate()


})



window.onload = function () {

    renderDate()
}

function renderDate() {
    //渲染
    let day = 1
    let nextMonthDay = 1

    tbodyDOM.innerHTML = ""//清空之前的格數

    yearMonthDOM.innerHTML = `${year}年${month + 1}月`

    //第一天 是 禮拜幾?
    // Sunday - Saturday : 0 - 6
    let dayOfMonth = new Date(year, month, 1).getDay()
    console.log("星期" + dayOfMonth)


    //這個月有幾天?
    let dateOfMonth = new Date(year, month + 1, 0).getDate()
    console.log(dateOfMonth + "天")

    // 這個月有幾個禮拜
    // 這個月加上 上個月放到本月的天數 --->需要幾格
    let allDays = dateOfMonth + dayOfMonth
    console.log(allDays)

    let weeks = Math.ceil(allDays / 7)
    console.log(weeks)

    //上個月有幾天?
    let dateOfPreMonth = new Date(year, month, 0).getDate()

    //tr
    for (let i = 0; i < weeks; i++) {
        let trDOM = document.createElement("tr")

        for (let j = 0; j < 7; j++) {
            let tdDOM = document.createElement("td")

            // i = 0 表示第一週
            if (i === 0 && j < dayOfMonth) { //第一天 6
                // tdDOM.innerText = "上個月的日期"
                tdDOM.innerText = dateOfPreMonth-dayOfMonth+1+j
                tdDOM.classList.add("bg-body-secondary")
                tdDOM.classList.add("opacity-25")
            } else {

                if (day <= dateOfMonth) {
                    tdDOM.innerText = day

                    //查詢 日期是否有行程?
                    let key = `${year}${month+1}${day}`
                    let data = getLocalStorage(key)
                    if(data != null){
                        let ulDOM = document.createElement("ul")
                        //印出我的代辦事項
                        data.forEach((item,index) => {
                            let liDOM = document.createElement("li")
                            console.log(item)
                            liDOM.innerText = `${item.title} ${item.content}`
                            //按下代辦事項 事件的綁定
                            let editDay = day
                            liDOM.addEventListener("click",function(e){
                                myModalEdit.show()

                                let editDate =`${year}-${month+1}-${editDay}`
                                editon1DOM.value = editDate
                                editon2DOM.value = item.title
                                editon3DOM.value = item.content
                                editon1DOM.setAttribute("data-index",index)


                                e.stopPropagation()
                            })



                            ulDOM.append(liDOM)
                        });
                        tdDOM.append(ulDOM)
                    }

                    tdDOM.addEventListener("click",tdClickFn.bind(null,year,month,day))



                    day++

                } else {
                    // tdDOM.innerText = "下個月的日期"
                    tdDOM.innerText = nextMonthDay
                    nextMonthDay++
                    tdDOM.classList.add("bg-body-secondary")
                    tdDOM.classList.add("opacity-25")
                }


            }

            trDOM.append(tdDOM)
        }

        tbodyDOM.append(trDOM)
    }

}


function tdClickFn(year,month,day){
    addon1DOM.value = `${year}-${month+1}-${day}`
    myModalAdd.show()
    addon2DOM.value=""
    addon3DOM.value=""

    //取日期 寫到 Modal 的 input.value
}

//取得 localstorage 資料
function getLocalStorage(key){

    let data = JSON.parse(localStorage.getItem(key))

    return data
}

//上傳 localstorage 資料
function setLocalStorage(key,value){

    localStorage.setItem(key,JSON.stringify(value))
} 