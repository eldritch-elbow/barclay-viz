
/* Leaflet variables */
var map = null;
var map_elements = null;

/* Journey data */
var max_jny_count = 0;

/* Controls */
var slider_threshold = null;
var slider_display = null;


function set_threshold(event, ui) {
	update_map( slider_threshold.slider("value") );	
}

function slide_threshold(event, ui) {
	slider_display.text( slider_threshold.slider("value") );
}

function getParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

function update_map(jny_threshold) {

	/* Create the map */
	if (!map) {
		map = L.map('map').setView([51.5211, -0.0988698], 13);

		/* Create a tile layer based on cloudmade */
		L.tileLayer('http://{s}.tile.cloudmade.com/8EE2A50541944FB9BCEDDED5165F09D9/997/256/{z}/{x}/{y}.png', {
			attribution: 
				'Map data &copy; '+
				'<a href="http://openstreetmap.org">OpenStreetMap</a> contributors, '+
				'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, '+
				'Imagery © <a href="http://cloudmade.com">CloudMade</a>',
			maxZoom: 18})
		.addTo(map);

	}

	/* Create a layer group for additional elements*/
	var fresh_map_elements = L.layerGroup();

	/* Create objects to hold stations and journey summaries */
	var journeys = {}
	var stations = {}

	/* Store stations, keyed by logical terminal ID */
	$.getJSON( "assets/stations.json", function( station_data ) {

		$.each( station_data, function( key, station ) {
			stations[station.logical_terminal] = station;
		});


		/* Process raw journey data, create summaries */
		dataset_path = "assets/"+getParameterByName("dataset")+".json";
		$.getJSON( dataset_path, function( journey_data ) {

			$.each( journey_data, function( key, journey ) {
			
				start = journey.start_station_logical_term;
				end = journey.end_station_logical_term;

				key = Math.min(start,end) + ":" + Math.max(start,end);

				jny_summary = journeys[key];

				if (!jny_summary) {
					jny_summary = {
						'station_a' : Math.min(start,end),
						'station_b' : Math.max(start,end),
						'counts' : { 
							'total' : 0,
							'peak' : 0,
							'offpeak' : 0
						},
						'total_duration' : 0,
						'journey_list' : []
					}

					journeys[key] = jny_summary;
				}

				jny_summary['journey_list'].push(journey);
				jny_summary['counts']['total'] += 1;
				jny_summary['total_duration'] += journey.duration;

				jny_type_key = (journey.start_hour_category_id == 1) ? 'peak' : 'offpeak';
				jny_summary['counts'][jny_type_key] += 1;
			});




			/* Render journeys */
			$.each( journeys, function( key, journey ) {
			
				max_jny_count = Math.max(max_jny_count, journey.counts.total);

				/* Skip journeys below a certain threshold */
				if (journey.counts.total < jny_threshold) {
					return true;
				}

				station_a = stations[journey.station_a];
				station_b = stations[journey.station_b];

				/* Some journeys end in oblivion - ignore them */
				if (journey.station_a < 0 || journey.station_b < 0) { 
					return true; 
				}

				station_a.active = station_b.active = true;

				latlngs = [ [ station_a.latitude, station_a.longitude ], [ station_b.latitude, station_b.longitude ] ]

				var polyline = L.polyline(
					latlngs, 
					{color: 'blue', weight: journey.counts.total} );

				polyline.bindPopup(
					"<b>" + station_a.full_name + "</b> / <br><b>" + station_b.full_name + "</b><br>" +
					journey.counts.total   + " journeys<br>" + 
					Math.ceil( (journey.total_duration / journey.counts.total) / 60 ) + " minutes (avg)");

				fresh_map_elements.addLayer(polyline);
			});

			/* Render stations */
			var new_bounds = [];
			$.each( stations, function( key, station ) {

				if (!station.active) {
					return true;
				}

				var marker = L.circleMarker(
					[station.latitude, station.longitude], 
					{color: 'black', fillColor: 'black', fillOpacity: 0.8, radius: 3 });
				marker.bindPopup("<b>" + station.full_name + "</b>");

				new_bounds.push( [station.latitude, station.longitude] );

				fresh_map_elements.addLayer(marker);			
			});


			/* Everything is ready ... display */
			map.addLayer(fresh_map_elements);
			if (map_elements) {
				map.removeLayer(map_elements);
			}
			map_elements = fresh_map_elements;
			map.fitBounds(new_bounds, {padding: [40,40]});

			/* Finally, update the UI controls to reflect the new map state */
			create_controls(max_jny_count, jny_threshold);
		});

			
	});

}


function create_controls(max_journeys, curr_threshold) {


    slider_threshold.slider({
        range: false,
        min:   0,
        max:   max_journeys,
        value: curr_threshold,
        step:  1,
        stop:  set_threshold,
        slide: slide_threshold
    });

	slider_display.text( curr_threshold );


}


$(document).ready(function(){

	/* Prepare widget vars for use in different functions */
	slider_threshold = $("#threshold_slider");
	slider_display = $("#threshold_display");

	/* Obtains data, then creates map and UI controls */
	update_map(1);

})

