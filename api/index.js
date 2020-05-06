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
    // let teste = shell.exec("ls &",{silent:true}).stdout;
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
	json += obterCoordenadasEstacao(estacao);
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
		json += obterCoordenadasEstacao(estacao);
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
	json += obterCoordenadasEstacao(estacao);
	json += "}"
	json += "\]\}";
	
	return json;
}

function obterCoordenadasEstacao(estacao){
	switch(estacao){
		case "FRTZ":
			return "\"geometry\":\{\"type\":\"Point\",\"coordinates\":[-38.577635, -3.744554\]\}";
		case "INCO":
			return "\"geometry\":\{\"type\":\"Point\",\"coordinates\":\[-41.808178, -22.401163\]\}";
		case "MAC3":
			return "\"geometry\":\{\"type\":\"Point\",\"coordinates\":\[-48.311299, -10.199649\]\}";
		case "PALM":
			return "\"geometry\":\{\"type\":\"Point\",\"coordinates\":\[-51.119683, -30.073896\]\}";
		case "POAL":
			return "\"geometry\":\{\"type\":\"Point\",\"coordinates\":\[-51.407079, -22.122038\]\}";
		case "PRU2":
			return "\"geometry\":\{\"type\":\"Point\",\"coordinates\":\[-46.328114, -22.318548\]\}";
		case "PRU4":
			return "\"geometry\":\{\"type\":\"Point\",\"coordinates\":\[-51.408526, -22.120081\]\}";
		case "SJCE":
			return "\"geometry\":\{\"type\":\"Point\",\"coordinates\":\[-45.859743, -23.207528\]\}";
		case "SJCU":
			return "\"geometry\":\{\"type\":\"Point\",\"coordinates\":\[-45.956592, -23.210589\]\}";
		case "SLMA":
			return "\"geometry\":\{\"type\":\"Point\",\"coordinates\":\[-44.212290, -2.593464\]\}";
		case "SPBO":
			return "\"geometry\":\{\"type\":\"Point\",\"coordinates\":\[-48.432301, -22.852467\]\}";
		case "STMC":
			return "\"geometry\":\{\"type\":\"Point\",\"coordinates\":\[-47.523798, -18.724027\]\}";
		case "STNT":
			return "\"geometry\":\{\"type\":\"Point\",\"coordinates\":\[-35.196212, -5.840586\]\}";
		case "STSN":
			return "\"geometry\":\{\"type\":\"Point\",\"coordinates\":\[-55.544692, -11.829394\]\}";
		case "STSH":
			return "\"geometry\":\{\"type\":\"Point\",\"coordinates\":\[-54.344363, -24.846995\]\}";
		case "UFBA":
			return "\"geometry\":\{\"type\":\"Point\",\"coordinates\":\[-38.510659, -12.999826\]\}";
		default:
			return "\"geometry\":\{\"type\":\"Point\",\"coordinates\":\[0.0, 0.0\]\}";
	}			
}