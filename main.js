const map = new ol.Map({
    // view layer target
    view: new ol.View({
        center: [-5602034.912633961, -1525141.1770111802],
        zoom: 4.5,
        // maxZoom: 5,
        // extent: [-10449083.805621821, -4210178.782637534, -2296729.275207868, 941899.3487077651]
    }),
    controls: ol.control.defaults({
        attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
          collapsible: false
        })
      }).extend([
        new ol.control.ScaleLine()
      ]),
    layers: [
        // new ol.layer.Tile({
        //     source: new ol.source.BingMaps({
        //         key: 'AiB6R3zkUT3jUgsmSQ2e9skbn0ck1YKHtuG9RwH4dEur8DW5nS6adQ7s9HZB6OM0',
        //         imagerySet: 'AerialWithLabels'
        //     })
        // })
        new ol.layer.Tile({
            source: new ol.source.Stamen({
                layer: 'terrain'
            })
        })
    ],
    target: "js-map"
})

//  Estilos
const shapeOffline = new ol.style.RegularShape({
    fill: new ol.style.Stroke({
        color:[222, 45, 18, 1]
    }),
    stroke: new ol.style.Stroke({
        color:[30, 30, 31, 1],
        width: 1.2
    }),
    points: 3,
    radius: 10,
});
const shapeOnline1h = new ol.style.RegularShape({
    fill: new ol.style.Fill({
        color:[17, 255, 0, 1]
    }),
    stroke: new ol.style.Stroke({
        color:[30, 30, 31, 1],
        width: 1.2
    }),
    points: 3,
    radius: 10
});
const shapeOnline2h = new ol.style.RegularShape({
    fill: new ol.style.Fill({
        color:[255, 145, 0, 1]
    }),
    stroke: new ol.style.Stroke({
        color:[30, 30, 31, 1],
        width: 1.2
    }),
    points: 3,
    radius: 10
});

const estiloDaEstacaoOffline = function(feature){
    let styles = [];
    let nomeEstacao = feature.get("Station");
    styles.push(
        new ol.style.Style({
            image: shapeOffline,
            text: 
                new ol.style.Text({
                    font: 'bold 14px sans-serif',
                    text: nomeEstacao,
                    textBaseline: 'top',
                    offsetY: 8,
                    backgroundFill: new ol.style.Fill({
                        color: 'rgba(250, 196, 120,0.5)'
                    }),
                    padding: [2,0,0,2]
                })
        })
    );
    return styles;
}

const estiloDaEstacao = function(feature){
    let styles = [];
    let status = feature.get("Status");
    let nomeEstacao = feature.get("Station");

    let texto = new ol.style.Text({
        font: 'bold 14px sans-serif',
        text: nomeEstacao,
        textBaseline: 'top',
        offsetY: 8,
        backgroundFill: new ol.style.Fill({
            color: 'rgba(250, 196, 120,0.5)'
        }),
        padding: [2,0,0,2]
    })

    if (status == "Online" && feature.get("Received") != ""){
        let horaString = feature.get("Received").split(" ");
        let diaRecebido = parseInt(horaString[1]);
        let mesRecebido = valorMes(horaString[0]);
        
        if(mesAtual - mesRecebido == 0 && diaAtual - diaRecebido == 0){    //se dados sao do mesmo dia
            if(horaString.length == 3){     //se formato de hora esta certo
                horaString = horaString[2].split(":");
                let horaRecebida = parseInt(horaString[0]);

                if(horaAtual - horaRecebida <= 1){
                    styles.push(
                        new ol.style.Style({
                            image: shapeOnline1h,
                            text: texto
                        })
                    );
                }else{
                    styles.push(
                        new ol.style.Style({
                            image: shapeOnline2h,
                            text: texto
                        })
                    );
                }
            }
        }else{
            styles.push(
                new ol.style.Style({
                    image: shapeOnline2h,
                    text: texto
                })
            );
        }
    }else 
        styles.push(
            new ol.style.Style({
                image: shapeOffline,
                text: texto
            })
        );
    return styles
}

