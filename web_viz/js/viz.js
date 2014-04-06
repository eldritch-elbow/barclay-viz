
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
var day_selector_monfri = null;
var day_selector_weekend = null;
var arrow_selector = null;

function create_map() {

	/* Create the map */
	if (!map) {
		map = L.map('map', {zoomControl: false}).setView([51.5211, -0.0988698], 13);

		/* Create a tile layer based on cloudmade (997 = standard; 998 = soft )*/
		var cmURI = 'http://{s}.tile.cloudmade.com/8EE2A50541944FB9BCEDDED5165F09D9/997/256/{z}/{x}/{y}.png';

		L.tileLayer(cmURI, {
			attribution: 
				'Map data &copy; '+
				'<a href="http://openstreetmap.org">OpenStreetMap</a> contributors, '+
				'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, '+
				'Imagery © <a href="http://cloudmade.com">CloudMade</a>',
			maxZoom: 18})
		.addTo(map);

	}

}

function create_controls() {




var dataset = L.control({position: 'topleft'});

dataset.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'control'); // create a div with a class "control"
    this.update();
    return this._div;
};

dataset.update = function (props) {
    this._div.innerHTML = 

    	'<b>Dataset:</b>'+
        '<select id="dataset_select">'+
            '<option>commuter_crinan_1241340257</option>'+
            '<option selected="selected">commuter_crinan_1921951825</option>'+
            '<option>commuter_crinan_586775127</option>'+
            '<option>commuter_cwharf_153322444</option>'+
            '<option>commuter_westminister_24019561</option>'+
            '<option>commuter_westminister_501975966</option>'+
        '</select>'+
    	'<input type="checkbox" id="filters"><label for="filters">Filters</label>'
};

dataset.addTo(map);







var filter_panel = L.control({position: 'bottomleft'});

filter_panel.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'control filter'); 
    this.update();
    return this._div;
};


filter_panel.update = function (props) {
    this._div.innerHTML = 
		'<div id="threshold_control">'+
	        '<h4 id="threshold_display"></h4>'+
	        '<div id="threshold_slider"></div>'+
		'</div>'+
		'<div id="time_control">'+
			'<h4 id="time_display"></h4>'+
			'<div id="time_slider"></div>'+
		'</div>'+
		'<div id="time_buttons">'+
			'<input type="submit" id="night" value="Night">'+
			'<input type="submit" id="morning" value="Morning">'+
			'<input type="submit" id="afternoon" value="Afternoon">'+
			'<input type="submit" id="evening" value="Evening">'+
			'<input type="checkbox" id="mon_fri" checked><label for="mon_fri" checked>Mon-Fri</label>'+
			'<input type="checkbox" id="weekend" checked><label for="weekend">Weekend</label>'+
		'</div>'+
  //       '<hr>'+
		// '<input type="checkbox" id="arrows" checked><label for="arrows" checked>Arrows</label>'+		
        '<hr>'+
		'<input type="submit" id="reset" value="Reset">';
		;
};

filter_panel.addTo(map);


$('.filter').hide()


$('.control').mouseenter(function() {
  map.dragging.disable();
  map.doubleClickZoom.disable();
});

$('.control').mouseleave(function() {
  map.dragging.enable();
  map.doubleClickZoom.enable();
});



