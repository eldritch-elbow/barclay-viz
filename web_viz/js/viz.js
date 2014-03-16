
var map = null;

function create_map(jny_threshold) {

if (map) {
	map.remove();
}

/* Create the map */
map = L.map('map').setView([51.5211, -0.0788698], 13);

/* Create a tile layer based on cloudmade */
L.tileLayer('http://{s}.tile.cloudmade.com/8EE2A50541944FB9BCEDDED5165F09D9/997/256/{z}/{x}/{y}.png', {
	attribution: 
		'Map data &copy; '+
		'<a href="http://openstreetmap.org">OpenStreetMap</a> contributors, '+
		'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, '+
		'Imagery © <a href="http://cloudmade.com">CloudMade</a>',
	maxZoom: 18})
.addTo(map);

/* Create objects to hold stations and journey summaries */
stations = {}
journeys = {}

/* Store stations, keyed by logical terminal ID */
$.getJSON( "assets/stations.json", function( station_data ) {

	$.each( station_data, function( key, station ) {
		stations[station.logical_terminal] = station;
	});


	/* Process raw journey data, create summaries */
	$.getJSON( "assets/crinan_commuter_1921951825.json", function( journey_data ) {

		$.each( journey_data, function( key, journey ) {
		
		console.log(journey);
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
		
			if (journey.counts.total < jny_threshold) {
				return true; // Move onto next journey
			}

			station_a = stations[journey.station_a];
			station_b = stations[journey.station_b];

			station_a.active = station_b.active = true;

			latlngs = [ [ station_a.latitude, station_a.longitude ], [ station_b.latitude, station_b.longitude ] ]

			var polyline = L.polyline(
				latlngs, 
				{color: 'red', weight: journey.counts.total} )
			.addTo(map);

			polyline.bindPopup(
				"<b>" + station_a.full_name + "</b> / <br><b>" + station_b.full_name + "</b><br>" +
				journey.counts.total   + " journeys<br>" + 
				Math.ceil( (journey.total_duration / journey.counts.total) / 60 ) + " minutes (avg)");

		});

		/* Render stations */
		$.each( stations, function( key, station ) {

			if (!station.active) {
				return true;
			}

			var marker = L.circleMarker(
				[station.latitude, station.longitude], 
				{color: 'darkred', fillColor: 'darkred', fillOpacity: 0.5, radius: 3 })
			.addTo(map);
			marker.bindPopup("<b>" + station_a.full_name + "</b>");

		});


	});


		
});

}


$(document).ready(function(){

	var threshold = $( "#jny_threshold" ).spinner();

	$( "#refresh" ).click(function() {
	  create_map( threshold.spinner( "value" ) );
	});

	create_map(1);

})

