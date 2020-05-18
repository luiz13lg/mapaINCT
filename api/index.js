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
		let data = fs.readFileSync(nomeLog, 'utf-8');

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

app.post('/obterLogsDisponiveis', cors(), function (req, res) {          //resposta ao get
    console.log("acessado logs disponíveis.");
    try{
		data = req.body.data.split("-"); // ano-mes-dia

		let ano = data[0]
		let mes = data[1];
		let dia = data[2];
		
		if(mes.charAt(0) === '0') mes = mes.charAt(1) 

		logsDisponiveis = shell.exec(`ls logs/${ano}/${mes}/${dia}/`,{silent:true}).stdout;
		res.write(logsDisponiveis);

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
	let ano = data.getFullYear();
	let mes = data.getMonth()+1;
	let dia = data.getDate();
	let hora = data.getHours();
	let minutos = data.getMinutes();

	if(minutos >= 30) return `logs/${ano}/${mes}/${dia}/log-${dia}-${hora}h30.txt`
		else return `logs/${ano}/${mes}/${dia}/log-${dia}-${hora}h0.txt`
}

cron.schedule("0 */30 * * * *", function() {
	let data = new Date();
	let ano = data.getFullYear();
	let mes = data.getMonth()+1;
	let dia = data.getDate();
	let hora = data.getHours();
	let minutos = data.getMinutes();
	console.log("Log gerado");

	//executar zabbix aqui
	shell.exec(`ls > logs/${ano}/${mes}/${dia}/log-${dia}-${hora}h${minutos}.txt`,{silent:true}).stdout;
  });