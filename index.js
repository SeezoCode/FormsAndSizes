let print = console.log
let submitButton = document.getElementById('submit');

submitButton.addEventListener('click', () => {
    if (!email.value) {
        alert("Please log in first!")
        login.style.display = 'block';
        animateLogin(.025)
        return
    }

    let valuesObj = {}

    valuesObj.name = document.getElementById('name').value;
    for (let sex of document.querySelectorAll('input[name="sex"]')) {
        if (sex.checked) valuesObj.sex = sex.id;
    }
    valuesObj.age = document.getElementById('age').value;
    valuesObj.weight = document.getElementById('weight').value;
    valuesObj.height = document.getElementById('height').value;

    valuesObj.type = 'bmiData'
    valuesObj.email = email.value
    print(valuesObj)

    postToServer(JSON.stringify(valuesObj))
})

async function postToServer(data) {
    try {
        let response = await fetch('http://localhost:8080', {
            method: 'POST',
            'content-Type': 'application/json',
            body: data
        })
        let res = await response.json()

        console.log(res)
        document.getElementById('signedInIndicator').innerHTML = res.message || res

        // let sex = document.getElementById('sex')
        if (!(res.data.message === 'new account created')) updateBoard(res)
    }
    catch (e) {
        alert('Please turn on the server included with the download')
    }
}

function updateBoard(res) {
    try {
        document.getElementById('name').value = res.data.name;
        document.getElementById('age').value = res.data.age;
        document.getElementById('weight').value = res.data.weight;
        document.getElementById('height').value = res.data.height;
        document.getElementById('bmi').innerHTML = "BMI Result: " + String(Math.round(res.data.BMI * 100) / 100);
        for (let sex of document.querySelectorAll('input[name="sex"]')) {
            sex.checked = res.data.sex === sex.id;
        }

        let results = ['Too thin', 'normal', 'Slightly overweight', 'Obese', 'You are Morbidly Obese!']
        document.getElementById('bmiText').innerHTML = getMessageAcross(res.data.BMI, res.data.age, results)
        spinTextNode(document.getElementById('bmiTextAnim'), results[4], 2)
    }
    catch (e) {}
}

let login = document.getElementById('login')
login.on = false;
document.getElementById('yourProfile').addEventListener('click', e => {
    login.on = !login.on;

    if (login.on) login.style.display = 'block';
    else login.style.display = 'none';

    animateLogin(.05)
})


let email = document.getElementById('email')
let password = document.getElementById('password')
let loginSubmit = document.getElementById('loginSubmit')
loginSubmit.addEventListener('click', () => {
    let values = {}
    values.email = email.value;
    values.password = password.value;
    values.type = 'login';
    postToServer(JSON.stringify(values))
})


function getMessageAcross(bmi, age, results) {
    if (!bmi) return '&nbsp;'
    let ageGroups = [[0,24], [25, 34], [35, 44], [45, 54], [55, 64], [65, 200]]
    for (let i = 0; i < ageGroups.length; i++) {
        if (age >= ageGroups[i][0] && age <= ageGroups[i][1]) {
            if (bmi < 19 + i)                   return results[0];
            if (bmi >= 19 + i && bmi <= 24 + i) return results[1];
            if (bmi >= 24 + i && bmi <= 29 + i) return results[2];
            if (bmi >= 29 + i && bmi <= 39 + i) return results[3];
            if (bmi > 39 + i)                   return results[4];
        }
    }
    if (bmi > 60)                               return 'Chunky Old Man';
                                                return 'Old Man';
}


function animateLogin(speed) {
    let time = Math.PI / 2
    requestAnimationFrame(hold)
    function hold() {
        let cos = Math.cos(time) + .904
        if (time <= Math.PI) {
            document.getElementById('login').style.top = -(cos * 420) + 'px'
            time += speed
            requestAnimationFrame(hold)
        }
    }
}

loginBox()
window.addEventListener('resize', () => loginBox())
function loginBox() {
    let width = window.innerWidth
    document.getElementById('login').style.left = ((width - 242 - 35)) + 'px'
}
window.addEventListener('load', () => animateLogin(.3))

function spinTextNode(element, text, speed) {
    // let time = 0 // 0 represents 0; Pi / 2 represents 1; Pi represents 0
    let width = window.innerWidth
    let textNode = spawnText(element, text)
    console.log(textNode)

    gsap.to(textNode, {
        duration: speed / 2,
        fontSize: 50,
        ease: 'sine.out',
        // ease: CustomEase.create('custom', 'M0,0 C0,0 0.169,0.375 0.5,0.5 0.84,0.628 1,1 1,1'),
        x: (width + textNode.clientWidth / 2) / 2,
    })

    gsap.to(textNode, {
        duration: speed / 2,
        fontSize: 30,
        ease: 'sine.in',
        // ease: CustomEase.create('custom', 'M0,0 C0,0 0.169,0.375 0.5,0.5 0.84,0.628 1,1 1,1'),
        x: (width + textNode.clientWidth),
        delay: speed / 2
    })

    // function hold() {
    //     let sin = Math.sin(time)
    //     time += .01
    //     console.log(time, sin)
    //
    //     textNode.style.marginLeft = (sin * width) + 'px'
    //     if (time <= Math.PI) requestAnimationFrame(hold)
    // }
    function spawnText(id, text) {
        let h = document.createElement("p");
        let t = document.createTextNode("Hello World");
        h.appendChild(t);
        h.style.display = 'block';
        h.style.position = 'fixed';
        id.appendChild(h)
        h.style.marginLeft = -h.clientWidth + 'px'
        return h
    }
}


