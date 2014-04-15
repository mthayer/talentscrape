
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) { 
	if(request.greeting=="hello"){
	    console.log("message received!");
	}else {
	    console.log("message not received!");
	}
});

