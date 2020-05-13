const shell = require('shelljs');
const fs = require('fs');
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());

console.log('Server is running.');

let arquivoEstacoes = fs.readFileSync('marcadores.json', 'utf-8');
const dadosEstacoes = JSON.parse(arquivoEstacoes);

let arquivoEstacoesInativas = fs.readFileSync('marcadores-inativos.json', 'utf-8');
const dadosEstacoesInativas = JSON.parse(arquivoEstacoesInativas);


app.listen(3013,() => {                //servidor startado
    console.log('API rodando na porta: 3013')
})

app.get('/', cors(), function (req, res) {          //resposta ao get
    console.log("acessado.");
    // let teste = shell.exec("zabbix &",{silent:true}).stdout;
    try{
		let data = fs.readFileSync('log.txt', 'utf-8');
		
		data = converterJSON(data);
        res.write(data);
    }catch (err) {
        console.error("Erro ao obter o log das estações:");
        console.log(err);
    }
    res.end();
});

app.get('/desativados', cors(), function (req, res) {          //resposta ao get
    console.log("acessado desativados.");
    // let teste = shell.exec("zabbix &",{silent:true}).stdout;
    try{
		let data = fs.readFileSync('marcadores-inativos.json', 'utf-8');
        res.write(data);
    }catch (err) {
        console.error("Erro ao obter o log das estações:");
        console.log(err);
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