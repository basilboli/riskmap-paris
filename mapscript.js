mapboxgl.accessToken = 'pk.eyJ1IjoicGV0bzE1OSIsImEiOiJjaXIxc2w4cXowMDdwaTNtZ2VsYnFlOTRrIn0.E4I3oXqYxrr9Bah6HTm4Vg';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v9',
    center: [2.349, 48.86],
    zoom: 13
});


map.on('load', function() {
    map.addControl(new mapboxgl.Geocoder());

    //arrondissements

    map.addSource("arrondissements",{
        type: "geojson",
        data: "arrondissements.geojson",
    });
    map.addLayer(
        {
            "id": "arrondissements1",
            "source": "arrondissements",
            "type": "line",
            'layout': {},
            'paint' : {
                'line-color': '#008',
                'line-opacity' : 0.2,
                'line-width' : 4.
            }
        }
    );

    //quartier

    map.addSource("quartier",{
        type: "geojson",
        data: "quartier_paris.geojson",
    });

    map.addLayer(
        {
            "id": "quartier1",
            "source": "quartier",
            "type": "line",
            'layout': {},
            'minzoom': 10,
            'paint' : {
                'line-color': '#005',
                'line-opacity' : 0.4,
                'line-width' : 2.
            }
        }
    );

    //antenas


    //floods

    map.addSource("data",{
        type: "geojson",
        data: "FULL_DATA_IRIS.geojson",
    });



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

    //tooltip text
    function property(a)
    {
        var s = "<h3>"+ a.NOM+"</h3>" +
                "Flood risk: " + a.Flood_Risk + "<br/>" +
                "Population: "+ a.POPULATION + "<br/>" +
                "Area:" + a.Area.toFixed(2) + " ha <br/>" +
                "Population density: "+a.Pop_Densit.toFixed(2) + " people/ha<br/>" +
                "Pollution index:" + a.Pollution +"<br/>" +
                "Restaurants:" + a.Restau.toFixed(0)+ "<br/>" +
                "Restaurant density:" + a.Rest_Densi.toFixed(2) + "<br/>" +
                "Crowdness:" + a.Crowd_Dens + "<br/>";
        return s;
    }


    map.on('click', function (e) {
        var features = map.queryRenderedFeatures(e.point, { layers: ['crowds-1','population-1','floodrisk-1','restaurants-1','polution-1'] });

        if (!features.length) {
            return;
        }

        var feature = features[0];

        // Populate the popup and set its coordinates
        // based on the feature found.

        var popup = new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(property(feature.properties))
            .addTo(map);
    });


    //menu
    turnedOn=0;
    turnedOnButt=null;
    var toggleableLayerIds = [  'Crowds', 'Population', 'Flood risk' ,'Restaurants', 'Polution'];
    var toggleableLayers= [['crowds-1'],['population-1'],['floodrisk-1'],['restaurants-1'],['polution-1']]

    for (var i = 0; i < toggleableLayerIds.length; i++) {
        function name() {
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
        name();
    }
});