
const http = require('http');
let users = []

class Person {
    constructor(email, password) {
        this.email = email
        this.password = password
        this.message = "new account created"
        this.data = {
            name: '',
            sex: '',
            age: '',
            weight: '',
            height: '',
            BMI: 0
        }
    }

    updateBMI() {
        this.data.BMI = Number(this.data.weight) / Number(this.data.height / 100) ** 2;
}
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
            if (data.name != user.data.name && data.name != '') user.data.name = data.name;
            if (data.sex != user.data.sex && data.sex != '') user.data.sex = data.sex;
            if (data.age != user.data.age && data.age != '') user.data.age = data.age;
            if (data.weight != user.data.weight && data.weight != '') user.data.weight = data.weight;
            if (data.height != user.data.height && data.height != '') user.data.height = data.height;
            user.updateBMI()
            // user.data = data;
            user.message = 'user update successful!'
            return user
        }
    }
    return 'no user found'
}


const server = http.createServer();
server.on('request', (req, res) => {
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



setInterval(() => {
    console.log(users);
}, 10000);