// 每個月的名稱
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

let calendar;
let monthList;
let monthPicker;
let currMonth;
let currYear;
let currDate;

let downLoad;

let schedDate;
let schedTime;
let schedLocation;
let schedContent;
let schedColor;
let btnAddSchedule;
let btnReviseSchedule;
let btnClearSchedule;

let clickP

let timeArray;
let timeYear;
let timeMonth;
let timeDate;

let scheduleModal;
let coverBg;



window.onload = function () {
    // localStorage 刪除重置魔法
    // localStorage.removeItem('EverySchedule');


    // 抓 Modal視窗
    scheduleModal = document.querySelector(".schedule-modal")
    // 抓 fixed背景
    coverBg = document.querySelector(".cover-bg")

    // 抓 月曆本體
    calendar = document.querySelector(".calendar")
    // 抓 月份總表 
    monthList = calendar.querySelector(".month-list")
    // 抓 月份按鈕(目前顯示的月份)
    monthPicker = calendar.querySelector("#month-picker")


    // 製作 月份總表


    // 先製作一次"現在" 的月曆
    currDate = new Date() // () 中間沒給值的話 就是"現在"的意思
    currMonth = { value: currDate.getMonth() }
    currYear = { value: currDate.getFullYear() }
    generateCalendar(currMonth.value, currYear.value)

    makeMonthList()


    // 按下月份後 會跳出各個月份的月曆
    monthPicker.addEventListener("click", () => {
        monthList.classList.add("show")
    })

    // 按下前 後三角 會顯示不同年份
    document.querySelector("#prev-year").addEventListener("click", () => {
        --currYear.value
        generateCalendar(currMonth.value, currYear.value)
    })
    document.querySelector("#next-year").addEventListener("click", () => {
        ++currYear.value
        generateCalendar(currMonth.value, currYear.value)
    })

    // 按下x Modal消失
    document.querySelector(".close").addEventListener("click", () => {
        scheduleModal.style.display = "none"
        coverBg.style.display = "none"
    })

    //  ----------印出所有localStorage活動---------------
    downLoad = JSON.parse(localStorage.getItem('EverySchedule'))
    printAllSched()





    // ----------新增活動---------------


    btnAdd = document.querySelector("#add-schedule")
    btnAddSchedule = document.querySelector("#btn-add-schedule")
    btnReviseSchedule = document.querySelector("#btn-revise-schedule")
    btnClearSchedule = document.querySelector("#btn-clear-schedule")

    //按下+號
    btnAdd.addEventListener("click", () => {
        document.querySelector('input[type="date"]').value = ""
        document.querySelector('input[type="time"]').value = ""
        document.querySelector('.sched-location').value = ""
        document.querySelector('.sched-content').value = ""
        document.querySelector('input[type="color"]').value = "#f4a460"
        scheduleModal.style.display = "block"
        coverBg.style.display = "block"
    })


    //檢測 是否 日期 時間 活動內容有寫(地點不一定要)
    btnAddSchedule.addEventListener("click", () => {
        saveModalToDownload()
        creatModalToP()
    })


    //按下每個活動p 就跳出該活動的Modal視窗
    document.querySelectorAll("p").forEach((elementP) => {
        elementP.addEventListener("click", () => {

            //從downLoad裡尋找與p相同id的物件
            clickP = elementP
            let s = downLoad.find(element => element.id == elementP.id)
            //開啟Modal
            scheduleModal.style.display = "block"
            coverBg.style.display = "block"

            document.querySelector('input[type="date"]').value = s.completeDate
            document.querySelector('input[type="time"]').value = s.todolist[0].time
            document.querySelector('.sched-location').value = s.todolist[0].at
            document.querySelector('.sched-content').value = s.todolist[0].todo
            document.querySelector('input[type="color"]').value = s.todolist[0].color


        })
    })

    //修改活動 按鈕
    btnReviseSchedule.addEventListener("click", () => {
        //刪除downLoad裡 同id的活動
        let clearId = downLoad.findIndex(element => element.id == clickP.id)
        downLoad.splice(clearId, 1)


        saveModalToDownload()
        changeModalToP()
    })

    //刪除所有活動(重置)
    btnClearSchedule.addEventListener("click", () => {
        // 重置功能:
        // localStorage.removeItem('EverySchedule');

        // // 行程以JSON格式設計
        // let sched = {
        //     id:"2023-7-15",completeDate: "2023-07-15",year:2023,month:7,date:15,
        //     todolist:[{ time:"18:00",at:"學校",todo:"寫作業",color:"#992445" }]
        // }
        // let sched2 = {
        //     id:"2023-7-24",completeDate: "2023-07-24",year:2023,month:7,date:24,
        //     todolist:[{ time:"09:00",at:"家",todo:"看書",color:"#226445" }]
        // }
        // downLoad=[sched,sched2]
        // // 行程陣列(資料們)轉成字串 儲存在LocalStorage
        // localStorage.setItem("EverySchedule", JSON.stringify(downLoad));

        let clearId = downLoad.findIndex(element => element.id == clickP.id)
        downLoad.splice(clearId, 1)
        let theDay = document.querySelector(`.day-${clickP.id}`)
        theDay.innerHTML=""

        // 行程陣列(資料們)轉成字串 儲存在LocalStorage
        localStorage.setItem("EverySchedule", JSON.stringify(downLoad));

        scheduleModal.style.display = "none"
        coverBg.style.display = "none"
    })





}


