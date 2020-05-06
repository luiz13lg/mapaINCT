const map = new ol.Map({
    // view layer target
    view: new ol.View({
        center: [-5602034.912633961, -1525141.1770111802],
        zoom: 0,
        // maxZoom: 0,
        // extent: [-10449083.805621821, -4210178.782637534, -2296729.275207868, 941899.3487077651]
    }),
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

// console.log(marcadores);

//  estilo triangulo online
const shapeOffline = new ol.style.RegularShape({
    fill: new ol.style.Stroke({
        color:[222, 45, 18, 1]
    }),
    stroke: new ol.style.Stroke({
        color:[30, 30, 31, 1],
        width: 1.2
    }),
    points: 3,
    radius: 8
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
    radius: 8
});
const shapeOnline2h = new ol.style.RegularShape({
    fill: new ol.style.Fill({
        color:[27, 135, 52, 1]
    }),
    stroke: new ol.style.Stroke({
        color:[30, 30, 31, 1],
        width: 1.2
    }),
    points: 3,
    radius: 8
});
const shapeOnline3h = new ol.style.RegularShape({
    fill: new ol.style.Fill({
        color:[41, 71, 48, 1]
    }),
    stroke: new ol.style.Stroke({
        color:[30, 30, 31, 1],
        width: 1.2
    }),
    points: 3,
    radius: 8
});

const estiloOnline1h = new ol.style.Style({
    image: shapeOnline1h
})
const estiloOnline2h = new ol.style.Style({
    image: shapeOnline2h
})
const estiloOnline3h = new ol.style.Style({
    image: shapeOnline3h
})

const estiloOffline = new ol.style.Style({
    image: shapeOffline
})

const estiloDaEstacao = function(feature){
    let status = feature.get("Status");

    if (status == "Online"){
        let horaAtual = new Date().getHours();
        let diaAtual = new Date().getDate();

        if(feature.get("Received") != ""){
            let horaString = feature.get("Received").split(" ");
            let diaRecebido = parseInt(horaString[1]);

            if(diaAtual - diaRecebido == 0){
                if(horaString.length == 3){
                    horaString = horaString[2].split(":");
                    let horaRecebida = parseInt(horaString[0]);

                    (horaAtual - horaRecebida == 0 || horaAtual - horaRecebida == 1) ? feature.setStyle([estiloOnline1h]) :
                        horaAtual - horaRecebida == 2 ? feature.setStyle([estiloOnline2h]) : feature.setStyle([estiloOnline3h]);
                }
            }
            else feature.setStyle([estiloOnline3h]);
        } else feature.setStyle([estiloOnline3h]);
    }
    else feature.setStyle([estiloOffline])
}

let marcadoresLayer = new ol.layer.VectorImage({
    source: new ol.source.Vector({
        url: 'http://localhost:3013',
        format: new ol.format.GeoJSON(),
    }),
    visible: true,
    style: estiloDaEstacao
})
map.addLayer(marcadoresLayer);

const containerOverlay = document.querySelector('.containerOverlay');
const station = document.getElementById('Station');
const last = document.getElementById('Last');
const size = document.getElementById('Size');
const received = document.getElementById('Received');
const status = document.getElementById('Status');

const overlayLayer = new ol.Overlay({
    element: containerOverlay
});
map.addOverlay(overlayLayer);

map.on("click",(e)=>{
    overlayLayer.setPosition(undefined);
    map.forEachFeatureAtPixel(e.pixel, function(feature, layer){
        let coordenadaClicada = e.coordinate;
        overlayLayer.setPosition(coordenadaClicada);
        
        station.innerHTML = feature.get("Station");
        last.innerHTML = feature.get("Last");
        size.innerHTML = feature.get("Size");
        received.innerHTML = feature.get("Received");
        status.innerHTML = feature.get("Status");
    })
})

function atualizarLayerMarcadores(marcadoresLayer){
    let layerRemover = map.getLayers().array_[1];
    map.removeLayer(layerRemover);

    marcadoresLayer = new ol.layer.VectorImage({
        source: new ol.source.Vector({
            url: 'http://localhost:3013',
            format: new ol.format.GeoJSON(),
        }),
        visible: true,
        style: estiloDaEstacao
    })
    
    map.addLayer(marcadoresLayer);
}