$(document).ready(function(){
	// ----------------------------------------------------------
	// This part of the script triggers when page is done loading
	console.log("Hello. This message was sent from scripts/inject.js");
	// ----------------------------------------------------------
	// 
	//Apigee account credentials, available in the App Services admin portal 
	var sidebarOpen = false;
	var candidate = {};
	var client_creds = {
        orgName:'mthayer',
        appName:'talent-pool'
    }
	//Initializes the SDK. Also instantiates Apigee.MonitoringClient
	var dataClient = new Apigee.Client(client_creds);

    dataClient.login('mthayer', 'Padres26', function (error,response) {
        if (error) {
            console.log(error);
        } else {
            var token = dataClient.token;
            console.log(token);
        }
    }
);

    // get the LIID
    // make a request to check if it exists
    // if it does bring back all info if not post data to proxy get other info and store
    // create viewed connection
    // show all info in sidebar

	var flameImgUrl = chrome.extension.getURL("image/tp-flame.png");

	function createSidebar() {
		if(sidebarOpen) {
			var el = document.getElementById('mySidebar');
			el.parentNode.removeChild(el);
			sidebarOpen = false;
		}
		else {
			var sidebar = document.createElement('div');
			sidebar.id = "mySidebar";
			sidebar.innerHTML = "\
				<div id='tp-tab'></div>\
				<div id='header'>\
				<div id='tp-images'></div>\
				<div id='tp-candidateed'></div>\
				</div>\
				<div class='clearfix'></div>\
				<div id='tp-content'></div>\
				<div id='tp-action-bar'>Bookmark</div>\
			";

			document.body.appendChild(sidebar);

			chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
  				console.log("sent");
			});
			
		}
	}

	createSidebar();

	sidebarOpen = true;

	var tpPanel = $('#tp-content');

	// candidate.URL = window.location;
	candidate.LIID = window.location.search.match(/id=(\d+)/);
	candidate.LIposition = jQuery("[id^='experience-'] h4");
	// candidate.LIcompany = jQuery("[id^='experience-'] h5:not('.experience-logo')");
	candidate.email = jQuery("#email-view").text();
	candidate.LIpic = jQuery(".profile-picture img").prop('src');
	candidate.LIEx = jQuery(".background-experience").html();
	if(jQuery("#twitter-view a").attr('href')){
		candidate.LItwi = jQuery("#twitter-view a").attr('href');
	}

	var LIExAll = {}
	$.each(candidate.LIposition, function(i, val){
		LIExAll[$(val).siblings("h5:not('.experience-logo')").text()] = $(val).text();
	})

	candidate.LIwww = jQuery("#website-view a").html();
	candidate.LIphone = jQuery("#phone-view li").html();
	candidate.LIed = jQuery(".education").html();
	candidate.LIheadline = jQuery("#headline");

	candidate.twitterURL = decodeURIComponent(candidate.LItwi);
	// /redir/redirect?url=http://twitter.com/wintensive&urlhash=6qyl 
	candidate.twitterName = candidate.twitterURL.match(/https?:\/\/([A-Za-z0-9_.]+)\.com\/([A-Za-z0-9_.]+)/);
	candidate.LIYearsCurrent = candidate.LIEx.match(/Present<\/time><time>\s*\((\d*)\s*([a-zA-Z]*)/);
	
	var options = {
		endpoint:"candidates", //the collection to query
		qs:{ql:"name='"+candidate.LIID[1]+"'",limit:1}
	};

	//Call request to initiate the API call
	dataClient.request(options, function (error, response) {
		if (error){
			//error
		} else {
			console.log(response);
			if(response.count){
				$('#tp-candidateed').show()
				$('#tp-action-bar').hide();
			}
		}	
	});

	candidateSend = {
		"name" : candidate.LIID[1],
		"fullName" : $('#top-card .full-name').text(),
		"currentTime" : candidate.LIYearsCurrent[1]+" "+candidate.LIYearsCurrent[2],
		"headline" : candidate.LIheadline.text(),
		"email" : candidate.email,
		"image" : candidate.LIpic,
		"phone" : candidate.LIphone,
		"experience" : LIExAll

	}
	
	if(candidate.LItwi){
		candidateSend.twitterName = candidate.twitterName[2];
		
		// var xhr = new XMLHttpRequest();
		// xhr.open("GET", "http://localhost:3000/api/ext/ifenn", true);
		// xhr.onreadystatechange = function() {
		//   if (xhr.readyState == 4) {
		//     // JSON.parse does not evaluate the attacker's scripts.
		//     var resp = JSON.parse(xhr.responseText);
		//     console.log(resp);
		//     console.log(xhr.responseText);
		//   }
		// }
		// xhr.send();
	}

	$('#tp-images').html('<img id="jp-li-img" src="'+candidate.LIpic+'" />');
	tpPanel.append("<h2>"+candidate.LIheadline.html()+"</h2><br>");

	if(candidate.LIYearsCurrent !== null){
		if(candidate.LIYearsCurrent[1] >=3 && candidate.LIYearsCurrent[2] === 'years'){
			tpPanel.append("<img height='18' id='tp-flame' src="+flameImgUrl+" />"+candidate.LIYearsCurrent[1]+" "+candidate.LIYearsCurrent[2]+" in current role");	
		}else {
			tpPanel.append(candidate.LIYearsCurrent[1]+" "+candidate.LIYearsCurrent[2]+ " in current role");
		}	
	}else {
		tpPanel.append("<h3>Not currently employed")
	}

	tpPanel.append("<h3>Email: "+candidate.email+"</h3>");

	if(candidate.twitterName !== null){
		tpPanel.append("<h3>Twitter: <a href='http://www.twitter.com/"+candidate.twitterName[2]+"'>"+candidate.twitterName[2]+"</a></h3>");	
	}

	tpPanel.append("<h3>Phone: "+candidate.LIphone+"</h3><br>");
	tpPanel.append("<h3>Education: "+candidate.LIed+"</h3>");

	var options = {
	method:'POST',
	endpoint:'candidates', //The collection name
	body:[candidateSend] //note the multiple JSON objects
};

	var imgURL = chrome.extension.getURL("images/tp-tab.png");


	$('#tp-action-bar').on('click', function(){

		if(!localStorage.getItem(candidate.LIID[1])){
			//localStorage.setItem(candidate.LIID[1], JSON.stringify(candidate));
			dataClient.request(options, function (error, result) {

				if (error) { 
				    console.log(error);
				} else { 
					console.log("touchdown");
				}

			});  

			$('#tp-bookmarked').fadeIn();
			$('#tp-action-bar').hide();
		}
	});


	$('#tp-tab').on('click', function(){
		if(sidebarOpen){
			$('#mySidebar').animate({
				right: "-320"
			}, 200)	
			sidebarOpen = false;
		}else {
			$('#mySidebar').animate({
				right: "0"
			}, 200)	
			sidebarOpen = true;
		}
	})
	
})
	