function printAllSched() {
    //抓到現有的活動 

    if (downLoad == null) { return }
    downLoad.forEach(s => {
        let idArray = s.id.split("-")
        idYear = parseInt(idArray[0], 10)
        idMonth = parseInt(idArray[1], 10)
        idDate = parseInt(idArray[2], 10)
        // 找出符合的日期格子
        let theSchedDay = document.querySelector(`.day-${idYear}-${idMonth}-${idDate}`)

        // 建立 p
        let p = document.createElement("p")
        p.setAttribute("id", s.id);
        if (s.todolist[0].at) {
            p.innerHTML = `<span>● </span> ${s.todolist[0].time} 在${s.todolist[0].at} ${s.todolist[0].todo}`
        } else {
            p.innerHTML = `<span>● </span> ${s.todolist[0].time} ${s.todolist[0].todo}`
        }


        //圓點icon換色
        let pointIcon = p.querySelector("span")
        pointIcon.style.color = s.todolist[0].color

        theSchedDay.append(p)


    })

}

function saveModalToDownload() {
    schedDate = document.querySelector('input[type="date"]').value
    schedTime = document.querySelector('input[type="time"]').value
    schedLocation = document.querySelector('.sched-location').value
    schedContent = document.querySelector('.sched-content').value
    schedColor = document.querySelector('input[type="color"]').value

    timeArray = schedDate.split("-")
    timeYear = parseInt(timeArray[0], 10)
    timeMonth = parseInt(timeArray[1], 10)
    timeDate = parseInt(timeArray[2], 10)

    // 行程以JSON格式設計
    // let sched = {
    //     id:"2023-07-15",year:2023,month:7,date:28,
    //     todoolist:[{ time:"18:00",at:"學校",todo:"寫作業",color:"#ff0000" }]
    // }
    let sched = {
        id: `${timeYear}-${timeMonth}-${timeDate}`,
        completeDate: schedDate,
        year: timeYear,
        month: timeMonth,
        date: timeDate,
        todolist: [
            {
                time: schedTime,
                at: schedLocation,
                todo: schedContent,
                color: schedColor
            }
        ]
    }
    downLoad.push(sched)
    // 行程陣列(資料們)轉成字串 儲存在LocalStorage
    localStorage.setItem("EverySchedule", JSON.stringify(downLoad));
}

function creatModalToP() {
    // 將localStorage的行程顯示在月曆上
    let SchedDayClass = `.day-${timeYear}-${timeMonth}-${timeDate}`
    let theSchedDay = document.querySelector(SchedDayClass)
    let p = document.createElement("p")
    p.setAttribute("id", `${timeYear}-${timeMonth}-${timeDate}`);
    if (schedLocation) {
        p.innerHTML = `<span>● </span> ${schedTime} 在${schedLocation} ${schedContent}`
    } else {
        p.innerHTML = `<span>● </span> ${schedTime} ${schedContent}`
    }


    //圓點icon換色
    let pointIcon = p.querySelector("span")
    pointIcon.style.color = schedColor


    //關閉Modal
    scheduleModal.style.display = "none"
    coverBg.style.display = "none"

    theSchedDay.append(p)
}