const estiloMapaMag = new ol.style.Style({
    image: new ol.style.RegularShape({
        stroke: new ol.style.Stroke({
            color:[30, 30, 31, 1],
            width: 7
        }),
        points: 1,
        radius: 10,
    })
})

let mapaMagLayer = new ol.layer.VectorImage({
    source: new ol.source.Vector({
        url: "./libs/MapaMag.geojson",
        format: new ol.format.GeoJSON(),
    }),
    visible: true,
    style: estiloMapaMag
});

let marcadoresLayer = new ol.layer.VectorImage({
    source: new ol.source.Vector({
        url: "http://inct-gnss-navaer.fct.unesp.br/marcadores",
        format: new ol.format.GeoJSON(),
    }),
    visible: true,
    style: estiloDaEstacao
})

let marcadoresLayerDesativados = new ol.layer.VectorImage({
    source: new ol.source.Vector({
        url: "http://inct-gnss-navaer.fct.unesp.br/marcadores-desativados",
        format: new ol.format.GeoJSON(),
    }),
    visible: true,
    style: estiloDaEstacaoOffline
})

map.addLayer(mapaMagLayer);
map.addLayer(marcadoresLayer);
map.addLayer(marcadoresLayerDesativados);

const containerOverlay = document.querySelector('.containerOverlay');
const station = document.getElementById('Station');
const last = document.getElementById('Last');
const size = document.getElementById('Size');
const received = document.getElementById('Received');
const status = document.getElementById('Status');

let horaAtual;
let diaAtual;
let mesAtual;


const containerOverlayStation = document.querySelector('.containerOverlayStation');
const NameStation = document.getElementById('name-station');

const overlayLayer = new ol.Overlay({
    element: containerOverlay
});
map.addOverlay(overlayLayer);

map.on("pointermove",(e)=>{
    overlayLayer.setPosition(undefined);
    map.forEachFeatureAtPixel(e.pixel, function(feature, layer){
        let coordenadaClicada = e.coordinate;
        
        if(feature.get("Station") != undefined ){
            overlayLayer.setPosition(coordenadaClicada);
            station.innerHTML =  retornarCidade(feature.get("Station"));
            status.innerHTML = `<br> Status: ${feature.get("Status")}`;
            feature.get("Size") != undefined ? size.innerHTML = `<br> Tamanho do Arquivo: ${feature.get("Size")}` : size.innerHTML = "";
            feature.get("Received") != undefined ? received.innerHTML = `<br> Data & Hora: ${feature.get("Received")}` : received.innerHTML = "";
        }
    })
})
definirLimiteData();
definirDataHoraParaEstilo(true);

function definirDataHoraParaEstilo(atual, dataLog){     //funcao para definir a hora e a data para comparar com os logs das estacoes
    if(atual){
        horaAtual = new Date().getHours();
        diaAtual = new Date().getDate();
        mesAtual = new Date().getMonth() + 1;
    }
    else{
        console.log(dataLog);
        let data = dataLog.split(" ")[0].split("-");
        let hora = dataLog.split(" ")[1].split("-")[2].split(".")[0].split('h')[0];
        
        let ano = data[0];
        let mes = data[1];
        let dia = data[2];
        
        horaAtual = parseInt(hora);
        diaAtual = parseInt(dia);
        mesAtual = parseInt(mes);
        anoAtual = parseInt(ano);
    }
}

function definirLimiteData(){
    var data = new Date();
    var mes = data.getMonth() + 1;     // getMonth() is zero-based
    var dia = data.getDate();
    var ano = data.getFullYear();
    
    if(mes < 10)
    mes = '0' + mes.toString();
    if(dia < 10)
    dia = '0' + dia.toString();

    var dataMaxima = ano + '-' + mes + '-' + dia;

    document.getElementById('data-logs').setAttribute('max', dataMaxima);
    document.getElementById('data-um').setAttribute('max', dataMaxima);
    document.getElementById('data-dois').setAttribute('max', dataMaxima);
}

