function initializeMap() {
    
    $('#button').click(function(){
        $('#overlay').css("display","none")
    });
    
    var map = L.map('map', {
        center: [38.431315, -2.960798],
        zoom: 4
    });
    
    var streets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoiam1qZmlzaGVyIiwiYSI6ImNqYXVlNDg3cDVhNmoyd21oZ296ZXpwdWMifQ.OGprR1AOquImP-bemM-f2g').addTo(map);
    
    $('#game-select').change(function(e){
        var value = $('#game-select').val();
        map.eachLayer(function (layer) {
            if (layer != streets) {
                map.removeLayer(layer);
            };
        });
        updateMap(map,value);
    });
    
    $('#play').click(function(e){
        
        console.log("play clicked")
        
        map.eachLayer(function (layer) {
            if (layer != streets) {
                map.removeLayer(layer);
            };
        });
        
        animatePoints(map);
    });
    
}; // end initializeMap

function animatePoints(map){
    
    seasons = ['X19921993','X19931994','X19941995','X19951996','X19961997','X19971998','X19981999','X19992000','X20002001','X20012002','X20022003','X20032004','X20042005','X20052006','X20062007','X20072008','X20082009','X20092010','X20102011','X20112012','X20122013','X20132014','X20142015','X20152016','X20162017','X20172018','X20182019'];
    
    var totalSeasons = seasons.length;
    console.log(totalSeasons)
    
    pointsDict = {};
    
    $.getJSON("data/base.geojson", function(data){
        
        for (i=0; i<data.features.length; i++){
            
            var season = String(data.features[i].properties.SEASON);
            pointsDict[season] = data.features[i];
            
        };
    });
    
    console.log(pointsDict)

    var markerOptions = {
        "radius": 8,
        fillColor: "#ff7800",
        "color": "#ff7800",
        "weight": 1,
        "opacity": 0.4,
        fillOpacity: 0.0
    };
    /*
    var seasonPoints = L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, markerOptions);
        }
    }).addTo(map);
    */
    q = 0;
    function timingLoop() {
        
        if (q >= totalSeasons) {
            clearInterval()
        } else {
            console.log(q)
            var season = seasons[q];
            var geoFeature = pointsDict[season];
            L.geoJSON(geoFeature).addTo(map);
            q++
        }
    };

    setInterval(timingLoop,1000)
    
}; // end animatePoints

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

//$(document).ready(fillSelect);
$(document).ready(initializeMap);