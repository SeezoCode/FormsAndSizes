if (!window.address) {
    window.address = 'http://localhost:8080'
}

let print = console.log
let submitButton = document.getElementById('submit');
let textNode
let refreshGraph = true

submitButton.addEventListener('click', () => {
    if (!email.value) {
        alert("Please log in first!")
        login.style.display = 'block';
        animateLogin(.020)
        return
    }

    let valuesObj = {}

    valuesObj.name = document.getElementById('name').value;
    valuesObj.sex = document.getElementById('options').value
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
        let response = await fetch(window.address, {
            method: 'POST',
            'content-Type': 'application/json',
            body: data
        })
        let res = await response.json()

        console.log(res)
        document.getElementById('signedInIndicator').innerHTML = res.message || res

        // let sex = document.getElementById('sex')
        if (!(res.data.message === 'new account created')) updateBoard(res)
    } catch (e) {
        alert('Please turn on the server included with the download... Or just wrong password')
    }
}

function updateBoard(res) {
    try {
        document.getElementById('name').value = res.data.name;
        document.getElementById('age').value = res.data.age;
        document.getElementById('weight').value = res.data.weight;
        document.getElementById('height').value = res.data.height;
        document.getElementById('bmi').innerHTML = "BMI Result: " + String(Math.round(res.data.BMI[res.data.BMI.length-1] * 100) / 100);
        document.getElementById('options').value = res.data.sex;

        if (!chart.data.labels.length || refreshGraph) {
            res.data.BMI.forEach((e, i) => {
                addData(chart, i + 1, e)
            })
            console.log(1, refreshGraph)
            refreshGraph = false
        }
        else {
            addData(chart, res.data.BMI.length, res.data.BMI[res.data.BMI.length-1])
            console.log(2)
        }
        let results = ['Too thin', 'Normal BMI', 'Slightly overweight', 'Obese', 'You are Morbidly Obese!', 'Old Man']
        // document.getElementById('bmiText').innerHTML = getMessageAcross(res.data.BMI, res.data.age, results)
        // spinTextNode(document.getElementById('bmiTextAnim'),
        //     getMessageAcross(res.data.BMI, res.data.age, results), 2, true)
        console.log(res.data.BMI)
        if (JSON.stringify(res.data.BMI) !== JSON.stringify([])) lotteryWrapper(results,
            getMessageAcross(res.data.BMI[res.data.BMI.length-1], res.data.age, results))
    } catch (e) {}
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
    refreshGraph = true
    removeData(chart)
    postToServer(JSON.stringify(values))
})


function getMessageAcross(bmi, age, results) {
    if (!bmi) return ' '
    let ageGroups = [
        [0, 24],
        [25, 34],
        [35, 44],
        [45, 54],
        [55, 64],
        [65, 200]
    ]
    for (let i = 0; i < ageGroups.length; i++) {
        if (age >= ageGroups[i][0] && age <= ageGroups[i][1]) {
            if (bmi < 19 + i)                   return results[0];
            if (bmi >= 19 + i && bmi <= 24 + i) return results[1];
            if (bmi >= 24 + i && bmi <= 29 + i) return results[2];
            if (bmi >= 29 + i && bmi <= 39 + i) return results[3];
            if (bmi > 39 + i)                   return results[4];
        }
    }
    // if (bmi > 60) return 'Chunky Old Man';
    return 'Old Man';
}

loginBox()
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

window.addEventListener('resize', () => loginBox())

function loginBox() {
    let width = window.innerWidth
    document.getElementById('login').style.left = ((width - 242 - 35)) + 'px'
}
window.addEventListener('load', () => animateLogin(.3))

function spinTextNode(element, text, speed, exitScreen) {

    // let time = 0 // 0 represents 0; Pi / 2 represents 1; Pi represents 0
    let width = window.innerWidth
    textNode = spawnText(element, text)
    // console.log(getComputedStyle(textNode))

    gsap.to(textNode, {
        duration: speed / 2,
        fontSize: 80,
        ease: 'sine.out',
        // ease: CustomEase.create('custom', 'M0,0 C0,0 0.169,0.375 0.5,0.5 0.84,0.628 1,1 1,1'),
        x: (width - 100) / 3,
    })

    if (exitScreen) {
        escapeScreen(textNode, speed, width)
    }

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
        let t = document.createTextNode(text);
        h.appendChild(t);
        h.style.display = 'block';
        h.style.position = 'fixed';
        id.appendChild(h)
        h.style.marginLeft = -h.clientWidth + 'px'
        h.id = 'evaluation'
        return h
    }
}


