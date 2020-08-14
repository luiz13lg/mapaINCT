const shell = require('shelljs');
const fs = require('fs');
const express = require('express');
const app = express();
const cron = require("node-cron");
const cors = require('cors');

app.use(cors());
const bodyParser = require('body-parser');
const { ERANGE } = require('constants');
app.use(bodyParser.json({limit: '1mb'}));

let MongoClient = require('mongodb').MongoClient;

MongoClient.connect(url, { useNewUrlParser: true,  useUnifiedTopology: true }, (err, client) => { //conectando ao banco
    if (err) return console.log(err)        //se a conecao n for aceita, exibe erro
    dbo = client.db('INCT_DB')              //acessando a colecao especifica
})

const dadosEstacoes = JSON.parse(fs.readFileSync('marcadores.json', 'utf-8'));

app.set('port', process.env.PORT || 3013);

app.listen(app.get('port'),() => {
	console.log(`API rodando na porta: ${app.get('port')}`)
});

app.get('/', cors(), async function (req, res) {          
	console.log("Recuperando log atual.");
	query = {Hora_Log: `${obterUltimoLog()}`}
	await dbo.collection("Stations").find(query, {_id: 0}).toArray(function(err, result) {
		if (err) throw err;
		let convertido = prepararJSON(result);
		res.send(convertido);
	});
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

app.get('/mapa-magnetico', cors(), async function(req, res){
	console.log("Acessado mapa geomagnético.");
	try{
		let data = fs.readFileSync('mapa-geomagnetico.json','utf-8');
		res.write(data);
	}catch(err){
		console.log("Erro ao obter mapa geomagnético: "+err);
		res.write(err);
	}
	res.end();
});

app.post('/obterLogsDisponiveis', cors(), async function (req, res) {          
	console.log(`acessado lista de logs disponíveis na data: ${req.body.data}`);
    try{
		let ExpReg = new RegExp("[0-9][0-9][0-9][0-9]-[0-9]?[0-9]?-[0-9]?[0-9]?");
		
		if(ExpReg.test(req.body.data)){
			data = req.body.data.split("-"); // ano-mes-dia
			let ano = data[0]
			let mes = data[1];
			let dia = data[2];

			if(mes.charAt(0) === '0') mes = mes.charAt(1);
			if(dia.charAt(0) === '0') dia = dia.charAt(1);
			
			query = `${ano}/${mes}/${dia}`;
			
			let result =  await dbo.collection("Stations").distinct("Hora_Log",{Hora_Log:{$regex:`${query}`}});
			res.send(result);

		}else res.send("Erro na validação da data.")
    }catch (err) {
        console.error("Erro ao obter lista de logs:");
		res.send(err);
    }
});

app.post('/obterLogSelecionado', cors(), function (req, res) {
	console.log("acessado log: " + req.body.log);
    try{
		let ExpReg = new RegExp("[0-9][0-9][0-9][0-9]/[0-9]?[0-9]?/[0-9]?[0-9]?");
		let data = req.body.log.split(" ")[0];
		if(ExpReg.test(data)){ //2020/7/11 13h30
			let query = req.body.log;

			dbo.collection("Stations").find({"Hora_Log":`${query}`}, {_id:0}).toArray(function(err, result) {
				if (err) throw err;
				let convertido = prepararJSON(result);
				res.send(convertido);
			});
		}else res.send("Erro de data ao obter log selecionado.");
    }catch (err) {
        console.error("Erro ao obter logs");
		console.log(err);
		res.send(err);
    }
});

function prepararJSON(dados){
	let dadosParaMapa = {type:"FeatureCollection",features:[]};

	dados.forEach(dado => {
		let dadoAux = {
			type:"Feature",
			properties:{
				Station: dado.Station,
				Last: dado.Last,
				Size: dado.Size,
				Received: dado.Received,
				Status: dado.Status
			},
			geometry:{
			type:"Point",
			coordinates: dado.Coordinates
			}
		}
		dadosParaMapa.features.push(dadoAux);
	});

	return dadosParaMapa;
}

/**
 * Recebe uma string no formato que o Zabbix gera e converte os dados em JSON.
 * @param {String} string 
 */
function converterJSON(string){
	let primeiro_indice, segundo_indice = 0;
	let verificadorDeLogNovo = 0, nmrDeEstacoes = 20, contadorDeEstacoes = 0, auxContadorDeEstacoes = 0;
	let json = "\{\"type\":\"FeatureCollection\",\"features\":["
	let estacao;

	for(let aux = 0; aux < 6; aux++){
		verificadorDeLogNovo = string.indexOf("<th>", verificadorDeLogNovo+1);
	}
	for(let aux = 0; aux < nmrDeEstacoes; aux++){
		auxContadorDeEstacoes = string.indexOf("<tr><td>", auxContadorDeEstacoes+1);
		if(auxContadorDeEstacoes == -1) break;
		contadorDeEstacoes++;
	}
	

	for(let auxString = 0; auxString < contadorDeEstacoes; auxString++){
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

/**
 * Retorna o ultimo log gerado no sistema (de 30 em 30 minutos).
 */
function obterUltimoLog(){
	let data = new Date();
	let ano = data.getFullYear();
	let mes = data.getMonth()+1;
	let dia = data.getDate();
	let hora = data.getHours()+1;
	let minutos = data.getMinutes();

	if(minutos >= 30) return `${ano}/${mes}/${dia} ${hora}h30`
		else return `${ano}/${mes}/${dia} ${hora}h0`
}

cron.schedule("0 */30 * * * *", async function() {
	let data = new Date();
	let ano = data.getFullYear();
	let mes = data.getMonth()+1;
	let dia = data.getDate();
	let hora = data.getHours()+1;
	let minutos = data.getMinutes();
	
	console.log(`Log gerado: ${hora}h${minutos}`);
	
	if(hora == 24){
		await shell.exec(`zabbix_get -s 200.145.185.149 -k lastFile > logs/${ano}/${mes}/${dia+1}/log-${dia+1}-0h${minutos}.txt`,{silent:true}).stdout;
		let dados = fs.readFileSync(`logs/${ano}/${mes}/${dia+1}/log-${dia+1}-0h${minutos}.txt`, 'utf-8');
		dados = converterJSON(dados);
		salvarLogNoBanco(dados, (`${ano}/${mes}/${dia+1} 0h${minutos}`));
	}
	else {
		await shell.exec(`zabbix_get -s 200.145.185.149 -k lastFile > logs/${ano}/${mes}/${dia}/log-${dia}-${hora}h${minutos}.txt`,{silent:true}).stdout;
		let dados = fs.readFileSync(`logs/${ano}/${mes}/${dia}/log-${dia}-${hora}h${minutos}.txt`, 'utf-8');
		dados = converterJSON(dados);
		salvarLogNoBanco(dados, (`${ano}/${mes}/${dia} ${hora}h${minutos}`));
	}
  });

cron.schedule("59 22 * * *", function() {  //criando diretorio para logs diarios
	let data = new Date();
	let ano = data.getFullYear();
	let mes = data.getMonth()+1;
	let dia = data.getDate();
	
	let qtdDiasNoMes = new Date(ano, mes, 0).getDate();
	if(dia == qtdDiasNoMes){		//se for ultimo dia do mes
		shell.exec(`mkdir ./logs/${ano}/${mes+1}/${1}`,{silent:true}).stdout;		//cria pasta com o primeiro dia do mes
		console.log(`Pasta para armazenar logs diários criada: ${1}/${mes+1}/${ano}`);
	}else{
		shell.exec(`mkdir ./logs/${ano}/${mes}/${dia+1}`,{silent:true}).stdout;		//cria pasta com proximo dia
		console.log(`Pasta para armazenar logs diários criada: ${1}/${mes+1}/${ano}`);
	}
});

cron.schedule("58 22 * * *", function() { //criando diretorio para meses
	let data = new Date();
	let ano = data.getFullYear();
	let mes = data.getMonth()+1;
	let dia = data.getDate();
	
	let qtdDiasNoMes = new Date(ano, mes, 0).getDate();

	if(dia == qtdDiasNoMes){	//se for ultimo dia do mes, entao criaremos nova pasta
		if(mes == 12){ 			//dezembro, preciso criar o mes janeiro em uma nova pasta do outro ano
			shell.exec(`mkdir ./logs/${ano+1}`,{silent:true}).stdout;		//pasta para novo ano
			shell.exec(`mkdir ./logs/${ano+1}/${1}`,{silent:true}).stdout; 	//pasta para janeiro
			console.log(`Pasta para armazenar dias criada: ${1}/${ano+1}`);
		}
		shell.exec(`mkdir ./logs/${ano}/${mes+1}`,{silent:true}).stdout;
		console.log(`Pasta para armazenar dias criada: ${ano}/${mes+1}`);
	}
});

cron.schedule("* * * * *", function() {  //verificando arquivos faltantes
	// shell.exec(`zabbix_get -s 200.145.185.149 -k listFiles > listFiles.txt`, { silent: true }).stdout;
	let listArquivos = fs.readFileSync(`listFiles2.txt`, 'utf-8');
	listArquivos = listArquivos.split("\n");
	
	listArquivos.forEach(line => {
		if(!line.startsWith("Station:")){
			dados = line.split(" | ");
			dados.forEach(async (dado) => {
				if(dado.length > 30){
					let arquivos = dado.split(" ");

					let query = arquivos[0];
					let resultado = await dbo.collection("Stations").findOne({"Last":`${query}`}, {_id:0});

					if(resultado)
						console.log("Encontrei o arquivo no banco!");
					else{
						let dado = {
							Station: arquivos[0].substr(0, 4),
							Last: arquivos[0],
							Received: arquivos[3] +" "+ arquivos[2] +" "+ arquivos[1],
							Size: arquivos[4],
							Status: "Recebido depois.",
						}
							
						await dbo.collection("Stations").insertOne(dado, function(err, res) {
							if (err) throw err;
							console.log("Estação inserida!");
						});
					}
				}
			})
		}
	});
});

/**
 * Salva o log das estações no banco.
 * @param {String} log 
 * @param {String} data 
 */
function salvarLogNoBanco(log, data){
	let logJSON = JSON.parse(log);
	let auxDadosJSON;
	let arrayDadosJSON = [];

	for(let aux = 0; aux < Object.keys(logJSON.features).length; aux++){
		auxDadosJSON = logJSON.features[aux].properties;
		auxDadosJSON["Coordinates"] = logJSON.features[aux].geometry.coordinates;
		auxDadosJSON["Hora_Log"] = data;
		arrayDadosJSON.push(auxDadosJSON);
	}
	
	dbo.collection("Stations").insertMany(arrayDadosJSON, function(err, res) {
		if (err) throw err;
		console.log("Estação inserida!");
	});
}