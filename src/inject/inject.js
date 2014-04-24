$(document).ready(function(){
	// ----------------------------------------------------------
	// This part of the script triggers when page is done loading
	console.log("Talent Pooling...");
	// ----------------------------------------------------------
	// 
	// 
	// Initialize the BaaS
	var appUser,
		candidate = {},
		flameImgUrl = chrome.extension.getURL("image/tp-flame.png");

    var client = new Apigee.Client({
        orgName: 'mthayer', // Your Apigee.com username for App Services
        appName: 'talent-pool' // Your Apigee App Services app name
    });

     var candidates = new Apigee.Collection({
            "client": client,
            "type": "candidates"
        });
	
	// create sidebar
	var sidebar = document.createElement('div');
	sidebar.id = "mySidebar";
	sidebar.innerHTML = "\
		<div id='tp-tab'></div>\
	";

  	document.body.appendChild(sidebar);
  	sidebarOpen = true;
	
	// check if user is logged in
	client.getLoggedInUser(function(err, data, user) {
            if (err) {
   				showLogin();
                console.log(err);
                
            } else {
                if (client.isLoggedIn()) {
                    appUser = user;
                    //show data for this person now
                    sidebar.innerHTML = "<div id='tp-tab'></div><span id='tp-loggedin-bar'><span id='tp-logout'>Logout</span> | "+ appUser._data.username+"</span>\
                    <div id='header'>\
					<div id='tp-images'></div>\
					<div id='tp-bookmarked'></div>\
					</div>\
					<div class='clearfix'></div>\
					<div id='tp-content'></div>\
                    ";
                    ScrapeLI();
                }else {
                }
            }
        });

  	//hide and show side panel
  	$('#tp-tab').on('click', function(){
		if(sidebarOpen){
			$('#mySidebar').animate({
				right: "-260"
			}, 200)	
			sidebarOpen = false;
		}else {
			$('#mySidebar').animate({
				right: "0"
			}, 200)	
			sidebarOpen = true;
		}
	})
   
   function showLogin() {
   		sidebar.innerHTML = "\
   		<div id='tp-tab'></div>\
   		<div id='head-band'><div id='head-logo'></div></div>\
   		<form id='login-form' role='form'>\
		<div class='form-group'>\
		<label for='Email1'>Email address</label>\
		<input class='form-control' id='Email1' placeholder='Enter email'>\
		</div>\
		<div class='form-group'>\
		<label for='Password1'>Password</label>\
		<input type='password' class='form-control' id='Password1' placeholder='Password'>\
		</div>\
		<button type='submit' class='btn btn-default'>Submit</button>\
		</form>\
   		";
   }

   	$('#login-form').submit(function(e){
   		console.log("trying to login...");
   		var username = $("#Email1").val();
        var password = $("#Password1").val();
        Login(username, password); 
   		return false;
   	});
   	
    function Login(username, password) {
   		client.login(username, password,
            function(err) {
                if (err) {
                    // $('#login-section-error').html('There was an error logging you in.');
                    console.log(err)
                } else {
                    //login succeeded
                    //need to scrape and request and show here
                    client.getLoggedInUser(function(err, data, user) {
                        if (err) {
                            //error - could not get logged in user
                            console.log('failed to get user data');
                        } else {
                            if (client.isLoggedIn()) {
                                appUser = user;
                                console.log(appUser);
                                sidebar.innerHTML = "<div id='tp-tab'></div><span id='tp-loggedin-bar'><span id='tp-logout'>Logout | </span>"+ appUser._data.username+"</span>\
                                <div id='header'>\
								<div id='tp-images'></div>\
								<div id='tp-bookmarked'></div>\
								</div>\
								<div class='clearfix'></div>\
								<div id='tp-content'></div>\
                                ";
                    		ScrapeLI();
                            }
                        }
                    });

                    //clear out the login form so it is empty if the user chooses to log out
                    $("#Email1").val('');
    				$("#Password1").val('');

                   //hide the form and show candidates
                }
            }
        );

   }

    function ScrapeLI() {
   		candidate.LIID = window.location.search.match(/id=(\d+)/);
   		console.log(candidates.LIID);
		candidate.LIposition = jQuery("[id^='experience-'] h4");
		candidate.email = jQuery("#email-view").text();
		candidate.LIpic = jQuery(".profile-picture img").prop('src');
		candidate.LIEx = jQuery(".background-experience").html();
		if(jQuery("#twitter-view a").attr('href')){
			candidate.LItwi = jQuery("#twitter-view a").attr('href');
		}

		candidate.LIExAll = {}
		$.each(candidate.LIposition, function(i, val){
			console.log($(val).siblings("h5:not('.experience-logo')").text());
			candidate.LIExAll[$(val).siblings("h5:not('.experience-logo')").text()] = $(val).text();
		})

		candidate.LIwww = jQuery("#website-view a").attr('href');
		candidate.LIphone = jQuery("#phone-view li").html();
		candidate.LIed = jQuery(".education").html();
		candidate.LIheadline = jQuery("#headline");
		candidate.twitterURL = decodeURIComponent(candidate.LItwi);
		candidate.twitterName = candidate.twitterURL.match(/https?:\/\/([A-Za-z0-9_.]+)\.com\/([A-Za-z0-9_.]+)/);
		candidate.LIYearsCurrent = candidate.LIEx.match(/Present<\/time><time>\s*\((\d*)\s*([a-zA-Z]*)/);
		console.log(candidate);
		var options = {
			endpoint:"candidates", //the collection to query
			qs:{ql:"name='"+candidate.LIID[1]+"'",limit:1}
		};

		var tpPanel = jQuery('#tp-content');
		//start appending stuff
		console.log("appending stuff");
		console.log(tpPanel);
		jQuery('#tp-images').html('<img id="jp-li-img" src="'+candidate.LIpic+'" />');
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
	    };

SendProfile();
    function SendProfile() {
   		candidateSend = {
			"name" : candidate.LIID[1],
			"fullName" : jQuery('#top-card .full-name').text(),
			"currentTime" : (candidate.LIYearsCurrent ? candidate.LIYearsCurrent[1]+" "+candidate.LIYearsCurrent[2] : "none" ),
			"headline" : candidate.LIheadline.text(),
			"email" : candidate.email,
			"website" : candidate.LIwww,
			"image" : candidate.LIpic,
			"phone" : candidate.LIphone,
			"experience" : candidate.LIExAll,
			"twitter" : (candidate.LItwi ? candidate.twitterName[2] : "none"),
			"appUser" : appUser.serialize()
		}

		$.post("http://localhost:3000/"+ client.orgName + "/" + client.appName + "/candidates", JSON.stringify(candidateSend))
			.done(function(data, text, jqXHR){
				//add the connection complete stuff here
				console.log(data);
				if (typeof(data.entities[0].twitter) != "undefined"){
					var tpPanel = jQuery('#tp-content');
					twitRes = data.entities[0].twitter;
					tpPanel.append("<br><p>Twitter Info</p>");
					tpPanel.append("<br><h3>"+ twitRes.twitBio +"</h3>");
					if (typeof(twitRes.twitWebsite) != "undefined"){
						tpPanel.append("<br><h3><a href='"+twitRes.twitWebsite+"'>Other website</a></h3>");
					};
					tpPanel.append("<br><h3>/"+twitRes.twitText+"</h3>");
					jQuery('#tp-images').append('<img id="jp-li-img" src="'+twitRes.twitImage+'" />');
				}
			})
   };
})
	
