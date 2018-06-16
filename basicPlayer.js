var drachtio = require('drachtio');
var appSip = drachtio() ;
var fs = require('fs') ;
var argv = require('minimist')(process.argv.slice(2));
var debug = require('debug')('basic') ;
var transform = require('sdp-transform');
var sipServerConnected = false;
var kill  = require('tree-kill');

var myFakeSDP = "v=0\r\n\
o=sipGWNode 786 3205 IN IP4 192.168.0.17\r\n\
s=Talk\r\n\
c=IN IP4 192.168.0.17\r\n\
t=0 0\r\n\
m=audio 7078 RTP/AVP 97 0 8 101 99 100\r\n\
a=rtpmap:97 opus/48000/2\r\n\
a=fmtp:97 sprop-stereo=1\r\n\
a=rtpmap:101 telephone-event/48000\r\n\
a=rtpmap:99 telephone-event/16000\r\n\
a=rtpmap:100 telephone-event/8000\r\n\
m=video 9078 RTP/AVP 96\r\n\
a=rtpmap:96 H264/90000\r\n\
";

var myFakeSDP2 = "v=0\n\
o=sipGWNode 786 3205 IN IP4 192.168.0.17\n\
s=Talk\n\
c=IN IP4 192.168.0.17\n\
t=0 0\n\
m=audio 7078 RTP/AVP 97 0 8 101 99 100\n\
a=rtpmap:97 opus/48000/2\n\
a=fmtp:97 sprop-stereo=1\n\
a=rtpmap:101 telephone-event/48000\n\
a=rtpmap:99 telephone-event/16000\n\
a=rtpmap:100 telephone-event/8000\n\
m=video 9078 RTP/AVP 96\n\
a=rtpmap:96 H264/90000\n\
";

var sessions = {};

appSip.use('invite', function( req, res, next){
	debug('hey Im in middleware!') ;
	next() ;
}) ;
appSip.use('invite', function( req, res, next){
	debug('hey Im in middleware!') ;
	throw new Error('whoopse!') ;
}) ;
appSip.use('invite', function( req, res){
	res.send(486) ;
}) ;
appSip.use('invite', function( err, req, res, next){
	debug('got eror: ', err) ;
	res.send(500, 'My bad') ;
}) ;


appSip.use('bye', function( req, res){
	console.log('BYE recieved: %s', JSON.stringify(res) ) ;
	var index = res.msg.headers['call-id'];
	console.log('BYE recieved: %s index %s' , JSON.stringify(res),index ) ;
	//	console.log('Sessions : %s', JSON.stringify(sessions) ) ;

	var child = sessions[index];
	if (child != undefined){
		  //kill(child.pid);
			child.kill();
	}
	res.send(200) ;
}) ;


appSip.connect({
	host: '127.0.0.1',
	port: 9022,
	secret: 'cymru',
	methods: ['invite','bye','option'],
//	set: {
//		'api logger': fs.createWriteStream(argv.apiTrace)
//	}
},
function(err, hostport){
    if( err ) throw err ;
		console.log("Connected to SIP server");
		sipServerConnected = true;
	}
) ;

/*-----------------------*/
var spawn = require('child_process').spawn;
var express = require('express');
var app = express();
app.get('/invite', function (req, res) {
		var sipDest = req.query.to;
		var httpRes =res;
		console.log("Send invite to "+sipDest);
		//res.send('Send invite to '+sipDest);
		if (sipServerConnected){
			appSip.request({
            uri: 'sip:'+sipDest,
            method: 'INVITE',
            headers: {
                'User-Agent': 'dracht.io'
            },
						body: myFakeSDP
        },
				function( err, req ){
		 			if( err ) {
						 console.log('Error '+ err ) ;
						 throw err;
					 }
		 			console.log('sent request: %s', JSON.stringify(req) ) ;

		 			req.on('response', function(res,ack){
			 			console.log('received response with status: %s', res.status) ;
						console.log('recieved response: %s', JSON.stringify(res) ) ;

						if( res.status >= 200 ) {
							var remoteSdpStr = res.body;
							console.log('recieved response: %s', remoteSdpStr);
							var remoteSdpJson = transform.parse(remoteSdpStr);

							console.log('recieved response: %s',remoteSdpJson);

							console.log('remote host IP : %s', getConnectionIp(remoteSdpJson)) ;
							console.log('remote audio port : %s', getPortByType(remoteSdpJson,"audio")) ;
							console.log('remote video port : %s', getPortByType(remoteSdpJson,"video")) ;

							var remoteAudio =   "rtp://"+getConnectionIp(remoteSdpJson)+":"+getPortByType(remoteSdpJson,"audio")
							var remoteVideo =   "rtp://"+getConnectionIp(remoteSdpJson)+":"+getPortByType(remoteSdpJson,"video")

							var child = spawn('./run_ffmpeg.sh', [
								myFakeSDP2,
								remoteAudio,
								remoteVideo
							]);
							console.log(req.msg.headers);
							var callId = req.msg.headers["call-id"];
							httpRes.send(callId);
							sessions[callId]=child;

							//console.log('Sessions : %s', JSON.stringify(sessions) ) ;

							child.stdout.on('data', (data) => {
							  console.log(`stdout: ${data}`);
							});

							child.stderr.on('data', (data) => {
							  console.log(`stderr: ${data}`);
							});

							child.on('close', (code) => {
							  console.log(`child process exited with code ${code}`);
							});

							ack() ;
						}
				}) ;
			}
		);
	}
});

function getConnectionIp (sdpJson){
	return  sdpJson.connection.ip;
}


function getPortByType (sdpJson,type){
	var media = sdpJson.media;
	for (var i = 0 ; i < media.length ; i++){
		if (media[i].type == type){
			return media[i].port;
		}
	}
	return 0;
}

app.get('/bye', function (req, res) {
		var sipDest = req.query.callId;
		var child = sessions[callId];
		if(child!=undefined){
			kill(child.pid);
		}
});

var server = app.listen(3000,function(){
    console.log("We have started our server on port 3000");
});
