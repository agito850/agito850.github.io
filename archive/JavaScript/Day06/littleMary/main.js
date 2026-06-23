const brickData =[
    {
        id: '1',
        color: 'pink',
        icon: 'fa-solid fa-horse',
        target: function(){
            return 'Horse'
        }
    },
    {
        id: '2',
        color: 'sandybrown',
        icon: 'fa-solid fa-frog',
        target: function(){
            return 'Frog'
        }
    },
    {
        id: '3',
        color: 'khaki',
        icon: 'fa-solid fa-dog',
        target: function(){
            return 'Dog'
        }
    },
    {
        id: '4',
        color: 'darkseagreen',
        icon: 'fa-solid fa-dove',
        target: function(){
            return 'Dove'
        }
    },
    {
        id: '5',
        color: 'paleTurquoise',
        icon: 'fa-solid fa-cow',
        target: function(){
            return 'Cow'
        }
    },
    {
        id: '6',
        color: 'pink',
        icon: 'fa-solid fa-horse',
        target: function(){
            return 'Horse'
        }
    },
    {
        id: '7',
        color: 'sandybrown',
        icon: 'fa-solid fa-frog',
        target: function(){
            return 'Frog'
        }
    },
    {
        id: '8',
        color: 'khaki',
        icon: 'fa-solid fa-dog',
        target: function(){
            return 'Dog'
        }
    },
    {
        id: '9',
        color: 'darkseagreen',
        icon: 'fa-solid fa-dove',
        target: function(){
            return 'Dove'
        }
    },
    {
        id: '10',
        color: 'paleTurquoise',
        icon: 'fa-solid fa-cow',
        target: function(){
            return 'Cow'
        }
    },
    {
        id: '11',
        color: 'pink',
        icon: 'fa-solid fa-horse',
        target: function(){
            return 'Horse'
        }
    },
    {
        id: '12',
        color: 'sandybrown',
        icon: 'fa-solid fa-frog',
        target: function(){
            return 'Frog'
        }
    },
    {
        id: '13',
        color: 'khaki',
        icon: 'fa-solid fa-dog',
        target: function(){
            return 'Dog'
        }
    },
    {
        id: '14',
        color: 'darkseagreen',
        icon: 'fa-solid fa-dove',
        target: function(){
            return 'Dove'
        }
    },
    {
        id: '15',
        color: 'paleTurquoise',
        icon: 'fa-solid fa-cow',
        target: function(){
            return 'Cow'
        }
    },
    {
        id: '16',
        color: 'pink',
        icon: 'fa-solid fa-horse',
        target: function(){
            return 'Horse'
        }
    },
    {
        id: '17',
        color: 'sandybrown',
        icon: 'fa-solid fa-frog',
        target: function(){
            return 'Frog'
        }
    },
    {
        id: '18',
        color: 'khaki',
        icon: 'fa-solid fa-dog',
        target: function(){
            return 'Dog'
        }
    },
    {
        id: '19',
        color: 'darkseagreen',
        icon: 'fa-solid fa-dove',
        target: function(){
            return 'Dove'
        }
    },
    {
        id: '20',
        color: 'paleTurquoise',
        icon: 'fa-solid fa-cow',
        target: function(){
            return 'Cow'
        }
    },
    {
        id: '21',
        color: 'pink',
        icon: 'fa-solid fa-horse',
        target: function(){
            return 'Horse'
        }
    },
    {
        id: '22',
        color: 'sandybrown',
        icon: 'fa-solid fa-frog',
        target: function(){
            return 'Frog'
        }
    },
    {
        id: '23',
        color: 'khaki',
        icon: 'fa-solid fa-dog',
        target: function(){
            return 'Dog'
        }
    },
    {
        id: '24',
        color: 'darkseagreen',
        icon: 'fa-solid fa-dove',
        target: function(){
            return 'Dove'
        }
    },
    {
        id: '25',
        color: 'paleTurquoise',
        icon: 'fa-solid fa-cow',
        target: function(){
            return 'Cow'
        }
    },
    {
        id: '26',
        color: 'pink',
        icon: 'fa-solid fa-horse',
        target: function(){
            return 'Horse'
        }
    },
    {
        id: '27',
        color: 'sandybrown',
        icon: 'fa-solid fa-frog',
        target: function(){
            return 'Frog'
        }
    },
    {
        id: '28',
        color: 'khaki',
        icon: 'fa-solid fa-dog',
        target: function(){
            return 'Dog'
        }
    },
    {
        id: '29',
        color: 'darkseagreen',
        icon: 'fa-solid fa-dove',
        target: function(){
            return 'Dove'
        }
    },
    {
        id: '30',
        color: 'paleTurquoise',
        icon: 'fa-solid fa-cow',
        target: function(){
            return 'Cow'
        }
    },
    {
        id: '31',
        color: 'pink',
        icon: 'fa-solid fa-horse',
        target: function(){
            return 'Horse'
        }
    },
    {
        id: '32',
        color: 'sandybrown',
        icon: 'fa-solid fa-frog',
        target: function(){
            return 'Frog'
        }
    }
] 

//宣告全域變數
let bricks;

let steps = 0   //剩餘的步數
let allSteps = 0    //全部的步數
let currentIndex = 0    //目前走到哪一格

let speed;   //速率(越大代表越慢)

window.onload = function(){
    makeBricks()

    //Start 按鈕事件
    document.querySelector('button').addEventListener('click',function(){
        speed = 35
        //Math.random會取 0 ~ 31 之間的數  取完再+1 給random(1~32之間)
        let random = Math.floor(Math.random() * brickData.length) + 1
        console.log(random)
        steps = random + (2 * bricks.length)//多跑兩圈再走到獎項
        allSteps = steps
        turnAround()
    })
}


function makeBricks(){
    bricks = document.querySelectorAll('[box-id]')
    bricks = Array.from(bricks).sort((a,b) => {
        //把抓到的box DOM物件 依照box-id排序
        return a.getAttributeNode('box-id').value - b.getAttributeNode('box-id').value
    })
    console.log(bricks)
    bricks.forEach((x,index) => {
        let id = index + 1
        let data = brickData.find(x => x.id == id)
        let icon = document.createElement('i')
        icon.setAttribute('class',data.icon)
        icon.style.color = data.color
        x.append(icon)
    })
}

function turnAround(){
    bricks[currentIndex].classList.remove('active')//先去掉上一圈的紀錄
    currentIndex++ //0 ~ 31

    if(currentIndex >= bricks.length){  currentIndex = 0 }

    bricks[currentIndex].classList.add('active')
    steps--

    //一般版本:
    // if( steps > 0){
    //     setTimeout(turnAround,speed)
    // }else{
    //     //  跑完了
    //     let msgBox = document.getElementById('msg')
    //     let val = brickData[currentIndex].target()
    //     msgBox.innerText = `✎您的動物好朋友  ☛  ${val}`
    // }

    //變速版本:
    if( steps > 0){
        setTimeout(turnAround,speed)

        // 當剩下1/3時減速
        if(steps < Math.floor((allSteps/3))){   speed += 7 }
    }else{
        //  跑完了
        let msgBox = document.getElementById('msg')
        let val = brickData[currentIndex].target()
        msgBox.innerText = `✎您的動物好朋友  ☛  ${val}`
    }

}
