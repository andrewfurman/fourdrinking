var token, map = {}, checkins = [];
// var drinkingVenues = new Array("4bf58dd8d48988d116941735", "1");
var drinkingVenues = new Array("4bf58dd8d48988d17c941735", "4bf58dd8d48988d18e94173",
"4bf58dd8d48988d1e5931735",
"4bf58dd8d48988d1e7931735",
"4bf58dd8d48988d1e8931735",
"4bf58dd8d48988d1e9931735",
"4bf58dd8d48988d1e3931735",
"4bf58dd8d48988d184941735",
"4bf58dd8d48988d183941735",
"4bf58dd8d48988d1b0941735",
"4bf58dd8d48988d1cf941735",
"4bf58dd8d48988d1c4941735",
"4bf58dd8d48988d14b941735",
"4bf58dd8d48988d116941735",
"4bf58dd8d48988d117941735",
"4bf58dd8d48988d11e941735",
"4bf58dd8d48988d118941735",
"4bf58dd8d48988d1d8941735",
"4bf58dd8d48988d119941735",
"4bf58dd8d48988d1d5941735",
"4bf58dd8d48988d120941735",
"4bf58dd8d48988d121941735",
"4bf58dd8d48988d11f941735",
"4bf58dd8d48988d11c941735",
"4bf58dd8d48988d1d4941735",
"4bf58dd8d48988d11d941735",
"4bf58dd8d48988d122941735",
"4bf58dd8d48988d123941735");
var requestUrl = "https://api.foursquare.com/v2/checkins/recent?limit=100&callback=parseResponse&v=20140921";
var userDataUrl = "https://api.foursquare.com/v2/users/self?callback=parseUserResponse"
//window.onresize = function() {resize()};
window.onload=function(){
	window.location.href.replace(/[#&]+([^=&]+)=([^&]*)/gi, function(m,key,value) { map[key] = value;});
	requestUrl+= "&oauth_token="+map['access_token'];
	userDataUrl += "&oauth_token="+map['access_token'];
	insertScript();
}
function insertScript(){
	var elem = document.createElement("script");
	elem.src = requestUrl;
	document.body.appendChild(elem);
}
function parseResponse(data){
	if(data.meta.code != 200) {
		alert('error: '+data.meta.errorDetail);
	}
	var checkinsData = data.response.recent;
	//document.getElementById('jsonOutput').innerHTML = JSON.stringify(data);
	for (var i=0; i<checkinsData.length-1;i++) {
		checkinObject = new Object();
		try{
			//insert venue info that might be optional
			checkinObject.id = checkinsData[i].id;
			checkinObject.firstName = checkinsData[i].user.firstName;
			checkinObject.lastName = checkinsData[i].user.lastName;
			checkinObject.userId = checkinsData[i].user.id;
			checkinObject.createdAt = checkinsData[i].createdAt;
			var myDate = new Date( checkinObject.createdAt *1000);
			checkinObject.createdAt = myDate.toLocaleString();
			checkinObject.venueName = checkinsData[i].venue.name;
			checkinObject.venueId = checkinsData[i].venue.id;
			checkinObject.venueAddress = checkinsData[i].venue.location.address;
			checkinObject.venueCity = checkinsData[i].venue.location.city+', '+checkinsData[i].venue.location.state+' '+checkinsData[i].venue.location.postalCode;
			checkinObject.latitude = checkinsData[i].venue.location.lat;
			checkinObject.longitude = checkinsData[i].venue.location.lng;
			checkinObject.icon = checkinsData[i].venue.categories[0].icon;
			if(drinkingVenues.indexOf(checkinsData[i].venue.categories[0].id)>=0){
				checkins.push(checkinObject);
			}
	 	}catch(err){}
	}
	var listOfCheckins = "";
	for(var i = 0; i<checkins.length-1; i++){
		listOfCheckins += '<br/>';
		//listOfCheckins += '<br/><p><strong>id</strong>: '+checkins[i].id+'</p>';
		listOfCheckins += '<p><strong> '+checkins[i].firstName+' '+checkins[i].lastName+'</strong></p>';
		//listOfCheckins += '<p><strong>lastName</strong>: '+checkins[i].lastName+'</p>';
		listOfCheckins += '<img src=\"'+checkins[i].icon+'\" alt=\"icon\"/>';
		listOfCheckins += '<strong>  </strong>: '+checkins[i].venueName+'';
		listOfCheckins += '<p><strong>Datetime</strong>: '+checkins[i].createdAt+'</p>';
		listOfCheckins += '<p><strong>Address</strong>: '+checkins[i].venueAddress+'</p>';
		listOfCheckins += '<p><strong>City</strong>: '+checkins[i].venueCity+'</p>';
		//listOfCheckins += '<p><strong>Latitude</strong>: '+checkins[i].latitude+'</p>';
		//listOfCheckins += '<p><strong>Longitude</strong>: '+checkins[i].longitude+'</p>';
	}
	document.getElementById('checkinList').innerHTML = listOfCheckins;
	initialize();
}
//builds the map
var markers = [];
function initialize() {
	var myLatlng = new google.maps.LatLng(40.441667,-80), bounds = new google.maps.LatLngBounds();
	var myOptions = {zoom: 8,center: myLatlng,mapTypeId: google.maps.MapTypeId.ROADMAP}
	map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	// creates the markers and places them on the map
  	for (var i = 0; i < checkins.length; i++) {
  	    	var location = new google.maps.LatLng(checkins[i].latitude,checkins[i].longitude);
  	    	var marker = new google.maps.Marker({
  	        	position: location,
  	        	map: map,
  	    	});
  			markers[i] = marker;
			bounds.extend(markers[i].position);
  	       	attachWindow(marker, i);
  	  	}
	var markerCluster = new MarkerClusterer(map, markers);
	// centers the map based on the markers
		var bounds = new google.maps.LatLngBounds();
		for(var i=0; i<markers.length; i++){
			bounds.extend(markers[i].position);
		}
		map.fitBounds(bounds);
}

var infowindows = [], currentWindowNumber;
function attachWindow(marker,i) {
	infowindows[i] = new google.maps.InfoWindow({content:
		'<p><img src=\"'+checkins[i].icon+'\" alt=\"icon\"/></p>'+
		'<p><strong>'+checkins[i].firstName+' '+checkins[i].lastName+'</strong></p>'+
		'<a href=https://foursquare.com/user/'+checkins[i].userId+'/checkin/'+checkins[i].id+'>'+checkins[i].venueName+'</a>'
	});
	google.maps.event.addListener(marker, 'click', function() {
		if(currentWindowNumber != null)
			infowindows[currentWindowNumber].close();
		currentWindowNumber = i;
		infowindows[i].open(map,marker);
	});
}

// function resize() {
// 	document.getElementById("map_canvas").style.height = (document.body.clientHeight/2) + "px";
// }