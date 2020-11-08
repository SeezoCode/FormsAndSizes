let addr
const http = require('http');
const fs = require('fs')
require('dns').lookup(require('os').hostname(), function (err, add, fam) {
    console.log(`http://${add}:8080`);
    addr = `http://${add}:8080`
})

let users
try {
    users = JSON.parse(fs.readFileSync('data.txt'))
    console.log('data read')
}
catch (e) {
    users = []
    fs.writeFileSync('data.txt', JSON.stringify([]))
    console.log('created new dataset')
}

class Person {
    constructor(email, password) {
        this.email = email
        this.password = password
        this.message = "new account created"
        this.data = {
            name: '',
            sex: '',
            age: '',
            weight: [],
            height: [],
            BMI: []
        }
    }

    // updateBMI() {
    //     this.data.BMI.push(Number(this.data.weight) / Number(this.data.height / 100) ** 2);
// }
}
function updateBMI(user) {
    user.data.BMI.push(Number(user.data.weight[user.data.weight.length-1]) / Number(user.data.height[user.data.height.length-1] / 100) ** 2);
}
function pushWeight(user, weight) {
    user.data.weight.push(weight);
}
function pushHeight(user, height) {
    user.data.height.push(height);
}

function userControl(email, password) {
    for (let user of users) {
        if (user.email === email) {
            if (user.password === password) {
                user.message = 'Logged in'
                return user
            }
            return 'wrong password'
        }
    }
    users.push(new Person(email, password));
    return users[users.length - 1]
}

function userData(email, data) {
    for (let user of users) {
        if (user.email === email) {
            if (data.name !== user.data.name && data.name !== '') user.data.name = data.name;
            if (data.sex !== user.data.sex && data.sex !== '') user.data.sex = data.sex;
            if (data.age !== user.data.age && data.age !== '') user.data.age = data.age;
            // if (data.weight !== user.data.weight && data.weight !== '') user.data.weight = data.weight;
            // if (data.height !== user.data.height && data.height !== '') user.data.height = data.height;
            pushHeight(user, data.height)
            pushWeight(user, data.weight)
            updateBMI(user)
            // user.data = data;
            user.message = 'user update successful!'
            return user
        }
    }
    return 'no user found'
}


const server = http.createServer();
server.on('request', (req, res) => {
    if (req.method === 'GET') {
        res.writeHead(200, {
            'Content-Type': 'text/HTML',
            'Access-Control-Allow-Origin': '*',
        });
        res.write(`${fs.readFileSync('index.html')} <script>window.address = '${addr}'; ${fs.readFileSync('index.js')}</script>`)
        res.end()
    }
    if (req.method === 'POST') {
        let data = readStream(req).then(data => {
            data = JSON.parse(data);
            // console.log(data)
            if (data.type === 'login') {
                console.log('login: ', data)
                response(res, JSON.stringify(userControl(data.email, data.password)))
            }
            else {
                console.log('BMI data: ', data)
                response(res, JSON.stringify(userData(data.email, data)))
            }
            fs.writeFile('data.txt', JSON.stringify(users), err => {
                if (err) console.log('error: ', err)
                else console.log("Write to file successful")
            })
        })
    }
})
server.listen(8080);


function response(res, data) {
    res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
    });
    res.end(data)
}

function readStream(stream) {
    return new Promise((resolve, reject) => {
        let data = "";
        stream.on("error", reject);
        stream.on("data", chunk => data += chunk.toString());
        stream.on("end", () => {
            resolve(data);
        })
    })
}



// setInterval(() => {
//     console.log(users);
// }, 10000);