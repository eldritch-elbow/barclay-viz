

var map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('http://{s}.tile.cloudmade.com/8EE2A50541944FB9BCEDDED5165F09D9/997/256/{z}/{x}/{y}.png', {
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
	maxZoom: 18
}).addTo(map);

stations = {}

$.getJSON( "assets/stations.json", function( station_data ) {

	$.each( station_data, function( key, station ) {
		stations[station.logical_terminal] = station;
	});

	$.getJSON( "assets/test_commuter_921951825.json", function( journey_data ) {

		$.each( journey_data, function( key, journey ) {
		
			start = stations[journey.start_station_logical_term]
			end = stations[journey.end_station_logical_term]

			start.active = end.active = true;

			latlngs = [ [ start.latitude, start.longitude ], [ end.latitude, end.longitude ] ]

			var polyline = L.polyline(latlngs, 
				{color: 'red', weight: journey.jny_count/2}
			).addTo(map);

			polyline.bindPopup(
				"<b>" + start.full_name + "</b> to <br><b>" + end.full_name + "</b><br>" +
				journey.jny_count + " journeys<br>" + 
				Math.ceil(journey.avg_duration / 60) + " minutes (avg)");

		});

		$.each( stations, function( key, station ) {

			if (!station.active) {
				return true;
			}

			var marker = L.circleMarker([station.latitude, station.longitude], {color: 'red', fillColor: '#f03', fillOpacity: 0.5, radius: 3 }).addTo(map);
			marker.bindPopup(station.full_name);

		});
		
	});

});





