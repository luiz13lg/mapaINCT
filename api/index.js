const shell = require('shelljs');
const fs = require('fs');
const express = require('express');
const app = express();
const cron = require("node-cron");
const cors = require('cors');

app.use(cors());
const bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '1mb'}));  

let arquivoEstacoes = fs.readFileSync('marcadores.json', 'utf-8');
const dadosEstacoes = JSON.parse(arquivoEstacoes);

let arquivoEstacoesInativas = fs.readFileSync('marcadores-inativos.json', 'utf-8');
const dadosEstacoesInativas = JSON.parse(arquivoEstacoesInativas);


app.listen(3013,() => {                //servidor startado
	console.log('API rodando na porta: 3013')
})

app.get('/', cors(), function (req, res) {          //resposta ao get
    console.log("Recuperando log atual.");
    // let teste = shell.exec("zabbix &",{silent:true}).stdout;
    try{
		let nomeLog = obterUltimoLog();		
		let data = fs.readFileSync(`logs/${nomeLog}`, 'utf-8');
		
		data = converterJSON(data);
        res.write(data);
    }catch (err) {
        console.error("Erro ao obter o log das estações ativas:");
		console.log(err);
		res.write(err);
    }
    res.end();
});

app.get('/desativados', cors(), function (req, res) {          //resposta ao get
    console.log("acessado desativados.");
    try{
		let data = fs.readFileSync('marcadores-inativos.json', 'utf-8');
        res.write(data);
    }catch (err) {
        console.error("Erro ao obter o log das estações inativas:");
		console.log(err);
		res.write(err);
    }
    res.end();
});

app.get('/obterLogsDisponiveis', cors(), function (req, res) {          //resposta ao get
    console.log("acessado logs disponíveis.");
    try{
		let data = shell.exec("ls logs/",{silent:true}).stdout;
        res.write(data);
    }catch (err) {
        console.error("Erro ao obter lista de logs");
		console.log(err);
		res.write(err);
    }
    res.end();
});

app.post('/obterLogSelecionado', cors(), function (req, res) {          //resposta ao get
    console.log("acessado logs disponíveis: " + req.body.log);
    try{
		let data = fs.readFileSync(`logs/${req.body.log}`, 'utf-8');
		data = converterJSON(data);
		res.write(data);
    }catch (err) {
        console.error("Erro ao obter lista de logs");
		console.log(err);
		res.write(err);
    }
    res.end();
});

// index.js
// run with node --experimental-worker index.js on Node.js 10.x

