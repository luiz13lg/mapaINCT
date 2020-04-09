window.onload = init;

function init(){
    const map = new ol.Map({
        //view layer target
        view: new ol.View({
            center: [-5602034.912633961, -1525141.1770111802],
            zoom: 0,
            // maxZoom: 0,
            extent: [-10449083.805621821, -4210178.782637534, -2296729.275207868, 941899.3487077651]
        }),
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        target: "js-map"
    })

    map.on("click",(e)=>{
        console.log(e.coordinate);
    })
}