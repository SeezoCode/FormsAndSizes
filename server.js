// Here: ↓ ↓ ↓ ↓ ↓ ↓
const IP = 'localhost'
//       ↑ ↑ ↑ ↑ ↑ ↑
// Address automatically fills in port and everything necessary
let addr
const port = 8080
const http = require('http');
const fs = require('fs')

const { networkInterfaces } = require('os');

const nets = networkInterfaces();
const results = Object.create(null); // or just '{}', an empty object

for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        // skip over non-ipv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === 'IPv4' && !net.internal) {
            if (!results[name]) {
                results[name] = [];
            }

            results[name].push(net.address);
        }
    }
}

addr = `http://${IP}:${port}`
console.log("Your IPs: ", results)
console.log("Your link: ", addr)
console.log(`If you would like to use a different IP (perhaps to enable access on your phone), edit line 2 in server.js`)


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

function getAllBmi() {
    return users.map(user => {
        return {
            data: user.data.BMI,
            name: user.data.name
        }
    })
}

function userControl(email, password) {
    email.replace(' ', '')
    email = email.toLowerCase()

    for (let user of users) {
        if (user.email === email) {
            if (user.password === password) {
                user.message = 'Logged in'
                user.data.allBMI = getAllBmi()
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
            user.data.allBMI = getAllBmi()
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
server.listen(port);


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