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
  area 	= req.body.queryResult.parameters['area']	// retrieve the area of the unit
  

  //-----------------------------Living Room Light Control-----------------------------//
  if (area == 'living room') {
	  //Status of lights
	  if (cmd == 'state' && unit == 'light') {
	      getStateOfLivingLight().then((output) => {
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
	      getStateOfLivingLight().then((output) => {                             //Checks the output of getStateOfLight to see if it is already on
	        if (output == 1) {
	         res.json({ 'fulfillmentText': 'The lights are already on' }); // If the lights are already on
	        } else {
	          turnLivingLightON().then((output) => {                              //Else it turns on the lights.
	            res.json({ 'fulfillmentText': output });
	          });
	        };
	      });
	    };
	    if (state == 'off') {
	      getStateOfLivingLight().then((output) => {                              //Checks the output of getStateOfLight to see if it is already off
	        if (output == 0) {
	         res.json({ 'fulfillmentText': 'The lights are already off' }); // If the lights are already off
	        } else {
	          turnLivingLightOFF().then((output) => {                             //Else it turns off the lights
	            res.json({ 'fulfillmentText': output });
	          });
	        };
	      });
	    };

	  };
	};


  //-----------------------------Kitchen Light Control-----------------------------//
 //  if (area == 'kitchen') {
	//   //Status of lights
	//   if (cmd == 'state' && unit == 'light') {
	//       getStateOfKitchenLight().then((output) => {
	//         if (output == 0) {
	//          res.json({ 'fulfillmentText': 'The kitchen light is turned off' }); // Return the state of light
	//         }
	//         else {
	//           res.json({ 'fulfillmentText': 'The kitchen light is turned on' }); // Return the state of the light
	//         };
	          
	//       }).catch(() => {
	//         res.json({ 'fulfillmentText': 'something is wrong' });
	//       });
	//   }; 

	//   //Switch on/off lights
	//   if (cmd == 'turn' && unit == 'light') {
	    
	//     if (state == 'on') {
	//       getStateOfKitchenLight().then((output) => {                             //Checks the output of getStateOfLight to see if it is already on
	//         if (output == 1) {
	//          res.json({ 'fulfillmentText': 'The kitchen lights are already on' }); // If the lights are already on
	//         } else {
	//           turnKitchenLightON().then((output) => {                              //Else it turns on the lights.
	//             res.json({ 'fulfillmentText': output });
	//           });
	//         };
	//       });
	//     };
	//     if (state == 'off') {
	//       getStateOfKitchenLight().then((output) => {                              //Checks the output of getStateOfLight to see if it is already off
	//         if (output == 0) {
	//          res.json({ 'fulfillmentText': 'The lights are already off' }); // If the lights are already off
	//         } else {
	//           turnKitchenLightOFF().then((output) => {                             //Else it turns off the lights
	//             res.json({ 'fulfillmentText': output });
	//           });
	//         };
	//       });
	//     };

	//   	};
	// };



}); //end off rest.service



restService.listen(process.env.PORT || 8000, function() {
  console.log("Server up and listening");
});



//----------------------------Living Room Light------------------------------//
function turnLivingLightON () {
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
        let output = 'The living room light is now turned on';

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

function turnLivingLightOFF () {
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

function getStateOLivingfLight () {
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

//----------------------------Kitchen Light------------------------------//
// function turnKitchenLightON () {
//     return new Promise((resolve, reject) => {
//     // Create the path for the HTTP request to get the weather
//     //let path = '/update?api_key=116UAXMQP1O8EYZ3&field1=1';
//     // Make the HTTP request
  
//     https.get('https://api.thingspeak.com/update?api_key=8GC28PFNII0B3951&field1=1', (res) => {
//       let body = ''; // var to store the response chunks
//       res.on('data', (d) => { body += d; }); // store each response chunk
//       res.on('end', () => {
//         // After all the data has been received parse the JSON for desired data
//         //let response = JSON.parse(body);
//         //let last = response['field1'];
//         // Create response
//         let output = 'The light is now turned on';

//         // Resolve the promise with the output text
//         console.log(output);
//         resolve(output);
//       });
//       res.on('error', (error) => {
//         console.log('Error calling API')
//         reject();
//       });
//     });
//   });
// }

// function turnKitchenLightOFF () {
//     return new Promise((resolve, reject) => {
//     // Create the path for the HTTP request to get the weather
//     //let path = '/update?api_key=116UAXMQP1O8EYZ3&field1=0';
//     // Make the HTTP request
  
//     https.get('https://api.thingspeak.com/update?api_key=8GC28PFNII0B3951&field1=0', (res) => {
//       let body = ''; // var to store the response chunks
//       res.on('data', (d) => { body += d; }); // store each response chunk
//       res.on('end', () => {
//         // After all the data has been received parse the JSON for desired data
//         //let response = JSON.parse(body);
//         //let last = response['field1'];
//         // Create response
//         let output = 'The light is now turned off';

//         // Resolve the promise with the output text
//         console.log(output);
//         resolve(output);
//       });
//       res.on('error', (error) => {
//         console.log('Error calling API')
//         reject();
//       });
//     });
//   });
// }

// function getStateOfKitchenLight () {
//     return new Promise((resolve, reject) => {
//     // Create the path for the HTTP request to get the weather
//     //let path = '/update?api_key=116UAXMQP1O8EYZ3&field1=1';
//     // Make the HTTP request
  
//     https.get('https://api.thingspeak.com/channels/619204/feeds.json?results=1', (res) => {
//       let body = ''; // var to store the response chunks
//       res.on('data', (d) => { body += d; }); // store each response chunk
//       res.on('end', () => {
//         // After all the data has been received parse the JSON for desired data
//         let response = JSON.parse(body);
//         let temp = response.feeds[0].field1;
//         // Create response
//         let output = temp;

//         // Resolve the promise with the output text
//         console.log(output);
//         resolve(output);
//       });
//       res.on('error', (error) => {
//         console.log('Error calling API')
//         reject();
//       });
//     });
//   });
// }
