$(document).ready(function(){
	// ----------------------------------------------------------
	// This part of the script triggers when page is done loading
	console.log("Talent Scraping...");
	// ----------------------------------------------------------
	// 
	// 
	// Initialize the BaaS
	var appUser,
		candidate = {};

    var client = new Apigee.Client({
        orgName: 'mthayer', // Your Apigee.com username for App Services
        appName: 'talent-pool' // Your Apigee App Services app name
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
                    ScrapeLI();
                    //show data for this person now
                    sidebar.innerHTML = "<h1>I Am LOGGED IN AS " + appUser._data.username + "</h1>"; 
                }else {
                }
            }
        });
	
	
	

  	//hide and show side panel
  	$('#tp-tab').on('click', function(){
		if(sidebarOpen){
			$('#mySidebar').animate({
				right: "-290"
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
        //need to scrape and request and show here
        sidebar.innerHTML = "<h1>I Am LOGGED IN AS " + appUser._data.username + "</h1>"; 
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
                    client.getLoggedInUser(function(err, data, user) {
                        if (err) {
                            //error - could not get logged in user
                            console.log('login failed');
                        } else {
                            if (client.isLoggedIn()) {
                                appUser = user;
                                console.log('login successful');
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
		
		client.request(options, function (error, response) {
		if (error){
			console.log("initial request failed");
		} else {
			if(response.count){
				console.log(response);
				//this already exists in the db so we can so we should get and show all details
			} else {
				console.log("this person not found");
				//send the scraped data to node
			}
		}	
	});
   };

   function sendProfile() {
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
		}

		var options = {
			method:'POST',
			endpoint:'candidates', //The collection name
			body:[candidateSend] //note the multiple JSON objects
		};

		client.request(options, function (error, result) {

				if (error) { 
				    console.log(error);
				} else { 
					console.log("touchdown");
				}

			});
   }

	
})
	
