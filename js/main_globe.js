function initializeGlobe() {
    
    $('#button').click(function(){
        $('#overlay').css("display","none")
    });
    
    var map = L.map('earth', {
        center: [53.431315, -2.960798],
        zoom: 14
    });
    
    var streets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoiam1qZmlzaGVyIiwiYSI6ImNqYXVlNDg3cDVhNmoyd21oZ296ZXpwdWMifQ.OGprR1AOquImP-bemM-f2g').addTo(map);
    
    var anfieldIcon = L.icon({
        iconUrl: 'img/anfield.svg',
        iconSize: [100,100]
    });
    
    var anfield = L.marker([53.431315, -2.960798], {icon: anfieldIcon}).addTo(map);
    
    $('#game-select').change(function(e){
        var value = $('#game-select').val();
        map.eachLayer(function (layer) {
            if (layer != streets) {
                map.removeLayer(layer);
            };
        });
        updateMap(map,value);
    });
    
}; // end initializeGlobe

function updateMap(map,value) {
    
    var getURL = 'https://fisherjohnmark.carto.com/api/v2/sql?format=GeoJSON&q=';
    var sql = "SELECT m.p_id, m.min, r.the_geom, r.first, r.last, r.lat, r.lon FROM fisherjohnmark.minutes as m left join fisherjohnmark.roster as r on m.p_id = r.p_id where m.match = " + value + "&api_key=";
    var key = 'default_public';
    
    var playerMarker = {
        radius: 5,
        color: "#C8102E",
        fillOpacity: 0.5
    };
    
    var meanMarker = {
        radius: 8,
        color: "#00B2A9",
        opacity: 1,
        fillOpacity: 1
    };

    $.getJSON(getURL+sql+key, function(data){
        var features = data.features;
        
        var mainLat = 0;
        var mainLon = 0;
        var lats = [];
        var lons = [];

        for (i = 0; i < features.length; i++) { 
            var min = (features[i].properties.min)/990;
            var lat = features[i].properties.lat*min;
            var lon = features[i].properties.lon*min;
            lats.push(parseFloat(features[i].properties.lat));
            lons.push(parseFloat(features[i].properties.lon));

            mainLat += lat
            mainLon += lon
        };
        
        var latMin = Math.min(...lats);
        var latMax = Math.max(...lats);
        var lonMin = Math.min(...lons);
        var lonMax = Math.max(...lons);
        var bounds = [[latMin,lonMin],[latMax,lonMax]];
        
        var lines = L.geoJSON(features, {
            pointToLayer: function (feature, latlng) {
                var ends = [latlng,[mainLat,mainLon]]
                return L.polyline(ends,
                    {color: "#C8102E",
                    opacity: lineOpacity(feature),
                    weight: 1.25
                    }
                )
        }}).addTo(map);
        
        var players = L.geoJSON(features, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng,playerMarker);
            },
            onEachFeature: playerData
        }).addTo(map);
        
        var centroid = L.circleMarker([mainLat,mainLon],meanMarker).addTo(map);
        
        map.fitBounds(bounds)
    });
}; // end updateMap

function lineOpacity(feature) {
    
    var opacity = (feature.properties.min)/90;
    return opacity;
} // end lineOpacity

function playerData(feature,layer){
    
    var popupContent = feature.properties.first+" "+feature.properties.last+"<br>"+feature.properties.min+" minutes";
    
    layer.bindTooltip(popupContent, {
        offset: [0,-7],
        direction: 'top',
        className: 'popupPlayer'});
} // end of  stationNAME

function fillSelect() {
    
    $.getJSON("data/matches.json", function(data) {
        $.each(data, function (key, entry) {
            $('#game-select').append($('<option></option>').attr('value', entry.MATCH).text(entry.VS+" - "+entry.DATE));
        });
    });
    
}; // end fillSelect

$(document).ready(fillSelect);
$(document).ready(initializeGlobe);