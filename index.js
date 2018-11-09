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

  unit  = req.body.queryResult.parameters['unit'];  // take out the unit, ligh e.g.
  state = req.body.queryResult.parameters['state']; // retrieve the state of the light.
  cmd   = req.body.queryResult.parameters['cmd'];   // retrieve the wanted command intent from Dialogflow.
  area = req.body.queryResult.parameters['area'];
  
  var key = '8GC28PFNII0B3951';

  // if (area == 'living room') {
  //   var key = '8GC28PFNII0B3951';
  // };
  //-----------------------------Light Control-----------------------------//

  //Status of lights
  if (cmd == 'state' && unit == 'light') {
      getStateOfLight().then((output) => {
        if (output == 0) {
         res.json({ 'fulfillmentText': 'The light is turned off' }); // Return the state of light
        }
        else {
          res.json({ 'fulfillmentText': 'The light is turned on' }); // Return the state of the light
        };
          
      }).catch(() => {
        res.json({ 'fulfillmentText': 'something is wrong' });
      });
  }; 

  //Switch on/off lights
  if (cmd == 'turn' && unit == 'light') {
    
    if (state == 'on') {
      getStateOfLight().then((output) => {                             //Checks the output of getStateOfLight to see if it is already on
        if (output == 1) {
         res.json({ 'fulfillmentText': 'The lights are already on' }); // If the lights are already on
        } else {
          turnLightON().then((output) => {                              //Else it turns on the lights.
            res.json({ 'fulfillmentText': output });
          });
        };
      });
    };
    if (state == 'off') {
      getStateOfLight().then((output) => {                              //Checks the output of getStateOfLight to see if it is already off
        if (output == 0) {
         res.json({ 'fulfillmentText': 'The lights are already off' }); // If the lights are already off
        } else {
          turnLightOFF().then((output) => {                             //Else it turns off the lights
            res.json({ 'fulfillmentText': output });
          });
        };
      });
    };

  };


});



restService.listen(process.env.PORT || 8000, function() {
  console.log("Server up and listening");
});




function turnLightON () {
    return new Promise((resolve, reject) => {
    // Create the path for the HTTP request to get the weather
    //let path = '/update?api_key=116UAXMQP1O8EYZ3&field1=1';
    // Make the HTTP request
  
    https.get('https://api.thingspeak.com/update?api_key='+key+'&field1=1', (res) => {
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

function turnLightOFF () {
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
        let output = temp;

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