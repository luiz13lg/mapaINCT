const shell = require('shelljs');
const fs = require('fs');
const express = require('express');
const app = express();
const cron = require("node-cron");
const cors = require('cors');

// const mariadb = require('mariadb');
// const pool = mariadb.createPool({
//      host: 'localhost', 
//      user:'root', 
// 	 password: 'lg132717',
// 	 port: '3307',
// 	 socketPath: "/var/run/mysqld/mysqld.sock",
//      connectionLimit: 5
// });

// console.log(pool.query("select * from estacoes"));

app.use(cors());
const bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '1mb'}));

const dadosEstacoes = JSON.parse(fs.readFileSync('marcadores.json', 'utf-8'));

app.listen(3013, '0.0.0.0',() => {
	console.log('API rodando na porta: 3013')
});

app.get('/', cors(), function (req, res) {          
    console.log("Recuperando log atual.");
    try{
		let nomeLog = obterUltimoLog();
		let data = fs.readFileSync("logs/2020/5/23/log-2020-5-23-13h0.txt", 'utf-8');

		data = converterJSON(data);
        res.write(data);
    }catch (err) {
        console.error("Erro ao obter o log das estações ativas.");
		res.write(err);
    }
    res.end();
});

app.get('/desativados', cors(), function (req, res) {          
    console.log("acessado desativados.");
    try{
		let data = fs.readFileSync('marcadores-inativos.json', 'utf-8');
        res.write(data);
    }catch (err) {
        console.error("Erro ao obter o log das estações inativas.");
		res.write(err);
    }
    res.end();
});

app.post('/obterLogsDisponiveis', cors(), function (req, res) {          
    console.log("acessado logs disponíveis.");
    try{
		let ExpReg = new RegExp("[0-9][0-9][0-9][0-9]-[0-9]?[0-9]?-[0-9]?[0-9]?");
		
		if(ExpReg.test(req.body.data)){
			data = req.body.data.split("-"); // ano-mes-dia

			let ano = data[0]
			let mes = data[1];
			let dia = data[2];

			if(mes.charAt(0) === '0') mes = mes.charAt(1) 

			logsDisponiveis = shell.exec(`ls logs/${ano}/${mes}/${dia}/`,{silent:true}).stdout;
			res.write(logsDisponiveis);
		}else res.write("Erro na validação da data.")

    }catch (err) {
        console.error("Erro ao obter lista de logs:");
		console.log(err);
		res.write(err);
    }
    res.end();
});

app.post('/obterLogSelecionado', cors(), function (req, res) {
    console.log("acessado logs disponíveis: " + req.body.log);
    try{
		let ExpReg = new RegExp("[0-9][0-9][0-9][0-9]-[0-9]?[0-9]?-[0-9]?[0-9]?");
		let data = req.body.log.split(" ")[0];
		
		if(ExpReg.test(data)){
			data = data.split("-");
			let nomeArquivo = req.body.log.split(" ")[1];
			
			let ano = data[0];
			let mes = data[1];
			let dia = data[2];
			
			if(mes.charAt(0) === '0') mes = mes.charAt(1);
			
			let marcadores = fs.readFileSync(`logs/${ano}/${mes}/${dia}/${nomeArquivo}`, 'utf-8');
			marcadores = converterJSON(marcadores);
			res.write(marcadores);
		}else res.write("Erro de data ao obter log selecionado.");
    }catch (err) {
        console.error("Erro ao obter lista de logs");
		console.log(err);
		res.write(err);
    }
    res.end();
});

function converterJSON(string){
	let primeiro_indice, segundo_indice = 0;
	let verificadorDeLogNovo = 0, nmrDeEstacoes = 20, contadorDeEstacoes = 0, auxContadorDeEstacoes = 0;
	let json = "\{\"type\":\"FeatureCollection\",\"features\":["

	for(let aux = 0; aux < 6; aux++){
		verificadorDeLogNovo = string.indexOf("<th>", verificadorDeLogNovo+1);
	}
	for(let aux = 0; aux < nmrDeEstacoes; aux++){
		auxContadorDeEstacoes = string.indexOf("<tr><td>", auxContadorDeEstacoes+1);
		if(auxContadorDeEstacoes == -1) break;
		contadorDeEstacoes++;
	}

	primeiro_indice = string.indexOf('<tr><td>',primeiro_indice);
	segundo_indice = string.indexOf('</td></tr>',segundo_indice);

	let dados = string.slice(primeiro_indice, segundo_indice);
	let primeiro_dado, segundo_dado = 0;
	let estacao;
	
	json += "\{\"type\":\"Feature\",\"properties\":\{"

	for(let auxString = 1; auxString < contadorDeEstacoes; auxString++){
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

		if(verificadorDeLogNovo > 0){
			primeiro_dado = dados.indexOf('<td>',(primeiro_dado+1));
			segundo_dado = dados.indexOf('</td>',(segundo_dado+1));
			dado = dados.slice(primeiro_dado+4, segundo_dado);
			json += `"Last_Three": "${dado}",`;
			
			primeiro_dado = dados.indexOf('<td>',(primeiro_dado+1));
			segundo_dado = dados.indexOf('</td>',(segundo_dado+1));
			dado = dados.slice(primeiro_dado+4, segundo_dado);
			json += `"Last_Size": "${dado}",`;
		}

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
	json = json.substring(0, json.length - 1);
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

	if(minutos >= 30) return `logs/${ano}/${mes}/${dia}/log-${ano}-${mes}-${dia}-${hora}h30.txt`
		else return `logs/${ano}/${mes}/${dia}/log-${ano}-${mes}-${dia}-${hora}h0.txt`
}

cron.schedule("0 */30 * * * *", function() {
	let data = new Date();
	let ano = data.getFullYear();
	let mes = data.getMonth()+1;
	let dia = data.getDate();
	let hora = data.getHours();
	let minutos = data.getMinutes();
	console.log("Log gerado");

	shell.exec(`zabbix_get -s 200.145.185.149 -k lastFile > logs/${ano}/${mes}/${dia}/log-${ano}-${mes}-${dia}-${hora}h${minutos}.txt`,{silent:true}).stdout;
  });

cron.schedule("0 0 0 * * *", function() {  //criando diretorio para logs diarios
	let data = new Date();
	let ano = data.getFullYear();
	let mes = data.getMonth()+1;
	let dia = data.getDate();
	
	console.log("Pasta para armazenar logs diários criada");

	shell.exec(`mkdir /logs/${ano}/${mes}/${dia}`,{silent:true}).stdout;
});

cron.schedule("0 0 1 * *", function() {
	let data = new Date();
	let ano = data.getFullYear();
	let mes = data.getMonth()+1;
	
	console.log("Pasta para armazenar dias criada");

	shell.exec(`mkdir /logs/${ano}/${mes}`,{silent:true}).stdout;
});
  