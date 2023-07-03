
// 每個月的名稱
const month_names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

let calendar;
let month_list;
let month_picker;
let curr_month;
let curr_year;
let currDate;



window.onload = function () {

    // 抓 月曆本體
    calendar = document.querySelector(".calendar")
    // 抓 月份總表 
    month_list = calendar.querySelector(".month-list")
    // 抓 月份按鈕(目前顯示的月份)
    month_picker = calendar.querySelector("#month-picker")
    // 製作 月份總表
    

    // 先製作一次"現在" 的月曆
    currDate = new Date() // () 中間沒給值的話 就是"現在"的意思
    curr_month = { value: currDate.getMonth() }
    curr_year = { value: currDate.getFullYear() }
    generateCalendar(curr_month.value, curr_year.value)

    makeMonthList()


    // 按下月份後 會跳出各個月份的月曆
    month_picker.addEventListener("click", () => {
        month_list.classList.add("show")
    })

    // 按下前 後三角 會顯示不同年份
    document.querySelector("#prev-year").addEventListener("click", () => {
        --curr_year.value
        generateCalendar(curr_month.value, curr_year.value)
    })
    document.querySelector("#next-year").addEventListener("click", () => {
        ++curr_year.value
        generateCalendar(curr_month.value, curr_year.value)
    })

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
function makeMonthList(){
    // 把剛剛列出來的月份一個一個顯示出來 加上html
    month_names.forEach((m, index) => {
        let monthDiv = document.createElement("div")
        monthDiv.innerHTML = `<div date-month="${index}">${m}</div>`

        // 設置每個月的 按鈕事件
        monthDiv.querySelector("div").addEventListener("click", () => {
            month_list.classList.remove("show")
            curr_month.value = index
            generateCalendar(index, curr_year.value)
        })

        month_list.append(monthDiv)
    })
}

// 產生日曆格式
function generateCalendar(month, year){
    
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

    curr_month_name = `${month_names[month]}`
    month_picker.innerHTML = curr_month_name
    calendar_header_year.innerHTML = year

    let first_day = new Date(year, month, 1)

    // getDay() 找出指定日期是 星期幾
    // Sunday - Saturday : 0 - 6
    // days_of_month[month] + first_day.getDay() - 1 意思是:
    // 計算該月需要幾個格子 = 總天數 + 1日開始是星期幾 - 1(因為i從0開始跑)
    for (let i = 0; i <= days_of_month[month] + first_day.getDay() - 1; i++) {
        let dayContainer = document.createElement("div")
        dayContainer.classList.add("day-container")
        let dayBC;
        let day;
        if (i >= first_day.getDay()) {//確定前面要空幾格
            dayBC = document.createElement("div")
            dayBC.classList.add("dayBC")
            day = document.createElement("div")
            day.classList.add("calendar-day-hover")
            // 目前是第幾格 - 此月份的1日在第幾格 + 從1開始數
            day.innerHTML = i - first_day.getDay() + 1
            day.innerHTML += `<span></span>` //裝飾圓圈
            if (i - first_day.getDay() + 1 === currDate.getDate() && year === currDate.getFullYear()) {
                day.classList.add("curr-date")
            }
            dayBC.append(day)
            dayContainer.append(dayBC)
        }
        
        calendar_days.append(dayContainer)
    }
}