async function iterarEntreDatas(){
    map.removeLayer(marcadoresLayer);

    let dataBuscada;

    let data1 = document.getElementById("data-um").value.replace(/-/g,"/");
    let data2 = document.getElementById("data-dois").value.replace(/-/g,"/");

    let dataPartida = new Date(data1);
    let dataParada = new Date(data2);

    for ( ; dataPartida <= dataParada; dataPartida.setDate(dataPartida.getDate() + 1)) {    //iterando sob as datas selecionadas
        dataBuscada = `${dataPartida.getFullYear()}-${dataPartida.getMonth()+1}-${dataPartida.getDate()}`; //form data para pesquisa

        await carregarLogs(dataBuscada);
    }

    // carregarLogs(data1);
    // console.log(data1);

    // marcadoresLayer = new ol.layer.VectorImage({
    //     source: new ol.source.Vector({
    //         url: 'http://inct-gnss-navaer.fct.unesp.br/marcadores',
    //         format: new ol.format.GeoJSON(),
    //     }),
    //     visible: true,
    //     style: estiloDaEstacao
    // })

    // map.addLayer(marcadoresLayer);

    // let listaLogs = document.getElementById('droplist-logs');
    // listaLogs.options[0].setAttribute('selected',true);

    // let value = document.getElementById('estacoes-ativadas');
    // value.checked ? value.checked = true : value.checked = true;
}

async function carregarLogs(data){
    let log;

    await fetch('http://inct-gnss-navaer.fct.unesp.br/lista-logs', {
        method: 'POST',
        body: JSON.stringify({
            data: data
        }),
        headers: { "Content-Type": "application/json" }
    }).then(response => response.text())
        .then(async listaLogs => {
            let logs = listaLogs.split("\n");
            
            for(let aux = 0; aux < logs.length; aux++){
                log = data+" "+logs[aux];
                await obterLog(log);
                addDataDoLog(log);
                sleep(500);
            }
            
        }).catch(
        err => {
            alert('Dados não enviados ' + err),
                enviado = false
        }
    )
}

function addDataDoLog(infoLog){
    if(infoLog.length > 11){
        let info = infoLog.split(" ");  //2020-6-2 log-2-23h30.txt
        let data = info[0];             //2020-6-2 
        let hora = info[1];             //log-2-23h30.txt

        data = data.split("-");         //2020 6 2
        hora = hora.split("-");         //log 2 23h30.txt
        hora = hora[2].split(".");      //23h30 txt

        if(hora[0].split("h")[1].length == 1)
            document.getElementById("data-info").innerHTML = `${data[2]}/${data[1]}/${data[0]} | ${hora[0]}0`;
        else
            document.getElementById("data-info").innerHTML = `${data[2]}/${data[1]}/${data[0]} | ${hora[0]}`;
    }
}

async function obterLog(log){

    // console.log(log+" | "+log.length);
    if (log.length > 11){
        definirDataHoraParaEstilo(false, log);

        await fetch('http://inct-gnss-navaer.fct.unesp.br/log-selecionado', {
            method: 'POST',
            body: JSON.stringify({
                log: log
            }),
            headers: { "Content-Type": "application/json" }
        }).then( response => response.text())
            .then(async mapa => {
                let arrayFeatures = [];
                pontosMapa = JSON.parse(mapa);

                for(let feature of pontosMapa.features){
                    let coordenadas = await ol.proj.transform([feature.geometry.coordinates[0],feature.geometry.coordinates[1]], 
                                            'EPSG:4326','EPSG:3857');
                    
                    let featureMapa = new ol.Feature({
                        geometry: new ol.geom.Point([coordenadas[0],coordenadas[1]]),
                        Station: feature.properties.Station,
                        Last: feature.properties.Last,
                        Size: feature.properties.Size,
                        Received: feature.properties.Received,
                        Status: feature.properties.Status
                    });
                    arrayFeatures.push(featureMapa)
                }
                
                map.removeLayer(marcadoresLayer);
                
                marcadoresLayer = new ol.layer.VectorImage({
                    source: new ol.source.Vector({
                        features: arrayFeatures
                    }),
                    visible: true,
                    style: estiloDaEstacao
                })
                
                map.addLayer(marcadoresLayer);  
            }).catch(
                err => {
                    alert('Dados não enviados ' + err),
                    enviado = false
                }
            )
    }
    //setando o filtro caso ele esteja desativado
    let value = document.getElementById('estacoes-ativadas');
    value.checked ? value.checked = true : value.checked = true;
}


