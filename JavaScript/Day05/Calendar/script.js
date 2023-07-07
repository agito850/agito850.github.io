// 每個月的名稱
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

let calendar;
let monthList;
let monthPicker;
let currMonth, currYear, currDate;
let downLoad;

let schedDate, schedTime, schedLocation, schedContent, schedColor;
let btnAddSchedule, btnReviseSchedule, btnClearSchedule;

let clickP

let timeArray, timeYear, timeMonth, timeDate;

let scheduleModal, coverBg;



window.onload = function () {
    // DOM

    scheduleModal = document.querySelector(".schedule-modal")// Modal視窗
    coverBg = document.querySelector(".cover-bg")// fixed背景

    calendar = document.querySelector(".calendar")// 月曆本體
    monthList = calendar.querySelector(".month-list")// 月份總表
    monthPicker = calendar.querySelector("#month-picker")// 月份按鈕(目前顯示的月份)

    btnAdd = document.querySelector("#add-schedule")
    btnAddSchedule = document.querySelector("#btn-add-schedule")
    btnReviseSchedule = document.querySelector("#btn-revise-schedule")
    btnClearSchedule = document.querySelector("#btn-clear-schedule")


    // 先製作一次"現在" 的月曆
    currDate = new Date() // () 中間沒給值的話 就是"現在"的意思
    currMonth = { value: currDate.getMonth() }
    currYear = { value: currDate.getFullYear() }
    generateCalendar(currMonth.value, currYear.value)
    makeMonthList()// 製作 月份總表

    // 按下右上的月份後 會跳出12個月
    monthPicker.addEventListener("click", () => {
        monthList.classList.add("show")
    })

    // 按下前 後三角 會顯示不同年份
    document.querySelector("#prev-year").addEventListener("click", () => {
        --currYear.value
        generateCalendar(currMonth.value, currYear.value)
        printAllSched()
        pAddClickEvent()
    })
    document.querySelector("#next-year").addEventListener("click", () => {
        ++currYear.value
        generateCalendar(currMonth.value, currYear.value)
        printAllSched()
        pAddClickEvent()
    })

    //  ----------印出所有localStorage活動---------------
    downLoad = JSON.parse(localStorage.getItem('EverySchedule'))
    printAllSched()
    pAddClickEvent()



    // ----------新增活動---------------


    //按下各日期格子




    //按下+號
    btnAdd.addEventListener("click", () => {
        document.querySelector('input[type="date"]').value = ""
        let maxDay = new Date(currYear.value, currMonth.value + 1, 0).getDate()
        let month = currMonth.value + 1
        if (month < 10) { month = "0" + month }
        document.querySelector('input[type="date"]').max = `${currYear.value}-${month}-${maxDay}`
        document.querySelector('input[type="date"]').min = `${currYear.value}-${month}-01`
        document.querySelector('input[type="time"]').value = ""
        document.querySelector('.sched-location').value = ""
        document.querySelector('.sched-content').value = ""
        document.querySelector('input[type="color"]').value = "#f4a460"
        scheduleModal.style.display = "block"
        coverBg.style.display = "block"
        btnAddSchedule.disabled = false
        btnReviseSchedule.disabled = true
        btnClearSchedule.disabled = true

    })


    //新增活動
    btnAddSchedule.addEventListener("click", () => {
        saveModalToDownload()
        creatModalToP()
        pAddClickEvent()
    })



    //修改活動
    btnReviseSchedule.addEventListener("click", () => {

        clearThisP()
        saveModalToDownload()
        creatModalToP()
        pAddClickEvent()
    })

    //刪除活動
    btnClearSchedule.addEventListener("click", () => {

        clearThisP()
        // 行程陣列(資料們)轉成字串 儲存在LocalStorage
        localStorage.setItem("EverySchedule", JSON.stringify(downLoad));
        scheduleModal.style.display = "none"
        coverBg.style.display = "none"

    })

    // 關閉 Modal
    document.querySelector(".close").addEventListener("click", () => {
        scheduleModal.style.display = "none"
        coverBg.style.display = "none"
        btnAddSchedule.disabled = true
        btnReviseSchedule.disabled = false
        btnClearSchedule.disabled = false
    })
}

//印出現有的活動 
function printAllSched() {


    if (downLoad == null) {
        downLoad = []
        localStorage.setItem("EverySchedule", JSON.stringify(downLoad));
    }
    downLoad.forEach(s => {
        let idArray = s.id.split("-")
        idYear = parseInt(idArray[0], 10)
        idMonth = parseInt(idArray[1], 10)
        idDate = parseInt(idArray[2], 10)
        if (idYear == currYear.value && idMonth == currMonth.value + 1) {

            // 找出符合的日期格子
            let theSchedDay = document.querySelector(`.day-${idYear}-${idMonth}-${idDate}`)


            s.todolist.forEach((t, idx) => {
                // 建立 p
                let p = document.createElement("p")
                p.setAttribute("class", "p-" + s.id);
                p.setAttribute("id", `count-${idx + 1}`);
                if (t.at) {
                    p.innerHTML = `<span>● </span> ${t.time} 在${t.at} ${t.todo}`
                } else {
                    p.innerHTML = `<span>● </span> ${t.time} ${t.todo}`
                }


                //圓點icon換色
                let pointIcon = p.querySelector("span")
                pointIcon.style.color = t.color

                theSchedDay.append(p)
            })

        }

    })

}