function converterJSON(string){
	let primeiro_indice, segundo_indice = 0;
	let json = "\{\"type\":\"FeatureCollection\",\"features\":["

	primeiro_indice = string.indexOf('<tr><td>',primeiro_indice);
	segundo_indice = string.indexOf('</td></tr>',segundo_indice);

	let dados = string.slice(primeiro_indice, segundo_indice);
	let primeiro_dado, segundo_dado = 0;
	let estacao;
	
	json += "\{\"type\":\"Feature\",\"properties\":\{"
	primeiro_dado = dados.indexOf('<td>',(primeiro_dado+1));
	segundo_dado = dados.indexOf('</td>',(segundo_dado+1));
	estacao = dados.slice(primeiro_dado+4, segundo_dado);
	json += `"Station": "${estacao}",`;

	primeiro_dado = dados.indexOf('<td>',(primeiro_dado+1));
	segundo_dado = dados.indexOf('</td>',(segundo_dado+1));
	dado = dados.slice(primeiro_dado+4, segundo_dado);
	json += `"Last": "${dado}",`;

	primeiro_dado = dados.indexOf('<td>',(primeiro_dado+1));
	segundo_dado = dados.indexOf('</td>',(segundo_dado+1));
	dado = dados.slice(primeiro_dado+4, segundo_dado);
	json += `"Size": "${dado}",`;

	primeiro_dado = dados.indexOf('<td>',(primeiro_dado+1));
	segundo_dado = dados.indexOf('</td>',(segundo_dado+1));
	dado = dados.slice(primeiro_dado+4, segundo_dado);
	json += `"Received": "${dado}",`;

	primeiro_dado = dados.indexOf('<td>',(primeiro_dado+1));
	segundo_dado = dados.indexOf('</td>',(segundo_dado+1));
	dado = dados.slice(primeiro_dado+4, segundo_dado);

    primeiro_status = dado.indexOf(">");
    segundo_status = dado.indexOf("</");
    dado = dado.slice(primeiro_status+1,segundo_status);
	json += `"Status": "${dado}"},`
    
	primeiro_status = dado.indexOf(">");
	segundo_status = dado.indexOf("</");
	dado = dado.slice(primeiro_status+1,segundo_status);
	json += dadosEstacoes[estacao];
	json += "},"

	for(let auxString = 1; auxString < 17; auxString++){
		primeiro_indice = string.indexOf('<tr><td>',(primeiro_indice+10));
		segundo_indice = string.indexOf('</td></tr>',(segundo_indice+10));
		dados = string.slice(primeiro_indice, segundo_indice);

		primeiro_dado = segundo_dado = 0;
		json += "\{\"type\":\"Feature\",\"properties\":\{"
		primeiro_dado = dados.indexOf('<td>',(primeiro_dado+1));
		segundo_dado = dados.indexOf('</td>',(segundo_dado+1));
		estacao = dados.slice(primeiro_dado+4, segundo_dado);
		json += `"Station": "${estacao}",`;

		primeiro_dado = dados.indexOf('<td>',(primeiro_dado+1));
		segundo_dado = dados.indexOf('</td>',(segundo_dado+1));
		dado = dados.slice(primeiro_dado+4, segundo_dado);
		json += `"Last": "${dado}",`;

		primeiro_dado = dados.indexOf('<td>',(primeiro_dado+1));
		segundo_dado = dados.indexOf('</td>',(segundo_dado+1));
		dado = dados.slice(primeiro_dado+4, segundo_dado);
		json += `"Size": "${dado}",`;

		primeiro_dado = dados.indexOf('<td>',(primeiro_dado+1));
		segundo_dado = dados.indexOf('</td>',(segundo_dado+1));
		dado = dados.slice(primeiro_dado+4, segundo_dado);
		json += `"Received": "${dado}",`;

		primeiro_dado = dados.indexOf('<td>',(primeiro_dado+1));
		segundo_dado = dados.indexOf('</td>',(segundo_dado+1));
		dado = dados.slice(primeiro_dado+4, segundo_dado);
		
		primeiro_status = dado.indexOf(">");
		segundo_status = dado.indexOf("</");
		dado = dado.slice(primeiro_status+1,segundo_status);
		
		json += `"Status": "${dado}"},`;
		json += dadosEstacoes[estacao];
		json += "},"
	}

	primeiro_dado = segundo_dado = 0;
	json += "\{\"type\":\"Feature\",\"properties\":\{"
	primeiro_dado = dados.indexOf('<td>',(primeiro_dado+1));
	segundo_dado = dados.indexOf('</td>',(segundo_dado+1));
	estacao = dados.slice(primeiro_dado+4, segundo_dado);
	json += `"Station": "${estacao}",`;

	primeiro_dado = dados.indexOf('<td>',(primeiro_dado+1));
	segundo_dado = dados.indexOf('</td>',(segundo_dado+1));
	dado = dados.slice(primeiro_dado+4, segundo_dado);
	json += `"Last": "${dado}",`;

	primeiro_dado = dados.indexOf('<td>',(primeiro_dado+1));
	segundo_dado = dados.indexOf('</td>',(segundo_dado+1));
	dado = dados.slice(primeiro_dado+4, segundo_dado);
	json += `"Size": "${dado}",`;

	primeiro_dado = dados.indexOf('<td>',(primeiro_dado+1));
	segundo_dado = dados.indexOf('</td>',(segundo_dado+1));
	dado = dados.slice(primeiro_dado+4, segundo_dado);
	json += `"Received": "${dado}",`;

	primeiro_dado = dados.indexOf('<td>',(primeiro_dado+1));
	segundo_dado = dados.indexOf('</td>',(segundo_dado+1));
	dado = dados.slice(primeiro_dado+4, segundo_dado);
	
	primeiro_status = dado.indexOf(">");
	segundo_status = dado.indexOf("</");
	dado = dado.slice(primeiro_status+1,segundo_status);
	
	json += `"Status": "${dado}"},`;
	json += dadosEstacoes[estacao];
	json += "}"
	json += "\]\}";

	return json;
}

function obterUltimoLog(){
	let data = new Date();
	
	if(data.getMinutes() >= 30) return `log-${data.getDate()}-${data.getHours()}h${30}.txt`
		else return `log-${data.getDate()}-${data.getHours()}h0.txt`
}

cron.schedule("0 */30 * * * *", function() {
	let data = new Date();
	console.log("Log gerado");

	//executar zabbix aqui
	let teste = shell.exec(`ls > logs/log-${data.getDate()}-${data.getHours()}h${data.getMinutes()}.txt`,{silent:true}).stdout;
  });