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
var regulate;
var speed;
var spd;
var text;

var volume;
var vol;
var controlkey;
var statekey;
var brokenkey;
var broken;


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
  area  = req.body.queryResult.parameters['area'];  // retrieve the wanted area of the device.
  percentage = req.body.queryResult.parameters['percentage']; // retrieve the percentage for the fan speed.
  regulate = req.body.queryResult.parameters['regulate']; // retrieve the regulate parameter.
  
  //Get the API-key that relates to the correct unit in the smart home
  if (area == 'living room') {
    controlkey = 'VCR3Z71LGJYQ9MSO';
    statekey = '625581';
    brokenkey = '625582';
  };

  if (area == 'kitchen') {
    controlkey = 'NKLUZK54FJP8Q5QP';
    statekey = '622701';
    brokenkey = '625546';
  };
  
//------------------------------Fan control----------------------------//
if (unit == 'fan') {	
  	
    
	//Set fan speed
  if (cmd == 'set') {
    speed = percentage.replace( "%", ''); // Take away the %-sign from 'percentage'
    setFanSpeed().then((output) => {
      res.json({ 'fulfillmentText': output });
    });
  };

	if (cmd == 'state') {
    speed = percentage.replace( "%", ''); // Take away the %-sign from 'percentage'
    spd = Number(speed);
		getFanSpeed().then((output) => {
      spd += Number(output);
      text = String(spd);
			res.json({ 'fulfillmentText': text });
		});
	};  
 	//Increase/Decrease fan speed
 	if (regulate == 'increase'){
    speed = percentage.replace( "%", ''); // Take away the %-sign from 'percentage'
    spd = Number(speed);
 		getFanSpeed().then((outupt) => {
 			spd += Number(output);
 			if (spd > 100) {
 				spd = 100;
        speed = String(spd);
        setFanSpeed().then((fanSpeed) => {
          res.json({ 'fulfillmentText': fanSpeed });
        });
 			} 
      else {
        speed = String(spd);
        setFanSpeed().then((fanSpeed) => {
          res.json({ 'fulfillmentText': fanSpeed });
        });
      }
    });
 	};


 	if (regulate == 'decrease'){

 	};

};
//-------------------------------Temperature--------------------------------------//
if(cmd == 'temperature') {
	getTemperature().then((temp) => {
		res.json({ 'fulfillmentText': 'The temperature is ' +temp+ ' degree Celsius'})
	})
};

  //-----------------------------Light Control------------------------------------//

  //Status of lights
  if (cmd == 'state' && unit == 'light') {
      getStateOfLight().then((output) => {					//Get the state of the light channel.
        isLightBroken().then((broken) =>{						//Get the state of the actual light channel to see if it is broken.
        if (output == 0 && broken == 0) {						//If both are 0 the light should be turned off.
          res.json({ 'fulfillmentText': 'The '+area+' light is turned off' }); //Return the state of the light.
        }
        else if (output == 1 && broken == 1) {																//If both are 1 the light should be turned on.
          res.json({ 'fulfillmentText': 'The '+area+' light is turned on' }); //Return the state of the light.
        }
        else {																																			//Else if the channels do not have the 
        	res.json({ 'fulfillmentText': 'The '+area+' light seems to be broken' });	//same channel status the light is broken.
        };
      }).catch(() => {
        res.json({ 'fulfillmentText': 'something is wrong' });											//Catch the reject error from the promise.
      });
    });
  }; 

  //Switch on/off lights
  if (cmd == 'turn' && unit == 'light') {

    if (state == 'on') {														//If state == on we want to turn on the lights.
      getStateOfLight().then((output) => {          //Get the state of the light channel.
        isLightBroken().then((broken) =>{						//Get the state of the actual light channel to see if it's broken.
        if (output == 1 && broken == 1) {						//Both channels == 1, the lights are already on.
         res.json({ 'fulfillmentText': 'The '+area+' lights are already on' }); //Output if the lights are already on
        }
        else if(output == 0 && broken == 1){				//If the channel states are different the lights are broken.
        	res.json({ 'fulfillmentText': 'The '+area+' light seems to be broken' });
        }
        else if(output == 1 && broken == 0){
        	res.json({ 'fulfillmentText': 'The '+area+' light seems to be broken' });
        }
        else {
          turnLightON().then((output) => {            //Else if the channels are not both == 1 or different
            res.json({ 'fulfillmentText': output });	//they should both be zero and we can therofore turn on the lights.
          });
        };
        });
      });
    };
    if (state == 'off') {														//If state == on we want to turn off the lights.
      getStateOfLight().then((output) => {          //Get the state of the light channel.
        isLightBroken().then((broken) =>{						//Get the state of the actual light channel to see if it's broken.
        if (output == 0 && broken == 0) {						//Both channels == 0, the lights are already off.
         res.json({ 'fulfillmentText': 'The '+area+' lights are already off' }); //Output if the lights are already off.
        }
        else if(output == 0 && broken == 1){				//If the channel states are different the lights are broken.
        	res.json({ 'fulfillmentText': 'The '+area+' light seems to be broken' });
        }
        else if(output == 1 && broken == 0){
        	res.json({ 'fulfillmentText': 'The '+area+' light seems to be broken' });
        }
         else {
          turnLightOFF().then((output) => {           //Else if the channels are not both == 0 or different
            res.json({ 'fulfillmentText': output });	//they should both be 1 and we can therofore turn off the lights.
          });
        };
      });
      });
    };

  };


});