filters_selector = $("#filters");
filters_selector.click( function() {
	$(this).is(':checked') ? $('.filter').show(200) : $('.filter').hide(200);
} );









	/* Prepare widget vars for use in different functions */
	threshold_slider = $("#threshold_slider");
	threshold_display = $("#threshold_display");
	time_slider = $("#time_slider");
	time_display = $("#time_display");
	day_selector_monfri = $("#mon_fri");
	day_selector_weekend = $("#weekend");
	arrow_selector = $("#arrows");


	/* Create threshold slider, display initial value */
    threshold_slider.slider({
        range: false,
        min:   0,
        max:   10,
        value: 2,
        step:  1,
        stop:  set_threshold,
        slide: slide_threshold
    });

	update_threshold_display()



	/* Create time slider, display initial value */
    time_slider.slider({
        range: true,
        min: 0,
        max: 1439,
        values: [0, 1439],
        step: 15,
        stop:  set_time,
        slide: slide_time
    });

	update_time_display();



 	/* Define standard click action: just update the map */
    var click_action = function() {
		update_map(true);
    }

    day_selector_monfri.click( click_action );
    day_selector_weekend.click( click_action );
    arrow_selector.click( click_action );
    $("#dataset_select").change( click_action );

    /* Define complex click actions: update control values, then update maps */
    $("#night").click( function() { set_time_range(0, 240) } );
    $("#morning").click( function() { set_time_range(241, 720) } );
    $("#afternoon").click( function() { set_time_range(721, 1140) } );
    $("#evening").click( function() { set_time_range(1141, 1439) } );

	$('#reset').click( function() {
		/* Avoid overlap with other event handling functions, to prevent multiple calls to update_map */
		threshold_slider.slider('option',{value: 2});
		update_threshold_display();
		time_slider.slider( "option", "values", [ 0, 1439 ] );
		update_time_display();	
		day_selector_monfri.prop('checked', true);
		day_selector_weekend.prop('checked', true);
		update_map( true );	
	});



}


function set_time_range(start_min, end_min) {
	time_slider.slider( "option", "values", [ start_min, end_min ] );
	update_time_display();	
	update_map( true );	
}

function slide_threshold(event, ui) {
	update_threshold_display();
	update_map( false );	
}

function set_threshold(event, ui) {
	update_threshold_display()
	update_map( true );	
}

function slide_time(event, ui) {
	update_time_display();
	update_map( false );	
}

function set_time(event, ui) {
	update_time_display();	
	update_map( true );	
}

