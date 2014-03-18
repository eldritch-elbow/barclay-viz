
/* Leaflet variables */
var map = null;
var map_elements = null;

/* Journey data */
var max_jny_count = 0;

/* Controls */
var threshold_slider = null;
var threshold_display = null;
var time_slider = null;
var time_display = null;



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
	var active_bounds = []

	/* Store stations, keyed by logical terminal ID */
	$.getJSON( "assets/stations.json", function( station_data ) {

		$.each( station_data, function( key, station ) {
			stations[station.logical_terminal] = station;
		});

		/* Process raw journey data, create summaries */
		dataset_path = "assets/"+getParameterByName("dataset")+".json";
		$.getJSON( dataset_path, function( journey_data ) {

			process_journeys(journey_data, journeys);
			render_journeys(stations, journeys, jny_threshold, fresh_map_elements);
			render_stations(stations, fresh_map_elements, active_bounds);
						
			/* Everything is ready ... display */
			map.addLayer(fresh_map_elements);
			if (map_elements) {
				map.removeLayer(map_elements);
			}
			map_elements = fresh_map_elements;
			map.fitBounds(active_bounds, {padding: [40,40]});

			/* Finally, update the UI controls to reflect the new map state */
			create_controls(max_jny_count, jny_threshold);
		});

			
	});

}

function process_journeys(journey_data, journey_map) {

	$.each( journey_data, function( key, journey ) {
				
		// Extract minutes from jny start / end
		// Apply start time / end time filter

		start = journey.start_station_logical_term;
		end = journey.end_station_logical_term;

		key = Math.min(start,end) + ":" + Math.max(start,end);

		jny_summary = journey_map[key];

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

			journey_map[key] = jny_summary;
		}

		jny_summary['journey_list'].push(journey);
		jny_summary['counts']['total'] += 1;
		jny_summary['total_duration'] += journey.duration;

		jny_type_key = (journey.start_hour_category_id == 1) ? 'peak' : 'offpeak';
		jny_summary['counts'][jny_type_key] += 1;
	});

}

function render_journeys(stations, journeys, count_threshold, layer_group) {

	/* Render journeys */
	$.each( journeys, function( key, journey ) {
	
		max_jny_count = Math.max(max_jny_count, journey.counts.total);

		/* Skip journeys below a certain threshold */
		if (journey.counts.total < count_threshold) {
			return true;
		}
		/* Some journeys end in oblivion - ignore them */
		if (journey.station_a < 0 || journey.station_b < 0) { 
			return true; 
		}

		station_a = stations[journey.station_a];
		station_b = stations[journey.station_b];

		station_a.active = station_b.active = true;

		latlngs = [ [ station_a.latitude, station_a.longitude ], [ station_b.latitude, station_b.longitude ] ]

		var polyline = L.polyline(
			latlngs, 
			{color: 'blue', weight: journey.counts.total} );

		polyline.bindPopup(
			"<b>" + station_a.full_name + "</b> / <br><b>" + station_b.full_name + "</b><br>" +
			journey.counts.total   + " journeys<br>" + 
			Math.ceil( (journey.total_duration / journey.counts.total) / 60 ) + " minutes (avg)");

		layer_group.addLayer(polyline);
	});

}

function render_stations(stations, layer_group, active_bounds) {

	/* Render stations */
	$.each( stations, function( key, station ) {

		if (!station.active) {
			return true;
		}

		var marker = L.circleMarker(
			[station.latitude, station.longitude], 
			{color: 'black', fillColor: 'black', fillOpacity: 0.8, radius: 3 });
		marker.bindPopup("<b>" + station.full_name + "</b>");

		active_bounds.push( [station.latitude, station.longitude] );

		layer_group.addLayer(marker);			
	});

}


function create_controls(max_journeys, curr_threshold) {


    threshold_slider.slider({
        range: false,
        min:   0,
        max:   max_journeys,
        value: curr_threshold,
        step:  1,
        stop:  set_threshold,
        slide: slide_threshold
    });

	threshold_display.text( curr_threshold );

    time_slider.slider({
        range: true,
        min: 0,
        max: 1439,
        values: [0, 1439],
        step:15,
        stop:  set_time,
        slide: slide_time
    });

	//time_display.text( "test" );
}


function slide_threshold(event, ui) {
	threshold_display.text( threshold_slider.slider("value") );
}

function set_threshold(event, ui) {
	threshold_display.text( threshold_slider.slider("value") );
	update_map( threshold_slider.slider("value") );	
}

function slide_time(event, ui) {
	update_time_display();
}

function set_time(event, ui) {
	update_time_display();	
	update_map( threshold_slider.slider("value") );	
}

function update_time_display() {

	start_minute = time_slider.slider("values", 0);
    end_minute = time_slider.slider("values", 1);

    var start_min = parseInt(start_minute % 60, 10),
        start_hour = parseInt(start_minute / 60 % 24, 10),
        end_min = parseInt(end_minute % 60, 10),
        end_hour = parseInt(end_minute / 60 % 24, 10);

    start_time = time_string(start_hour, start_min);
    end_time = time_string(end_hour, end_min);

	time_display.text( start_time + " - " + end_time );
}

function time_string(hours, minutes) {

    var ampm = (hours < 12) ? "AM" : "PM";
    minutes = minutes + "";

    if (hours == 0) {
        hours = 12;
    }
    if (hours > 12) {
        hours = hours - 12;
    }

    if (minutes.length == 1) {
        minutes = "0" + minutes;
    }

    return hours + ":" + minutes + " " + ampm;
}


$(document).ready(function(){

	/* Prepare widget vars for use in different functions */
	threshold_slider = $("#threshold_slider");
	threshold_display = $("#threshold_display");

	time_slider = $("#time_slider");
	time_display = $("#time_display");

	/* Obtains data, then creates map and UI controls */
	update_map(1);

})