restService.listen(process.env.PORT || 8000, function() {
  console.log("Server up and listening");
});

function getTemperature () {
    return new Promise((resolve, reject) => {
    // Make the HTTP request  
    https.get('https://api.thingspeak.com/channels/625586/feeds.json?results=1', (res) => {
      let body = ''; // var to store the response chunks
      res.on('data', (d) => { body += d; }); // store each response chunk
      res.on('end', () => {
        // After all the data has been received parse the JSON for desired data
        // Create response
        let response = JSON.parse(body);
        let output = response.feeds[0].field1;
        //let output = temp;
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

function setFanSpeed () {
    return new Promise((resolve, reject) => {
    // Make the HTTP request  
    https.get('https://api.thingspeak.com/update?api_key=8YUPDMQJS9LFKDM2&field1='+speed, (res) => {
      let body = ''; // var to store the response chunks
      res.on('data', (d) => { body += d; }); // store each response chunk
      res.on('end', () => {
        // After all the data has been received parse the JSON for desired data
        // Create response
        let output = 'The fan is now at '+speed+' percent of maximum speed.';
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

function getFanSpeed () {
    return new Promise((resolve, reject) => {
    // Make the HTTP request  
    https.get('https://api.thingspeak.com/channels/624654/feeds.json?results=1', (res) => {
      let body = ''; // var to store the response chunks
      res.on('data', (d) => { body += d; }); // store each response chunk
      res.on('end', () => {
        // After all the data has been received parse the JSON for desired data
        // Create response
        let response = JSON.parse(body);
        let output = response.feeds[0].field1;        
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
    https.get('https://api.thingspeak.com/update?api_key='+controlkey+'&field1=1', (res) => {	// Make the HTTP request 
      let body = ''; // var to store the response chunks
      res.on('data', (d) => { body += d; }); // store each response chunk
      res.on('end', () => {        
        let output;													// Create response
        if (body == '0') {									//The http request did not change the thingspeak channel
          output = 'The light did not turn on, please try again in a moment.';
        } else {
          output = 'Turning on the '+area+' light.';
        };
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
    // Make the HTTP request  
    https.get('https://api.thingspeak.com/update?api_key='+controlkey+'&field1=0', (res) => {
      let body = ''; // var to store the response chunks
      res.on('data', (d) => { body += d; }); // store each response chunk
      res.on('end', () => {
        // After all the data has been received parse the JSON for desired data
        let output;
        if (body == '0') {
          output = 'The light did not turn off, please try again in a moment.';
        } else {
          output = 'Turning off the  '+area+' light.';
        };
        // Create response
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
    // Make the HTTP request  
    https.get('https://api.thingspeak.com/channels/'+statekey+'/feeds.json?results=1', (res) => {
      let body = ''; // var to store the response chunks
      res.on('data', (d) => { body += d; }); // store each response chunk
      res.on('end', () => {
        // After all the data has been received parse the JSON for desired data
        let response = JSON.parse(body);
        // Create response
        let output = response.feeds[0].field1;
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

function isLightBroken () {
    return new Promise((resolve, reject) => {
    // Make the HTTP request  
    https.get('https://api.thingspeak.com/channels/'+brokenkey+'/feeds.json?results=1', (res) => {
      let body = ''; // var to store the response chunks
      res.on('data', (d) => { body += d; }); // store each response chunk
      res.on('end', () => {
        // After all the data has been received parse the JSON for desired data
        // Create response
        let response = JSON.parse(body);
        let output = response.feeds[0].field1;        
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