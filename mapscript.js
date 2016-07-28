mapboxgl.accessToken = 'pk.eyJ1IjoicGV0bzE1OSIsImEiOiJjaXIxc2w4cXowMDdwaTNtZ2VsYnFlOTRrIn0.E4I3oXqYxrr9Bah6HTm4Vg';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v9',
    center: [2.349, 48.86],
    zoom: 13
});

//marker
var marker = {
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [2.349, 48.86]
        }
    }]
};


map.on('load', function() {
    var geocoder=new mapboxgl.Geocoder();
    map.addControl(geocoder);
    //arrondissements

    map.addSource("arrondissements",{
        type: "geojson",
        data: "arrondissements.geojson",
    });

    //quartier

    map.addSource("quartier",{
        type: "geojson",
        data: "quartier_paris.geojson",
    });



    map.addSource("data",{
        type: "geojson",
        data: "FULL_DATA_IRIS.geojson",
    });
    //floods


/*    var layers_crowds = [
        [0, 'green'],
        [1000, 'orange'],
        [1500, 'red']
    ];


    layers_crowds.forEach(function (layer, i) {
        map.addLayer({
            "id": "crowds-"+i,
            "source": "crowds",
            "type": "fill",
            'layout': {},
            'paint' : {
                'fill-color': layer[1],
                'fill-opacity' : 0.3,
            },
            "filter": i === layers_crowds.length - 1 ?
                [">=", "GRIDCODE", layer[0]] :
                ["all",
                    [">=", "GRIDCODE", layer[0]],
                    ["<", "GRIDCODE", layers_crowds[i + 1][0]]]
        });
    });

*/
    map.addLayer({
        "id": "crowds-1",
        "source": "data",
        "type": "fill",
        'layout': {},
        'paint' : {
            'fill-color':
            {
                property: 'Crowd_Dens',
                stops: [
                    [0,'#F00'],
                    [2000, '#0F0']
                ]
            },
            'fill-opacity' : 0.3,
        }

    });

    //population

    //TODO

    map.addLayer({
        "id": "population-1",
        "source": "data",
        "type": "fill",
        'layout': {},
        'paint' : {
            'fill-color':
            {
                property: 'Pop_Densit',
                stops: [
                    [0,'#0F0'],
                    [20, '#880'],
                    [150, '#F00']
                ]
            },
            'fill-opacity' : 0.3,
        }

    });

    //floodrisk


    map.addLayer({
        "id": "floodrisk-1",
        "source": "data",
        "type": "fill",
        'layout': {},
        'paint' : {
            'fill-color': '#00F',
            'fill-opacity' : 0.3,

        },
        'filter':
            ["==", "Flood_Risk", "YES"],

    });

    //restaurants

    map.addLayer({
        "id": "restaurants-1",
        "source": "data",
        "type": "fill",
        'layout': {},
        'paint' : {
            'fill-color':  {
                property: 'Rest_Densi',
                stops: [
                    [0.0, '#F00'],
                    [2, '#0F0']
                ]
            },
            'fill-opacity' :0.3,
        }

    });
    //polution
    map.addLayer({
        "id": "polution-1",
        "source": "data",
        "type": "fill",
        'layout': {},
        'paint' : {
            'fill-color':  {
                property: 'Pollution',
                stops: [
                    [15, '#0F0'],
                    [40, '#F00']
                ]
            },
            'fill-opacity' :0.3,
        }

    });

    //pure-map
    map.addLayer({
        "id": "pure-map-1",
        "source": "data",
        "type": "fill",
        'layout': {},
        'paint' : {

            'fill-opacity' :0.001,
        }

    });

    //tooltip text
    function property(a)
    {
        var s = "<h3>"+ a.NOM+"</h3>" +
                "Flood risk: " + a.Flood_Risk + "<br/>" +
                "Population: "+ a.POPULATION + "<br/>" +
                "Area: " + a.Area.toFixed(2) + " ha <br/>" +
                "Population density: "+a.Pop_Densit.toFixed(2) + " people/ha<br/>" +
                "Pollution index: " + a.Pollution +"<br/>" +
                "Restaurants :" + a.Restau.toFixed(0)+ "<br/>" +
                "Restaurant density: " + a.Rest_Densi.toFixed(2) + "<br/>" +
                "Crowdness: " + a.Crowd_Dens + "<br/>";
        return s;
    }

    //marker

    map.addSource('point', {
        "type": "geojson",
        "data": marker
    });

    map.addLayer({
        "id": "point",
        "type": "circle",
        "source": "point",
        "paint": {
            "circle-radius": 10,
            "circle-color": "#3887be"
        }
    });

    function clicklike(cord)
    {
        var features = map.queryRenderedFeatures(map.project(cord), { layers: ['crowds-1','population-1','floodrisk-1','restaurants-1','polution-1','pure-map-1'] });

        if (!features.length) {
            return;
        }

        var feature = features[0];
        console.log(feature);
        // Populate the popup and set its coordinates
        // based on the feature found.
        marker.features[0].geometry.coordinates = [cord.lng, cord.lat];
        map.getSource('point').setData(marker);

        /*var popup = new mapboxgl.Popup()
         .setLngLat(e.lngLat)
         .setHTML(property(feature.properties))
         .addTo(map);*/

        var panel = document.getElementById( 'panel' ),
            menu = document.getElementById( 'menu' );

        menu.style.right = "310px";
        panel.innerHTML = property(feature.properties);

        panel.style.display = "block";

    }

    map.on('click', function (e) {
        console.log(e.lngLat);
        clicklike(e.lngLat)
    });
    geocoder.on('result', function(ev) {
        console.log(new mapboxgl.LngLat(ev.result.geometry.coordinates[0],ev.result.geometry.coordinates[1]));
        clicklike(new mapboxgl.LngLat(ev.result.geometry.coordinates[0],ev.result.geometry.coordinates[1]));
    });


    //menu
    turnedOn=0;
    turnedOnButt=null;
    var toggleableLayerIds = ['Pure map',  'Crowds', 'Population', 'Flood risk' ,'Restaurants', 'Polution'];
    var toggleableLayers= [['pure-map-1'],['crowds-1'],['population-1'],['floodrisk-1'],['restaurants-1'],['polution-1']];

    for (var i = 0; i < toggleableLayerIds.length; i++) {
        function f() {
            var id = toggleableLayerIds[i];
            var shadedI = i + 0;
            var link = document.createElement('a');
            link.href = '#';
            link.className = (i == 0) ? 'active' : '';
            link.textContent = id;
            if (i == 0)
            {
                turnedOnButt = link;

            }
            var idds = toggleableLayers[shadedI];
            for (var j = 0; j < idds.length; j++) {
                map.setLayoutProperty(idds[j], 'visibility', (i==turnedOn )?'visible':'none');
            }

            link.onclick = function (e) {
                e.preventDefault();
                e.stopPropagation();

                console.log(turnedOn);
                console.log(turnedOnButt);

                var idds2 = toggleableLayers[turnedOn];
                console.log(idds2);

                for (var j = 0; j < idds2.length; j++) {

                    console.log(idds2[j]);
                    map.setLayoutProperty(idds2[j], 'visibility', 'none');
                    console.log(idds2[j]);
                }
                turnedOnButt.className = '';
                console.log(shadedI + 0);

                var idds = toggleableLayers[shadedI];
                console.log(idds);
                for (var j = 0; j < idds.length; j++) {
                    map.setLayoutProperty(idds[j], 'visibility', 'visible');
                }
                this.className = 'active';
                turnedOnButt = this;
                turnedOn = shadedI;
                console.log(turnedOnButt);
            };

            var menubutton = document.getElementById('menu');
            menubutton.appendChild(link);
        }
        f();
    }



    //iris borders

    map.addLayer(
        {
            "id": "iris",
            "source": "data",
            "type": "line",
            'layout': {},
            'minzoom': 13,
            'paint' : {
                'line-color': '#888',
                'line-opacity' : 0.8,
                'line-width' : 3.
            }
        }
    );
    //quartier

/*    map.addLayer(
        {
            "id": "quartier1",
            "source": "quartier",
            "type": "line",
            'layout': {},
            'minzoom': 11,
            'paint' : {
                'line-color': '#888',
                'line-opacity' : 0.8,
                'line-width' : 3.
            }
        }
    );
    */
    //arrondissements

    map.addLayer(
        {
            "id": "arrondissements1",
            "source": "arrondissements",
            "type": "line",
            'layout': {},
            'paint' : {
                'line-color': '#555',
                'line-opacity' : 0.8,
                'line-width' : 5.
            }
        }
    );

});