function update_threshold_display( ) {
	threshold_display.text( 'Min journeys per route: ' + threshold_slider.slider("value") );
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

	time_display.text( 'Time Range: ' + start_time + " - " + end_time );
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


function getParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

function update_map(with_panning) {

	var dataset = getParameterByName("dataset");
	if (!dataset) {
		dataset = $("#dataset_select :selected").text();
	}

	console.log("Updating map with dataset " + dataset);

	jny_threshold = threshold_slider.slider("value");
	window_begin = time_slider.slider("values", 0);
	window_end = time_slider.slider("values", 1);


	/* Create a layer group for additional elements*/
	var fresh_map_elements = L.layerGroup();

	/* Create objects to hold stations and journey summaries */
	var journeys = {}
	var stations = {}
	var active_bounds = []

	/* Store stations, keyed by logical terminal ID. Data stored with .txt extension
	   to workaround MS config issue with hosting service. */
	$.getJSON( "./assets/stations.txt", function( station_data ) {

		$.each( station_data, function( key, station ) {
			stations[station.logical_terminal] = station;
		});

		/* Process raw journey data, create summaries */
		dataset_path = "./assets/"+dataset+".txt";
		$.getJSON( dataset_path, function( journey_data ) {

			process_journeys(journey_data, window_begin, window_end, journeys );
			render_journeys(stations, journeys, jny_threshold, fresh_map_elements);
			render_stations(stations, fresh_map_elements, active_bounds);
						
			/* Everything is ready ... display */
			map.addLayer(fresh_map_elements);
			if (map_elements) {
				map.removeLayer(map_elements);
			}
			map_elements = fresh_map_elements;
			if (with_panning) {
				map.fitBounds(active_bounds, {padding: [40,40]});
			}

			/* Finally, update the UI controls to reflect the new map state */
			update_controls(max_jny_count);
		});

			
	});

}

function process_journeys(journey_data, window_begin, window_end, journey_map ) {

	$.each( journey_data, function( key, journey ) {

		var start_time = new Date( Date.parse(journey.start_timestamp) );
		var start_minute = (start_time.getHours() * 60) + start_time.getMinutes();
		var start_day = (start_time.getDay());

		if (start_minute < window_begin || start_minute > window_end) { return true; }
		if ( (start_day >= 1 && start_day <= 5) && (day_selector_monfri.is(':checked') == false)) { return true; }
		if ( (start_day == 0 || start_day == 6) && (day_selector_weekend.is(':checked') == false)) { return true; }

		start_term = journey.start_station_logical_term;
		end_term = journey.end_station_logical_term;

		station_a = Math.min(start_term,end_term);
		station_b = Math.max(start_term,end_term);

		key = station_a + ":" + station_b
		jny_summary = journey_map[key];

		if (!jny_summary) {
			jny_summary = {
				'station_a' : station_a,
				'station_b' : station_b,
				'counts' : { 
					'total' : 0,
					'peak' : 0,
					'offpeak' : 0,
					'to_a' : 0,
					'to_b' : 0
				},
				'total_duration' : 0,
				'journey_list' : []
			}

			journey_map[key] = jny_summary;
		}

		jny_summary['journey_list'].push(journey);
		jny_summary['counts']['total'] += 1;
		jny_summary['counts']['to_a'] += (end_term == station_a) ? 1 : 0;
		jny_summary['counts']['to_b'] += (end_term == station_b) ? 1 : 0;
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




/* Test different colours, etc */

// display
//   opacity
//   colour
//   width
//   dashed

// vars
//   Journey count: 0..?
//   Peak vs offpeak: 0..?, or Ratio
//   To/From: ratio?						pie chart

var line_color, unidirectional;

if (journey.counts.to_a == 0 || journey.counts.to_b == 0) {
	line_color = '#CC3300';
	unidirectional = true
} else {
	line_color = '#26287F'
	unidirectional = false
}


var station_a_latlong = [ station_a.latitude, station_a.longitude ]
var station_b_latlong = [ station_b.latitude, station_b.longitude ]

var line_latlongs = [ station_a_latlong, station_b_latlong ] 
if (journey.counts.to_b == 0) {	
	line_latlongs = [ station_b_latlong, station_a_latlong ] 
}

// options:
//    width = scaled journey count
//    opacity = to/from ratio (solid = 50/50 ... 50% = unidirectional / vice versa)
//    colour = to/from ratio

/**************************/



		var line_weight = Math.min(journey.counts.total, 30);

		var polyline = L.polyline(
			line_latlongs, 
			{	color: line_color, 
				weight: line_weight, 
			} );
		layer_group.addLayer(polyline);

		if ( unidirectional ) {  //  arrow_selector.is(':checked') && unidirectional) {

		    var arrowHead = L.polylineDecorator(polyline, {
		        patterns: [
		            {	offset: '20%', 
		            	repeat: '20%', 
		            	symbol: L.Symbol.arrowHead(
							 {
							        pixelSize: line_weight,
							        polygon: true,
							        pathOptions: {
							            stroke: true,
							            weight: 2,
							            color: line_color,
							            opacity: 1,
							            fillOpacity: 1

							        }
							    }
		            		
		            )}
		        ]});

			layer_group.addLayer(arrowHead);


		}
  


		polyline.bindPopup(
			"<b>" + station_a.full_name + "</b> / <br><b>" + station_b.full_name + "</b><br>" +

			journey.counts.total   + " journeys<br>" + 
			Math.ceil( (journey.total_duration / journey.counts.total) / 60 ) + " minutes (avg)<br><br>" +

			journey.counts.to_a + " -> " + station_a.full_name + "<br>" +
			journey.counts.to_b + " -> " + station_b.full_name + "<br><br>" +

			journey.counts.peak + " / " + journey.counts.offpeak + " (peak / off peak)"

			);

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

function update_controls(max_journeys) {
	threshold_slider.slider('option',{min: 0, max: max_journeys});
}



$(document).ready(function(){

	create_map();
	create_controls();
	update_map(true);

})

