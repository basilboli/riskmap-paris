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
            'paint' : {
                'line-color': '#005',
                'line-opacity' : 0.4,
                'line-width' : 2.
            }
        }
    );

    //antenas

    map.addSource("antenas", {
        type: "geojson",
        // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
        // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
        data: "liste-des-antennes-wifi.geojson",
        cluster: true,
        //clusterMaxZoom: 3, // Max zoom to cluster points on
        clusterRadius: 20 // Use small cluster radius for the heatmap look
    });
    var layers_antenas = [
        [0, 'green'],
        [2, 'orange'],
        [3, 'red']
    ];


    layers_antenas.forEach(function (layer, i) {
        map.addLayer({
            "id": "antenas-" + i,
            "type": "circle",
            "source": "antenas",
            "paint": {
                "circle-color": layer[1],
                "circle-radius": 70,
                "circle-blur": 1 // blur the circles to get a heatmap look
            },
            "filter": i === layers_antenas.length - 1 ?
                [">=", "point_count", layer[0]] :
                ["all",
                    [">=", "point_count", layer[0]],
                    ["<", "point_count", layers_antenas[i + 1][0]]]
        }, 'waterway-label');
    });

    map.addLayer({
        "id": "antenas-5",
        "type": "circle",
        "source": "antenas",
        "paint": {
            "circle-color": 'rgba(0,255,0,0.5)',
            "circle-radius": 20,
            "circle-blur": 1
        },
        "filter": ["!=", "cluster", true]
    }, 'waterway-label');

    //floods

    map.addSource("crowds",{
        type: "geojson",
        data: "IRIS_Crowds.geojson",
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
        "source": "crowds",
        "type": "fill",
        'layout': {},
        'paint' : {
            'fill-color':
            {
                property: 'GRIDCODE',
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
    map.addSource("population",{
        type: "geojson",
        data: "Pop_Quartier.geojson",
    });
    map.addLayer({
        "id": "population-1",
        "source": "population",
        "type": "fill",
        'layout': {},
        'paint' : {
            'fill-color':
            {
                property: 'Density',
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

    map.addSource("floods",{
        type: "geojson",
        data: "Quartier_Floods.geojson",
    });
    map.addLayer({
        "id": "floodrisk-1",
        "source": "floods",
        "type": "fill",
        'layout': {},
        'paint' : {
            'fill-color': '#00F',
            'fill-opacity' : {
                property: 'Flood_Risk',
                stops: [
                    [0.0, 0.0],
                    [7.0, 0.3]
                ]
            },
        }

    });

    //restaurants

    map.addSource("restaurants",{
        type: "geojson",
        data: "Restaurants_Quartier.geojson" ,
    });
    map.addLayer({
        "id": "restaurants-1",
        "source": "restaurants",
        "type": "fill",
        'layout': {},
        'paint' : {
            'fill-color':  {
                property: 'Density',
                stops: [
                    [0.0, '#F00'],
                    [0.3, '#0F0']
                ]
            },
            'fill-opacity' :0.3,
        }

    });

    function property(a)
    {
        if (typeof a.Flood_Risk !== "undefined") return "IRIS with flooding::" + a.Flood_Risk;
        if (typeof a.Density !== "undefined") return "Density:" + a.Density.toFixed(2);
        if (typeof a.GRIDCODE !== "undefined") return "Number of active cell phones:" + a.GRIDCODE.toFixed(2);
        return a.Flood_Risk;
    }


    map.on('click', function (e) {
        var features = map.queryRenderedFeatures(e.point, { layers: ['crowds-1','population-1','floodrisk-1','restaurants-1'] });

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
    var toggleableLayerIds = [ 'antenas', 'Crowds', 'Population', 'Flood risk' ,'Restaurants'];
    var toggleableLayers= [['antenas-0','antenas-1','antenas-2','antenas-5'],['crowds-1'],['population-1'],['floodrisk-1'],['restaurants-1']]

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