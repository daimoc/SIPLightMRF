
var express = require('express');
var app = express();
var sip = require('./sipstack.js');
var uuid = require('uuid/v1');
var calls = {};

sip.init();

app.get('/sip/invite', function (req, res) {
		var to = req.query.to;
		var from = req.query.from;
		var logoUrl = req.query.logourl;
		var recordFormat = req.query.recordformat;
		var callid = uuid();
		console.log("Sip invite "+ to +" "+ from +" "+ logoUrl + " " + recordFormat);

		var response = {};
		response.callid=callid;
		response.recordUrl="/ff/ff/"+callid+"."+recordFormat;




		res.send(JSON.stringify(response));
});

function createSipCall(sessionId,from,to,rtpEndpoint,callback){
      rtpEndpoint.generateOffer(function(error, sdpOffer) {
        var modSdp =  replace_ip(sdpOffer);
        sip.invite (sessionId,from,to,modSdp,function (error,remoteSdp){
          if (error){
            return callback(error);
          }
          rtpEndpoint.processAnswer(remoteSdp,function(error){
            if (error){
              return callback(error);
            }
            // Insert EnCall timeout
            setTimeout(function(){  sip.bye(sessionId);stopFromBye(sessionId);},config.maxCallSeconds*1000);
            return callback(null);
          });
        });
      });
}

function generateLocalSDP(){

}

app.get('/sip/bye', function (req, res) {
		var callId = req.query.callid;
		console.log("Sip bye "+ callId);
		res.send("OK");
});


function stop(sessionId) {
    sip.bye(sessionId);
    if (sessions[sessionId]) {
        var pipeline = sessions[sessionId].pipeline;
        if (pipeline != undefined){
          console.info('Releasing pipeline');
          pipeline.release();
        }
        delete sessions[sessionId];
        delete candidatesQueue[sessionId];
    }
}

var server     =    app.listen(3000,function(){
    console.log("We have started our server on port 3000");
});
