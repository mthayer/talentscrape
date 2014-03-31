chrome.extension.sendMessage({}, function(response) {
	console.log("sent message");
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

	
		// ----------------------------------------------------------
		// This part of the script triggers when page is done loading
		console.log("Hello. This message was sent from scripts/inject.js");
		// ----------------------------------------------------------
		// 
		// 

		var sidebarOpen = false;
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
					<div id='tp-content'></div>\
					<div id='tp-action-bar'></div>\
				";
	
				document.body.appendChild(sidebar);
				
			}
		}

		createSidebar();

		sidebarOpen = true;

		var tpPanel = $('#tp-content');

		var URL = window.location;
		var LIID = URL.search.match(/id=(\d+)/);

		console.log(LIID);

		var email = jQuery("#email-view").text();
		var LIpic = jQuery(".profile-picture img").prop('src');
		var LIEx = jQuery(".background-experience");
		var LItwi = jQuery("#twitter-view a").attr('href');
		var LIwww = jQuery("#website-view a");
		var LIphone = jQuery("#phone-view li");
		var LIed = jQuery(".education");

		var twitterURL = decodeURIComponent(LItwi);
		// /redir/redirect?url=http://twitter.com/wintensive&urlhash=6qyl 
		var twitterName = twitterURL.match(/https?:\/\/([A-Za-z0-9_.]+)\.com\/([A-Za-z0-9_.]+)/);

		console.log(LIwww.text());
		console.log(twitterURL);
		console.log(LIphone.text());
		console.log(LIed.text());

		tpPanel.html('<img id="jp-li-img" src="'+LIpic+'" />')
		tpPanel.append("<h3>Email: "+email+"</h3>");

		if(twitterName !== null){
			tpPanel.append("<h3>Twitter: <a href='http://www.twitter.com/"+twitterName[2]+"'>"+twitterName[2]+"</a></h3>");	
		}

		tpPanel.append("<h3>Phone: "+LIphone.html()+"</h3><br>");
		tpPanel.append("<h3>Education: "+LIed.html()+"</h3>");

		LIEx.each(function(){
			tpPanel.append("<h3>"+$(this).html()+"</h3><br>");
		})


		var imgURL = chrome.extension.getURL("images/tp-tab.png");
		console.log(imgURL);


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

		// setTimeout(function() {
		// $('#tp-action-bar').show();
		// $('#tp-action-bar').animate({
		// 			bottom: "0"
		// 		}, 1000)
		// }, 4000);

	}
	}, 10);
});