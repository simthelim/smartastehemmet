'use strict';

const https = require('https');
const express = require("express");
const bodyParser = require("body-parser");

const restService = express();

const host = 'api.thingspeak.com';

var unit;
var state;
var cmd;
restService.use(
  bodyParser.urlencoded({
    extended: true
  })
);

restService.use(bodyParser.json());

restService.post("/webhook", function(req, res) {

 	unit 	= req.body.queryResult.parameters['unit']; 	// take out the unit, ligh e.g.
 	state 	= req.body.queryResult.parameters['state']; // retrieve the state of the light.
 	cmd		= req.body.queryResult.parameters['cmd'];	// retrieve the wanted command intent from Dialogflow.
 	
 	if (cmd == 'state') {
		getStateOfLight().then((output) => {
      if (getStateOfLight() == 0) {
       res.json({ 'fulfillmentText': 'The light is turned off' }); // Return the results of the weather API to Dialogflow
      };
      else {
        res.json({ 'fulfillmentText': 'The light is turned on' }); // Return the results of the weather API to Dialogflow
      };
    		
  	}).catch(() => {
      res.json({ 'fulfillmentText': 'something is wrong' });
  	});
 	};
});
//  if (cmd == turn) {
//  if (unit == 'light' && state == 'on'){
// 	 callThingApiON().then((output) => {
//     res.json({ 'fulfillmentText': output }); // Return the results of the weather API to Dialogflow
//   }).catch(() => {
//     res.json({ 'fulfillmentText': 'something is wrong' });
//   });
//  }
//  else
//  	{
// 	callThingApiOFF().then((output) => {
//     res.json({ 'fulfillmentText': output }); // Return the results of the weather API to Dialogflow
//   	}).catch(() => {
//     res.json({ 'fulfillmentText': 'something is wrong' });
//   	}); 
//  	}
// });
//}
restService.listen(process.env.PORT || 8000, function() {
  console.log("Server up and listening");
});




function LightON () {
    return new Promise((resolve, reject) => {
    // Create the path for the HTTP request to get the weather
    //let path = '/update?api_key=116UAXMQP1O8EYZ3&field1=1';
    // Make the HTTP request
	
    https.get('https://api.thingspeak.com/update?api_key=8GC28PFNII0B3951&field1=1', (res) => {
      let body = ''; // var to store the response chunks
      res.on('data', (d) => { body += d; }); // store each response chunk
      res.on('end', () => {
        // After all the data has been received parse the JSON for desired data
        //let response = JSON.parse(body);
        //let last = response['field1'];
        // Create response
        let output = 'The light is now turned on';

        // Resolve the promise with the output text
        console.log(output);
        resolve(output);
      });
      res.on('error', (error) => {
        console.log('Error calling API')
        reject();
      });
    });
  });
}

function callThingApiOFF () {
    return new Promise((resolve, reject) => {
    // Create the path for the HTTP request to get the weather
    //let path = '/update?api_key=116UAXMQP1O8EYZ3&field1=0';
    // Make the HTTP request
	
    https.get('https://api.thingspeak.com/update?api_key=8GC28PFNII0B3951&field1=0', (res) => {
      let body = ''; // var to store the response chunks
      res.on('data', (d) => { body += d; }); // store each response chunk
      res.on('end', () => {
        // After all the data has been received parse the JSON for desired data
        //let response = JSON.parse(body);
        //let last = response['field1'];
        // Create response
        let output = 'The light is now turned off';

        // Resolve the promise with the output text
        console.log(output);
        resolve(output);
      });
      res.on('error', (error) => {
        console.log('Error calling API')
        reject();
      });
    });
  });
}

function getStateOfLight () {
    return new Promise((resolve, reject) => {
    // Create the path for the HTTP request to get the weather
    //let path = '/update?api_key=116UAXMQP1O8EYZ3&field1=1';
    // Make the HTTP request
	
    https.get('https://api.thingspeak.com/channels/619204/feeds.json?results=1', (res) => {
      let body = ''; // var to store the response chunks
      res.on('data', (d) => { body += d; }); // store each response chunk
      res.on('end', () => {
        // After all the data has been received parse the JSON for desired data
        let response = JSON.parse(body);
        let temp = response.feeds[0].field1;
        // Create response
        var output = temp;

        // Resolve the promise with the output text
        console.log(output);
        resolve(output);
      });
      res.on('error', (error) => {
        console.log('Error calling API')
        reject();
      });
    });
  });
}