// function atualizarLayerMarcadores(){
//     map.removeLayer(marcadoresLayer);

//     marcadoresLayer = new ol.layer.VectorImage({
//         source: new ol.source.Vector({
//             url: 'http://inct-gnss-navaer.fct.unesp.br/marcadores',
//             format: new ol.format.GeoJSON(),
//         }),
//         visible: true,
//         style: estiloDaEstacao
//     })

//     map.addLayer(marcadoresLayer);

//     let listaLogs = document.getElementById('droplist-logs');
//     listaLogs.options[0].setAttribute('selected',true);

//     let value = document.getElementById('estacoes-ativadas');
//     value.checked ? value.checked = true : value.checked = true;
// }

function ocultarLayerEstacoesDesativadas(){
    let value = document.getElementById('estacoes-desativadas');   
    value.checked ? map.addLayer(marcadoresLayerDesativados) : map.removeLayer(marcadoresLayerDesativados)
}

function ocultarLayerEstacoesAtivadas(){
    let value = document.getElementById('estacoes-ativadas');
    value.checked ? map.addLayer(marcadoresLayer) : map.removeLayer(marcadoresLayer)
}

function obterDataSelecionada(){
    let data = document.getElementById("data-logs").value;
    if(data != "") carregarLogsParaDroplist(data);
}

async function carregarLogsParaDroplist(data){
    await fetch('http://inct-gnss-navaer.fct.unesp.br/lista-logs', {
        method: 'POST',
        body: JSON.stringify({
            data: data
        }),
        headers: { "Content-Type": "application/json" }
    }).then(response => response.text())
        .then(listaLogs => {
            let logs = listaLogs.split("\n");
            
            let droplistLogs = document.getElementById('droplist-logs');
            
            for (let posicaoAtual = droplistLogs.length - 1; posicaoAtual > 0; posicaoAtual--){
                droplistLogs.remove(posicaoAtual);
            }

            for(log of logs){
                if (log === "") continue
                let hora = log.split("-")[2].split(".")[0];
                if (hora.split('h')[1].length == 1) hora = hora+'0';

                let opt = document.createElement('option');
                opt.appendChild( document.createTextNode(hora) );
                opt.value = data+" "+log; 
                droplistLogs.appendChild(opt); 
            }
        }).catch(
        err => {
            alert('Dados não enviados ' + err),
                enviado = false
        }
    )
}

async function obterLogSelecionado(){
    let droplist = document.getElementById('droplist-logs');
    let logSelecionado = droplist.options[droplist.selectedIndex].value;
    droplist.options[0].removeAttribute('selected')

    definirDataHoraParaEstilo(false, logSelecionado);

    if (logSelecionado === "-"){        //pegando log atual
        map.removeLayer(marcadoresLayer);
        marcadoresLayer = new ol.layer.VectorImage({
            source: new ol.source.Vector({
                url: "http://inct-gnss-navaer.fct.unesp.br/marcadores",
                format: new ol.format.GeoJSON(),
            }),
            visible: true,
            style: estiloDaEstacao
        })
        map.addLayer(marcadoresLayer);
    } else{                 //pegando log de uma data especifica
        await fetch('http://inct-gnss-navaer.fct.unesp.br/log-selecionado', {
            method: 'POST',
            body: JSON.stringify({
                log: logSelecionado
            }),
            headers: { "Content-Type": "application/json" }
        }).then( response => response.text())
            .then(mapa => {
                let arrayFeatures = [];

                pontosMapa = JSON.parse(mapa);

                for(let feature of pontosMapa.features){
                    let coordenadas = ol.proj.transform([feature.geometry.coordinates[0],feature.geometry.coordinates[1]], 
                                            'EPSG:4326','EPSG:3857');
                    
                    let featureMapa = new ol.Feature({
                        geometry: new ol.geom.Point([coordenadas[0],coordenadas[1]]),
                        Station: feature.properties.Station,
                        Last: feature.properties.Last,
                        Size: feature.properties.Size,
                        Received: feature.properties.Received,
                        Status: feature.properties.Status
                    });
                    arrayFeatures.push(featureMapa)
                }
                
                map.removeLayer(marcadoresLayer);
                
                marcadoresLayer = new ol.layer.VectorImage({
                    source: new ol.source.Vector({
                        features: arrayFeatures
                    }),
                    visible: true,
                    style: estiloDaEstacao
                })
                map.addLayer(marcadoresLayer);  
            }).catch(
                err => {
                    alert('Dados não enviados ' + err),
                    enviado = false
                }
            )
        }//else
    //setando o filtro caso ele esteja desativado
    let value = document.getElementById('estacoes-ativadas');
    value.checked ? value.checked = true : value.checked = true;
}

