const shell = require('shelljs');
const fs = require('fs');
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());

console.log('Server is running.');

app.listen(3013,() => {                //servidor startado
    console.log('API rodando na porta: 3013')
})

app.get('/', cors(), function (req, res) {          //resposta ao get
    console.log("acessado.");
    // shell.exec("comando zabbix aqui!");
    try{
        let data = fs.readFileSync('log.txt', 'utf-8');
        // console.log(data);
        res.write(data);
    }catch (err) {
        console.error("Erro ao obter o log das estações:");
        console.log(err);
    }
    res.end();
});