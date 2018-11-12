'use strict';

const https = require('https');
const express = require("express");
const bodyParser = require("body-parser");

const restService = express();

const host = 'api.thingspeak.com';

var unit;
var state;
var cmd;
var area;
var percentage;

var volume;
var vol;
var controlkey;
var statekey;


restService.use(
  bodyParser.urlencoded({
    extended: true
  })
);

restService.use(bodyParser.json());

restService.post("/webhook", function(req, res) {

  unit  = req.body.queryResult.parameters['unit'];  // take out the unit, light e.g.
  state = req.body.queryResult.parameters['state']; // retrieve the state of the light.
  cmd   = req.body.queryResult.parameters['cmd'];   // retrieve the wanted command intent from Dialogflow.
  area  = req.body.queryResult.parameters['area'];  // retrieve the wanted area of the device
  percentage = req.body.queryResult.parameters['percentage']; // retrieve the percentage for the volume
  
  //Get the API-key that relates to the correct unit
  if (area == 'living room') {
    controlkey = '8GC28PFNII0B3951';
    statekey = '619204';
  };

  if (area == 'kitchen') {
    controlkey = 'NKLUZK54FJP8Q5QP';
    statekey = '622701';
  };
  // if (unit == 'speaker') {
  //   controlkey = '';
  //   statekey = '';
  // };
  
//------------------------------Speaker volume control----------------------------//
  //Set volume of speaker
  if (percentage !== null) {
    volume = percentage.replace( /^\D+/g, ''); // replace all leading non-digits with nothing
    vol = volume.toString();
  };

  if (cmd == 'set' && unit == 'speaker') {
    setSpeakerVolume().then((output) => {
      res.json({ 'fulfillmentText': output });
    });
  };




  //-----------------------------Light Control------------------------------------//

  //Status of lights
  if (cmd == 'state' && unit == 'light') {
      getStateOfLight().then((output) => {
        if (output == 0) {
         res.json({ 'fulfillmentText': 'The '+area+' light is turned off' }); // Return the state of light
        }
        else {
          res.json({ 'fulfillmentText': 'The '+area+' light is turned on' }); // Return the state of the light
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
         res.json({ 'fulfillmentText': 'The '+area+' lights are already on' }); // If the lights are already on
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
         res.json({ 'fulfillmentText': 'The '+area+' lights are already off' }); // If the lights are already off
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


function setSpeakerVolume () {
    return new Promise((resolve, reject) => {
    // Create the path for the HTTP request to get the weather
    //let path = '/update?api_key=116UAXMQP1O8EYZ3&field1=1';
    // Make the HTTP request
  
    https.get('https://api.thingspeak.com/update?api_key=8YUPDMQJS9LFKDM2&field1='+vol, (res) => {
      let body = ''; // var to store the response chunks
      res.on('data', (d) => { body += d; }); // store each response chunk
      res.on('end', () => {
        // After all the data has been received parse the JSON for desired data
        //let response = JSON.parse(body);
        //let last = response['field1'];
        // Create response
        let output = 'The speaker is now on '+vol+' percent.';

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

function getSpeakerVolume () {
    return new Promise((resolve, reject) => {
    // Create the path for the HTTP request to get the weather
    //let path = '/update?api_key=116UAXMQP1O8EYZ3&field1=1';
    // Make the HTTP request
  
    https.get('https://api.thingspeak.com/channels/624654/feeds.json?results=2', (res) => {
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

function turnLightON () {
    return new Promise((resolve, reject) => {
    // Create the path for the HTTP request to get the weather
    //let path = '/update?api_key=116UAXMQP1O8EYZ3&field1=1';
    // Make the HTTP request
  
    https.get('https://api.thingspeak.com/update?api_key='+controlkey+'&field1=1', (res) => {
      let body = ''; // var to store the response chunks
      res.on('data', (d) => { body += d; }); // store each response chunk
      res.on('end', () => {
        // After all the data has been received parse the JSON for desired data
        //let response = JSON.parse(body);
        //let last = response['field1'];
        // Create response
        let output = 'The '+area+' light is now turned on';

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
  
    https.get('https://api.thingspeak.com/update?api_key='+controlkey+'&field1=0', (res) => {
      let body = ''; // var to store the response chunks
      res.on('data', (d) => { body += d; }); // store each response chunk
      res.on('end', () => {
        // After all the data has been received parse the JSON for desired data
        //let response = JSON.parse(body);
        //let last = response['field1'];
        // Create response
        let output = 'The '+area+' light is now turned off';

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
  
    https.get('https://api.thingspeak.com/channels/'+statekey+'/feeds.json?results=1', (res) => {
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