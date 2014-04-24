$(document).ready(function(){
	// ----------------------------------------------------------
	// This part of the script triggers when page is done loading
	console.log("Hello. This message was sent from scripts/inject.js");
	// ----------------------------------------------------------
	// 
	// 
	
  
        var appUser;

        var client = new Apigee.Client({
            orgName: 'mthayer', // Your Apigee.com username for App Services
            appName: 'talent-pool' // Your Apigee App Services app name
        });

        var items = new Apigee.Collection({
            "client": client,
            "type": "candidates",
            "qs": {
                "limit": 25,
                "ql": "order by fullName"
            }
        });

        client.getLoggedInUser(function(err, data, user) {
            if (err) {
                //error - show the login form again
                
            } else {
                if (client.isLoggedIn()) {
                    appUser = user;
                    //get current profile info
                }
            }
        });

        // $('#form-add-user').on('click', '#btn-submit', createUser);
        $('#mySidebar').on('click', '#login-submit', function(e){
        	console.log('fitst');
        	login();
        	e.preventDefault();
        });

        // $('#header-mylist').on('click', '#btn-logout', function() {
        //     client.logout();
        // })

        // function createUser() {
        //     var username = $("#form-new-username").val();
        //     var password = $("#form-new-password").val();
        //     var options = {
        //         method: 'POST',
        //         endpoint: 'users',
        //         body: {
        //             "name": username,
        //             "email": "",
        //             "username": username,
        //             "password": password
        //         }
        //     };
        //     client.request(options, function(err, data) {
        //         if (err) {
        //             console.log('FAIL')
        //         } else {
        //             console.log('SUCCESS');
        //             login(username, password);
        //             $("#form-new-username").val('');
        //             $("#form-new-password").val('');
        //         }
        //     });
        // }

        function login(username, password) {
            $('#login-section-error').html('');
            console.log("trying to login...");
            if (username && password) {
                var username = username;
                var password = password;
            } else {
                var username = $("#form-username").val();
                var password = $("#form-password").val();
            }

            client.login(username, password,
                function(err) {
                    if (err) {
                        $('#login-section-error').html('There was an error logging you in.');
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
                        $("#form-username").val('');
                        $("#form-password").val('');

                       //hide the form and show candidates
                    }
                }
            );
        }

        //loadItems();

        function loadItems() {
            items.fetch(
                function(err, data) { // Success
                    if (err) {
                        alert("Read failed - loading offline data");
                        items = client.restoreCollection(localStorage.getItem('items'));
                        items.resetEntityPointer();
                        $('#bucketlist').empty();
                        while (items.hasNextEntity()) {
                            var item = items.getNextEntity();
                            $('#bucketlist').append('<li><a href="#page-add"><h3>' + item.get('title') + '</h3></a></li>')
                        }
                        $('#bucketlist').listview('refresh');
                    } else {
                        $('#bucketlist').empty();
                        while (items.hasNextEntity()) {
                            var item = items.getNextEntity();
                            $('#bucketlist').append('<li><a href="#page-add"><h3>' + item.get('title') + '</h3></a></li>')
                        }
                        $('#bucketlist').listview('refresh');
                        localStorage.setItem('items', items.serialize());
                    }
                });
        }

        $('#form-add-item').on('click', '#btn-submit', function() {
            if ($('#form-title').val() !== '') {
                var newItem = {
                    'title': $('#form-title').val(),
                    'desc': $('#form-desc').val()
                }
                items.addEntity(newItem, function(error, response) {
                    if (error) {
                        alert("write failed");
                    } else {
                        $('#form-title').val('');
                        $('#form-desc').val('');
                        loadItems();
                        history.back();
                    }
                });
            }
        });
   
    
	// 
	// 
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
    // 
    // get last ten viewed 
    // get bookmarked

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
				<div id='tp-bookmarked'></div>\
				</div>\
				<div class='clearfix'></div>\
				<div id='tp-content'></div>\
				<div id='tp-action-bar'>Bookmark</div>\
				<form action='' id='form-login-user'>\
				<input id='form-username' type='text' placeholder='Your username...' />\
				<input id='form-password' placeholder='Your password'/>\
				</form>\
				<button id='login-submit'>Login</button>\
				<div id='login-section-error'></div>\
			";

			document.body.appendChild(sidebar);

			// chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
  	// 			console.log("sent");
			// });
			
		}
	}

	createSidebar();

	sidebarOpen = true;


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
			console.log("initial request failed");
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

// candidates.addEntity(candidateSend, function(error, response){
		// 	if(error){
		// 		console.log("addEntity error");
		// 	}
		// 	console.log("touchdown");
		// 	appUser.connect("viewed", response, function(error, data) {
		// 				if(error){
		// 					console.log("we didnt mark as viewed");
		// 				}
		// 				console.log("viewed");
		// 				var myList = new Apigee.Collection({
		// 		            "client": client,
		// 		            "type": "users/me/viewed",
		// 		            "qs": {
		// 		                "limit": 25,
		// 		                "ql": "order by fullName"
		// 		            }
		// 		        });
		// 		         // myList.fetch(
  //            //    			function(err, data) {console.log(data)})
		// 			})
		// })	
	
		// // function ViewedProfile() {
	// 	appUser.connect("viewed", candidate, function(error, data) {
	// 		if(error){
	// 			console.log("we didnt mark as viewed");
	// 		}
	// 	})
	// }
	// 
	// // var options = {
		// 	method:'POST',
		// 	endpoint:'candidates', //The collection name
		// 	body:[candidateSend]
		// };

		// client.request(options, function (error, response) {
		// 		if (error) { 
		// 		    console.log(error);
		// 		} else { 
		// 			console.log("here is comes:")
		// 			console.log(response);
		// 			appUser.connect("viewed", response, function(error, data) {
		// 				if(error){
		// 					console.log("we didnt mark as viewed");
		// 				}
		// 				console.log("viewed");
		// 			})
		// 		}

		// 	});
		// 	
		// 	// 	client.request(options, function (error, response) {
	// 	if (error){
	// 		console.log("initial request failed");
	// 	} else {
	// 		if(response.count){
	// 			// console.log(response);
	// 			//this already exists in the db so we can so we should get and show all details
	// 		} else {
	// 			console.log("this person not found");
	// 			//send the scraped data to node
	// 			SendProfile();
	// 		}
	// 	}	
	// });
	