function escapeScreen(textNode, speed, width) {
    gsap.to(textNode, {
        duration: speed / 2,
        fontSize: 30,
        ease: 'sine.in',
        // ease: CustomEase.create('custom', 'M0,0 C0,0 0.169,0.375 0.5,0.5 0.84,0.628 1,1 1,1'),
        x: (width + textNode.clientWidth),
        delay: speed / 2
    })
}

// lotteryWrapper(['Too thin', 'normal', 'Slightly overweight', 'Obese', 'You are Morbidly Obese!'], 'neither')
function lotteryWrapper(options, result) {
    let time = Math.PI / 2;
    let val = 0
    let lastUsedIndex = 0

    let text = document.getElementById('text')
    text.innerHTML = 'resolving...';
    text.style.color = 'rgb(200, 200, 200)'
    text.style.marginLeft = ((window.innerWidth) / 3 - 90) + 'px'

    requestAnimationFrame(hold)
    function hold() {
        let sin = Math.sin(time)
        val += sin
        // console.log(val, Math.sin(time))

        let currIndex = Math.round(val) % options.length

        if (currIndex !== lastUsedIndex) {
            lastUsedIndex = currIndex
            spinTextNode(document.getElementById('bmiTextAnim'), options[currIndex],
                1 / sin ** 1.6 / 5, true)
            // console.log(1 / sin ** 1.6 / 5)
        }
        time += .01
        if (1 / sin ** 1.6 / 5 <= 1 || options[currIndex + 1] !== result) requestAnimationFrame(hold)
        else endLottery()
    }

    function endLottery() {
        setTimeout(() => {
            spinTextNode(document.getElementById('bmiTextAnim'), result,
                5, false)
            setTimeout(() => {
                let text = document.getElementById('text')
                text.innerHTML = result;
                text.style.color = 'rgb(0, 0, 0)'
                text.style.marginLeft = ((window.innerWidth) / 3 - 90) + 'px'
                removeElements()
            }, 3000)
        }, 180)
    }
    // spinTextNode()
}


["AFAB", "Agender", "Aliagender", "AMAB", "Androgyne", "Aporagender", "Bigender", "Binarism", "Body dysphoria", "Boi",
    "Butch", "Cisgender", "Cisnormativity", "Cissexism", "Demiboy", "Demigender", "Demigirl", "Dyadic", "Feminine-of-center",
    "Feminine-presenting", "Femme", "Female-to-male (FTM)", "Gender apathetic", "Gender binary", "Gender dysphoria",
    "Gender expression", "Gender identity", "Gender-neutral pronouns", "Gender nonconforming", "Gender normative",
    "Gender presentation", "Gender questioning", "Gender roles", "Gender variant", "Genderfluid", "Genderfuck", "Genderqueer",
    "Graygender", "Intergender", "Intersex", "Masculine-of-center", "Masculine-presenting", "Maverique", "Misgender",
    "Male-to-female (MTF)", "Multi-gender", "Neutrois", "Nonbinary", "Novigender", "Pangender", "Polygender", "Sex",
    "Sex assigned at birth", "Social dysphoria", "Soft butch", "Stone butch", "Third gender", "Transfeminine",
    "Transgender or trans", "Transmasculine", "Transitioning", "Transsexual", "Trigender", "Two-spirit"].forEach(e => {
    let h = document.createElement('option')
    h.innerHTML = e
    document.getElementById('options').appendChild(h)
})
document.getElementById('options').addEventListener('select', e => console.log(e))


window.addEventListener('scroll', () => removeElements())
function removeElements() {
    document.querySelectorAll('#evaluation').forEach(e => {e.remove()})
}

let chart = new Chart(document.getElementById("line-chart"), {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            data: [],
            label: "BMI",
            borderColor: "#3e95cd",
            fill: false
        },
        {
            data: [],
            label: "Normal",
            borderColor: "#3ecd45",
            fill: false
        }
        ]
    },
    options: {
        title: {
            display: true,
            text: 'Your data visualized'
        }
    }
});

function addData(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    });
    chart.update();
}

function removeData(chart) {
    chart.data.labels = [];
    chart.data.datasets.forEach((dataset) => {
        dataset.data = [];
    });
    chart.update();
}