function clearThisP() {
    let clickpDay = clickP.className.replace("p-", "");//移除前面 p-
    let theDay = document.querySelector(`.day-${clickpDay}`)

    let day = downLoad.find(element => "p-" + element.id == clickP.className)
    let clearId = downLoad.findIndex(element => "p-" + element.id == clickP.className)
    if (day.todolist.length == 1) { //假如這天只有一個活動
        downLoad.splice(clearId, 1)//刪掉這天

        //清空格子
        let clickpDay = clickP.className.stringify().TrimStart("p-");//移除前面 p-
        let theDay = document.querySelector(`.day-${clickpDay}`)
        theDay.innerHTML = ""
    } else {
        for (let i = 0; i < day.todolist.length; i++) {
            if (clickP.id == "count-" + (i + 1)) {
                day.todolist.splice(i, 1)
                console.log(theDay)
                console.log(clickP)
                theDay.removeChild(clickP)
            }
        }

    }
}

//按下每個活動p 就跳出該活動的Modal視窗
function pAddClickEvent() {

    document.querySelectorAll("p").forEach((elementP) => {
        elementP.addEventListener("click", (e) => {
            
            e.stopPropagation();
            //從downLoad裡尋找與p相同id的物件
            clickP = elementP
            let day = downLoad.find(element => "p-" + element.id == elementP.className)
            let s;


            for (let i = 0; i < day.todolist.length; i++) {
                if (elementP.id == "count-" + (i + 1)) {
                    s = day.todolist[i]
                }
            }




            //開啟Modal
            scheduleModal.style.display = "block"
            coverBg.style.display = "block"

            document.querySelector('input[type="date"]').value = day.completeDate
            document.querySelector('input[type="time"]').value = s.time
            document.querySelector('.sched-location').value = s.at
            document.querySelector('.sched-content').value = s.todo
            document.querySelector('input[type="color"]').value = s.color


        })
    })

    btnAddSchedule.disabled = true
    btnReviseSchedule.disabled = false
    btnClearSchedule.disabled = false

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

    //判斷是否同一天已經有p 有->創進todolist 沒有->創sched
    let sched;
    if (downLoad.find(sched => sched.id == `${timeYear}-${timeMonth}-${timeDate}`)) {
        sched = downLoad.find(sched => sched.id == `${timeYear}-${timeMonth}-${timeDate}`)
        let todo = {
            time: schedTime,
            at: schedLocation,
            todo: schedContent,
            color: schedColor
        }
        sched.todolist.push(todo)
    } else {
        sched = {
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
    }


    //downLoad todolist重新排序
    downLoad.forEach(s => {
        // s.todolist.sort(function (a, b) {
        //     return a.time < b.time;
        // });
        s.todolist.sort(function (a, b) {
            return a.time.localeCompare(b.time);
        });
    })
    console.log(downLoad)
    // 行程陣列(資料們)轉成字串 儲存在LocalStorage
    localStorage.setItem("EverySchedule", JSON.stringify(downLoad));
}

function creatModalToP() {
    // 將localStorage的行程顯示在月曆上
    let SchedDayClass = `.day-${timeYear}-${timeMonth}-${timeDate}`
    let theSchedDay = document.querySelector(SchedDayClass)
    let p = document.createElement("p")

    p.setAttribute("class", `p-${timeYear}-${timeMonth}-${timeDate}`);
    p.setAttribute("id", "count-1");
    if (schedLocation) {
        p.innerHTML = `<span>● </span> ${schedTime} 在${schedLocation} ${schedContent}`
    } else {
        p.innerHTML = `<span>● </span> ${schedTime} ${schedContent}`
    }
    //圓點icon換色
    let pointIcon = p.querySelector("span")
    pointIcon.style.color = schedColor

    theSchedDay.append(p)
    let countArray = document.querySelectorAll(`.p-${timeYear}-${timeMonth}-${timeDate}`)
    //假如 加完新的p之後 有一個p以上 重排id="count"
    if (countArray.length > 1) {
        //判斷時間順序 再加count
        let countArraySort = [...countArray].sort(function (a, b) {
            let aTime = a.innerText.substr(2, 5)
            let bTime = b.innerText.substr(2, 5)
            return aTime.localeCompare(bTime);
        });
        console.log(countArraySort)
        theSchedDay.innerHTML = ""
        for (let i = 0; i < countArraySort.length; i++) {
            let p = countArraySort[i]
            p.setAttribute("id", `count-${i + 1}`);
            theSchedDay.append(p)
        }
    }


    //關閉Modal
    scheduleModal.style.display = "none"
    coverBg.style.display = "none"
}

//-----------------------------------------------月曆生成

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
            printAllSched()
            pAddClickEvent()
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
            day.addEventListener("click", function () {
                let monthWith0 = month + 1
                if (monthWith0 < 10) { monthWith0 = "0" + monthWith0 }
                let dayWith0 = i - first_day.getDay() + 1
                if (dayWith0 < 10) { dayWith0 = "0" + dayWith0 }
                document.querySelector('input[type="date"]').value = `${year}-${monthWith0}-${dayWith0}`
                document.querySelector('input[type="time"]').value = ""
                document.querySelector('.sched-location').value = ""
                document.querySelector('.sched-content').value = ""
                document.querySelector('input[type="color"]').value = "#f4a460"
                scheduleModal.style.display = "block"
                coverBg.style.display = "block"
                btnAddSchedule.disabled = false
                btnReviseSchedule.disabled = true
                btnClearSchedule.disabled = true
            })


            dayContainer.append(day)
        }

        calendar_days.append(dayContainer)
    }
}





