const crypt = require('crypt');
const sha1 = require('sha1');

var objects;
//var url_stack = "https://api.stackexchange.com/2.2/search?order=desc&sort=activity&intitle=perl&site=stackoverflow";
//var local_stack = "stack.json"
//var local_open_access = "00.json"

// EDAN Related
var AppID = "SI_CM";
var AppKey = "71ccc276e09ca0b67b932089029566ca71bd3358";
var EDAN_url = 'http://edan.si.edu';
var search_endpooint ="/metadata/v2.0/collections/search.htm"

function setup() {

 // Date of request
 let RequestDate = getFormattedDate();
 console.log(RequestDate);

 // Generated uniquely for this request
 let Nonce = generateUUID();
 console.log(Nonce);

 let QueryParameters = "q=space";
 console.log(QueryParameters);

 // This will be the value of X-AuthContent, each element is joined by a single newline
 let StringToSign = Nonce + "\n" + QueryParameters + "\n" + RequestDate + "\n" + AppKey;
 console.log(StringToSign);

 // First hash using SHA1
 let HashedString = StringToSign; 

 // Base64 encode
 let EncodedString = btoa(HashedString);
 console.log(EncodedString);

 /*var options = {
  'X-AppId': AppID, 
  'X-Nonce': Nonce, 
  'X-RequestDate': RequestDate, 
  'X-AuthContent': EncodedString
   };

   var headers = new Headers(options);

 console.log(options);*/

 httpDo(
    EDAN_url,
    {
    	method: 'GET',
    	mode: 'no-cors',
    	origin: 'http://localhost',
    	headers: {
    		'X-AppId': AppID,
    		'X-Nonce': Nonce,
    		'X-RequestDate': RequestDate,
    		'X-AuthContent': EncodedString,
    		'Content-Type': 'application/xml'
    	}
    },
    function(res) {objects = res;},
    function(err) {console.log('Error:'+ err);}
  );
}

function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = (performance && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if(d > 0){//Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}


function getFormattedDate() {

  var date = new Date()
      ,day = date.getDate().toString()
      ,month = ('0' + (date.getMonth()+1)).slice(-2)
      ,year = date.getFullYear().toString()
      ,hour = ('0' + date.getHours()).slice(-2)
      ,minutes = date.getMinutes().toString()
      ,seconds = ('0' + date.getSeconds()).slice(-2)
      ,date_formatted = year+'-'+month+'-'+day+' '+hour+':'+minutes+':'+seconds;

  return date_formatted;
}


function draw() {
	if(!objects) {
		return;
	}
	console.log(objects);
}
/*function errorReceived(error) {
	console.log(error);
}

function dataReceived(data) {
	console.log("got data!");
	
	objects = data.items;

	console.log(objects);
	//console.log(objects[0].title);

	for (var i = 0; i < objects.length; i++) {
		console.log(objects[i].title);
	}
}*/