function changeModalToP() {
    // 將localStorage的行程顯示在月曆上
    let SchedDayClass = `.day-${timeYear}-${timeMonth}-${timeDate}`
    let theSchedDay = document.querySelector(SchedDayClass)
    //刪除原本的p 建立新p
    //theSchedDay.innerHTML = ""//用這句會跳出錯誤 不知道為什麼QQ
    let p = theSchedDay.querySelector("p")
    p.setAttribute("id", `${timeYear}-${timeMonth}-${timeDate}`);
    if (schedLocation) {
        p.innerHTML = `<span>● </span> ${schedTime} 在${schedLocation} ${schedContent}`
    } else {
        p.innerHTML = `<span>● </span> ${schedTime} ${schedContent}`
    }


    //圓點icon換色
    let pointIcon = p.querySelector("span")
    pointIcon.style.color = schedColor


    //關閉Modal
    scheduleModal.style.display = "none"
    coverBg.style.display = "none"

    theSchedDay.append(p)
}


// 設定閏月的規則
function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 100 === 0 && year % 400 === 0)
}

// 判斷 此年是否有閏月 及 2月天數
function getFebDays(year) {
    return isLeapYear(year) ? 29 : 28
}

// 製作 月份總表
function makeMonthList() {
    // 把剛剛列出來的月份一個一個顯示出來 加上html
    monthNames.forEach((m, index) => {
        let monthDiv = document.createElement("div")
        monthDiv.innerHTML = `<div date-month="${index}">${m}</div>`

        // 設置每個月的 按鈕事件
        monthDiv.querySelector("div").addEventListener("click", () => {
            monthList.classList.remove("show")
            currMonth.value = index
            generateCalendar(index, currYear.value)
        })

        monthList.append(monthDiv)
    })
}

// 產生日曆格式
function generateCalendar(month, year) {

    // 抓 年 月
    let calendar_days = calendar.querySelector(".calendar-days")
    let calendar_header_year = calendar.querySelector("#year")
    // 訂出該年的 每月的 天數
    let days_of_month = [31, getFebDays(year), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

    calendar_days.innerHTML = ""


    // // 抓現在的日期
    // let currDate = new Date()
    // // if(!month) 什麼意思? undefined嗎?
    // if (!month) { month = currDate.getMonth() }
    // if (!year) { year = currDate.getFullYear() }

    currMonth_name = `${monthNames[month]}`
    monthPicker.innerHTML = currMonth_name
    calendar_header_year.innerHTML = year

    let first_day = new Date(year, month, 1)

    // getDay() 找出指定日期是 星期幾
    // Sunday - Saturday : 0 - 6
    // days_of_month[month] + first_day.getDay() - 1 意思是:
    // 計算該月需要幾個格子 = 總天數 + 1日開始是星期幾 - 1(因為i從0開始跑)
    for (let i = 0; i <= days_of_month[month] + first_day.getDay() - 1; i++) {
        let dayContainer = document.createElement("div")
        dayContainer.classList.add("day-container")
        let day;
        if (i >= first_day.getDay()) {//確定前面要空幾格
            day = document.createElement("div")
            day.classList.add("dayBC")
            // 目前是第幾格 - 此月份的1日在第幾格 + 從1開始數
            day.innerHTML = `<span class="day-num">${i - first_day.getDay() + 1}</span>`
            day.innerHTML += `<div class="schedToday day-${year}-${month + 1}-${i - first_day.getDay() + 1}"></div>` //當天活動
            if (i - first_day.getDay() + 1 === currDate.getDate() && month === currDate.getMonth() && year === currDate.getFullYear()) {
                let todayDiv = day.querySelector(".day-num")
                todayDiv.classList.add("curr-date")

                // day.classList.add("curr-date")
            }
            dayContainer.append(day)
        }

        calendar_days.append(dayContainer)
    }
}





