const express = require('express');
const bodyParser = require('body-parser');
const users = require('./users');

const app = express();

app.use(bodyParser.json());
app.post('/auth', (req, res) => {
    const { login, password } = req.body;
    const [user] = users.filter(user => user.login === login && user.password === password) || [];

    if (user) {
        res.json({ ok: true, user });
    } else {
        res.status(401).json({ ok: false, error: { message: 'Пользователь не найден' } });
    }
});
app.use(express.static(__dirname + '/public'));

app.listen(8080, function() {
    console.log('Example app listening on port 8080!');
});