function valorMes(mes){
    switch(mes){
        case 'Jan':
            return 1;
        case 'Feb':
            return 2;
        case 'Mar':
            return 3;
        case 'Apr':
            return 4;
        case 'May':
            return 5;
        case 'Jun':
            return 6;
        case 'Jul':
            return 7;
        case 'Aug':
            return 8;
        case 'Sep':
            return 9;
        case 'Oct':
            return 10;
        case 'Nov':
            return 11;
        case 'Dec':
            return 12;
    }
}

function sortlist() {
    var lb = document.getElementById('droplist-logs');
    arr1a9 = new Array();
    arr10a24 = new Array();
    arrTexts = new Array();
    
    for(i=0; i<lb.length; i++)  {
        if(lb.options[i].text.length == 5)
            arr10a24[i] = lb.options[i].text;
        else
            arr1a9[i] = lb.options[i].text;
    }
    
    arr1a9.sort();
    arr10a24.sort();
    arrTexts = arr1a9.concat(arr10a24);
    console.log(arrTexts);

    for(i=0; i<lb.length; i++)  {
      lb.options[i].text = arrTexts[i];
      lb.options[i].value = arrTexts[i];
    }
}

function retornarCidade(nomeEstacao){
    switch(nomeEstacao){
        case "DMC1": return "Presidente Prudente - SP";
        case "FRTZ": return "Fortaleza - CE";
        case "INCO": return "Inconfidentes - MG";
        case "MAC3": return "Macaé - RJ";
        case "MOR2": return "Presidente Prudente - SP";
        case "PALM": return "Palmas - TO";
        case "POAL": return "Porto Alegre - RS";
        case "PRU2": return "Presidente Prudente - SP";
        case "PRU4": return "Presidente Prudente - SP";
        case "SJCE": return "São José dos Campos - SP";
        case "SJCU": return "São José dos Campos - SP";
        case "SLMA": return "São Luís - MA";
        case "SPBO": return "Botucatu - SP";
        case "STMC": return "Monte Carmelo - MG";
        case "STNT": return "Natal - RN";
        case "STSN": return "Sinop - MT";
        case "STSH": return "Santa Helena - PR";
        case "UFBA": return "Salvador - BA";
        case "STBR": return "Balneário Rincão - SC";

        case "GALH": return "Presidente Prudente - SP";
        case "MAC2": return "Macaé - RJ";
        case "MACA": return "Macaé - RJ";
        case "MAN2": return "Manaus - AM";
        case "MAN3": return "Manaus - AM";
        case "MANA": return "Manaus - AM";
        case "MORU": return "Presidente Prudente - SP";
        case "PRU1": return "Presidente Prudente - SP";
        case "PRU3": return "Presidente Prudente - SP";
        case "SJCI": return "São José dos Campos - SP";
    }
}

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do{
      currentDate = Date.now();
    }while (currentDate - date < milliseconds);
}