function initializeMap() {
    
    $('#button').click(function(){
        $('#overlay').css("display","none")
    });
    
    var map = L.map('map', {
        center: [42, 0],
        zoom: 4
    });
    
    var Esri_WorldGrayCanvas = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        {
            attribution: 'Basemap &copy; Esri',
            maxZoom: 16
        }).addTo(map);
    
    $('#game-select').change(function(e){
        var value = $('#game-select').val();
        map.eachLayer(function (layer) {
            if (layer != Esri_WorldGrayCanvas) {
                map.removeLayer(layer);
            };
        });
        updateMap(map,value);
    });
    
    $('#play').click(function(e){
        
        map.eachLayer(function (layer) {
            if (layer != Esri_WorldGrayCanvas) {
                map.removeLayer(layer);
            };
        });
        
        map.setView(new L.LatLng(42,0), 4);
        
        animatePoints(map);
    });
    
}; // end initializeMap

function animatePoints(map){
    
    seasons = ['X19921993','X19931994','X19941995','X19951996','X19961997','X19971998','X19981999','X19992000','X20002001','X20012002','X20022003','X20032004','X20042005','X20052006','X20062007','X20072008','X20082009','X20092010','X20102011','X20112012','X20122013','X20132014','X20142015','X20152016','X20162017','X20172018','X20182019'];
    
    var totalSeasons = seasons.length;
    
    pointsDict = {};
    layersDict = {};
    
    $.getJSON("data/centroids.geojson", function(data){
        
        for (i=0; i<data.features.length; i++){
            
            var season = String(data.features[i].properties.SEASON);            
            pointsDict[season] = data.features[i];
            
        };
    });

    var markerOptions = {
        "radius": 8,
        fillColor: "#C8102E",
        "color": "#00B2A9",
        "weight": 2.5,
        "opacity": 1,
        fillOpacity: 1
    };
    
    q = 0;
    
    function timingLoop() {
        
        if (q >= totalSeasons) {
            
            clearInterval()
            
        } else {
            
            var season = seasons[q];
            var seasonClean = String(season.slice(1,5)+'-'+season.slice(5));
            var geoFeature = pointsDict[season];
            layersDict[season] = L.geoJSON(geoFeature, {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, markerOptions);
                }
            }).bindPopup('<b>'+seasonClean+'</b>',{
                offset: [0,-5],
                direction: 'top'     
            }).addTo(map);
            
            if (q > 0) {
                var prevseason = seasons[q-1];
                layersDict[prevseason].setStyle({
                    "fillOpacity": 0,
                    "color": '#F6EB61'
                });
            };
            
            var oldLegend = $('.legend');
            
            if (oldLegend !== null){
                oldLegend.remove();
            };
            
            var legend = L.control({position: 'bottomleft'});

            legend.onAdd = function(map){

                var div = L.DomUtil.create('div', 'info legend')
                div.innerHTML += '<h1><b>' + seasonClean + '</b></h1>'
                return div;
            };
            
            legend.addTo(map);
            
            q++
        };
    };

    setInterval(timingLoop,1000)
    
}; // end animatePoints

function updateMap(map,value) {
    
    var qseason = value.slice(0,4)+value.slice(5)
    
    var getURL = 'https://fisherjohnmark.carto.com/api/v2/sql?format=GeoJSON&q=';
    var sql = 'SELECT the_geom, player, city, x'+qseason+', x'+qseason+'g FROM fisherjohnmark.lfc_players where x'+qseason+' is not null&api_key=default_public';
    
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

    $.getJSON(getURL+sql, function(data){
        
        var features = data.features;
        console.log(features)
        
        var allPoints = [];
        
        var players = L.geoJSON(features, {
            pointToLayer: function (feature, latlng) {
                allPoints.push(latlng);
                return L.circleMarker(latlng,playerMarker);
            },
            onEachFeature: playerData
        }).addTo(map);
        
        var bounds = L.latLngBounds(allPoints);
        
        map.fitBounds(bounds);
    });
}; // end updateMap

function playerData(feature,layer){
    
    var popupContent = feature.properties.player+"<br>"+feature.properties.city;
    
    layer.bindTooltip(popupContent, {
        offset: [0,-7],
        direction: 'top',
        className: 'popupPlayer'});
}; // end of playerData

function fillSelect() {
    
    seasons = ['1992-1993','1993-1994','1994-1995','1995-1996','1996-1997','1997-1998','1998-1999','1999-2000','2000-2001','2001-2002','2002-2003','2003-2004','2004-2005','2005-2006','2006-2007','2007-2008','2008-2009','2009-2010','2010-2011','2011-2012','2012-2013','2013-2014','2014-2015','2015-2016','2016-2017','2017-2018','2018-2019'];
    
    for (i=0;i<seasons.length;i++){
        
        $('#game-select').append($('<option></option>').attr('value', seasons[i]).text(seasons[i]));
    };
    
}; // end fillSelect

$(document).ready(fillSelect);
$(document).ready(initializeMap);