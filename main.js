window.onload = init;

function init(){
    const map = new ol.Map({
        //view layer target
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

    const marcadoresLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: './marcadores/marcadores.geojson',
            format: new ol.format.GeoJSON(),
        }),
        visible: true
    })

    map.addLayer(marcadoresLayer);

    map.on("click",(e)=>{
        console.log(e.coordinate);
    })
}