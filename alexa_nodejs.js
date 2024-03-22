// Requires
var Alexa = require('alexa-sdk');
var crypto = require('crypto');
var uuid = require('uuid');
var https = require('https');
"use strict";



// 1. Text strings =====================================================================================================
//    Modify these strings and messages to change the behavior of your Lambda function
var myRequest = 'motorcycle+evel';
var locale = 'en';

   
// Typically taken from your configuration
var AppID = "EDAN2_BASE";
var AppKey = "e8a680354bedd6a19924e4098584ac14b311ff04";
// 2. Skill Code =======================================================================================================

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = 'amzn1.ask.skill.3fa3dc32-d33b-48e5-b35e-469991017b69';
    // alexa.dynamoDBTableName = 'YourTableName'; // creates new table for session.attributes
    alexa.registerHandlers(handlers);
    alexa.execute();
};
var handlers = {
    'LaunchRequest': function() {
        //this.emit('GetImages');
    },
    'GetHours':function() {
        var SmithsonianResponse = "Open 10 a.m. to 5:30 p.m. daily.  Smithsonian museums are open every day of the year except December 25, unless otherwise noted. Special spring, summer, and holiday hours are determined annually.  ";
        this.response.speak(SmithsonianResponse);
        this.emit(':responseReady');
    },
    
    'GetImages': function() {
        var myRequest =   this.event.request.intent.slots.SISearch.value;
        myRequest = myRequest.replace(' ', '+');
        //intent.slots.SISearch.value;

        httpsGetEDAN(myRequest, (myResult) => {
            console.log("sent     : " + myRequest);
            //console.log("received : " + myResult);
            //console.log("Received Title: " + myResult.cardTitle);
            //console.log("Received Content: " + myResult.cardContent);
            //console.log("Received Small Image: " + myResult.imageObj.smallImageUrl);
            //console.log("Received Large Image: " + myResult.imageObj.largeImageUrl);
                    
            this.response.cardRenderer(myResult[0], myResult[1], myResult[2]);
            
            this.response.speak(myResult[0] + ',' + myResult[1]);
            this.emit(':responseReady');
        });
    },
        'GetSnapshots': function() {
        //ToDo: Finish this function
        GetSnapshot(myRequest, (myResult) => {
            console.log("Searched For: " + myRequest);

            this.response.speak('Your Smithsonian Snapshot request returned this... ' + myRequest);
            this.emit(':responseReady');
        });
    }
    
};
//    END of Intent Handlers {} ========================================================================================

// 3. Helper Function  =================================================================================================
function httpsGetEDAN(myData, callback) {


    // Date of request
    var RequestDate = Date();

    // Generated uniquely for this request
    var Nonce = uuid.v4();

    // Your request (example of format to enter query parameters)
    var fqs='&fq=online_media_type:"Images"';
          // &fq=online_media_type:"Images"
    var QueryParameters = "q=" + myData + fqs;

    // This will be the value of X-AuthContent, each element is joined by a single newline
    var StringToSign = Nonce + "\n" + QueryParameters + "\n" + RequestDate + "\n" + AppKey;

    var sha1 = crypto.createHash('sha1').update(StringToSign).digest("hex");
    var content = new Buffer(sha1).toString('base64');

    var header = {
        'X-AppId': AppID,
        'X-RequestDate': RequestDate,
        'X-Nonce': Nonce,
        'X-AuthContent': content
    };
    var full_url = "edan.si.edu";

    QueryParameters = "q=" + myData + fqs; 

    console.log("QueryParameters:" + QueryParameters);
    
    var options = {
        host: full_url,
        port: 443,
        path: '/metadata/v1.0/metadata/search.htm?q=' + myData + fqs, //record_ID%3A%20saam_2009.5
        method: 'GET',
        headers: header
        // if x509 certs are required:
        // key: fs.readFileSync('certs/my-key.pem'),
        // cert: fs.readFileSync('certs/my-cert.pem')
    };
    var req = https.request(options, res => {
        res.setEncoding('utf8');
        var returnData = "";
        res.on('data', chunk => {
            returnData = returnData + chunk;
        });
        res.on('end', () => {

            var result = JSON.parse(returnData);
            
        for (var i = 0; i < 10; i++) {
        
            if (typeof result.items[i].title != "undefined" && typeof result.items[i].content.freetext.notes != "undefined") {
                var cardTitle = result.items[i].title;
                var objectNotes = result.items[i].content.freetext.notes;
            } else {
                continue;
            }
            
            
            var imageObj = {
                smallImageUrl: result.items[i].content.descriptiveNonRepeating.online_media.media[0].thumbnail.replace(/http:/,'https:'),
                largeImageUrl:  result.items[i].content.descriptiveNonRepeating.online_media.media[0].content.replace(/http:/,'https:')
            };
            
            if (imageObj.smallImageUrl == null || imageObj.largeImageUrl == null) {
                continue;
            }
            
            var cardContent = "Object" + i +".";
            
            for (var note in objectNotes) {
            cardContent = cardContent + " " + objectNotes[note].content;
            //console.log("CardContent:" +  cardContent);
            }
            
            if (cardContent.length >= 50) {
                break;
            }

            } // select loop for best EDAN rec
            
            var formattedResponse = [cardTitle,cardContent,imageObj];
            
        console.log(JSON.stringify(result));

            
            //var items = result.items[0];

            //for (var myKey in items) {
            //    console.log("key:" + myKey + ", value:" + items[myKey]);
            //}

            
            //var resultabc = abc.rows[0];
            //console.log(JSON.stringify(result));
            //returnData = formattedResponse;
            callback(formattedResponse); // this will execute whatever function the caller defined, with one argument
        });
    });
    req.end();
}

function SelectEDANObj(response, callback) {
    
}

function GetSnapshot(myData, callback) {
    
    var snapshot_url = "newsdesk.si.edu";
    
    var options = {
        host: snapshot_url,
        port: 443,
        path: '/last-snapshot',
        method: 'GET',
    };
    
     var req = https.request(options, res => {
        res.setEncoding('utf8');
        
        var snapshotData = "";
        
        res.on('data', chunk => {
            snapshotData = snapshotData + chunk;
        });
        
        res.on('end', () => {
            var result = snapshotData;
            console.log(result);
            
            callback(snapshotData); // this will execute whatever function the caller defined, with one argument
        });
    });
    req.end();


}
