var express = require('express')
var bodyParser = require('body-parser')
var PAGE_ACCESS_TOKEN = 'EAACFDxaMx1kBAERF82ipsu2nB7gUa1oqf8t3zR6GDbmXtZCenFKx8wuyhPIXPiZCZB1t984VOl0LbguqMCzmgInP1IXlk4EMyJDTZAWg3C5gUYE0n9cBWvLYtLe3ASLVSmShSSifMcMcnNxuTTYLewiPBb0XyTqXtlnWi58gxQZDZD'
var the_request = require('request')

var app = express().use(bodyParser.json()); // creates express http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

app.post('/webhook', (req, res) => {  
 
  var body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Gets the message. entry.messaging is an array, but 
      // will only ever contain one message, so we get index 0
      var webhookEvent = entry.messaging[0];
      console.log(webhookEvent);

      var sender_psid = webhookEvent.sender.id
      console.log('Sender PSID: ' + sender_psid)

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhookEvent.message) {
        handleMessage(sender_psid, webhookEvent.message);        
      } else if (webhookEvent.postback) {
        handlePostback(sender_psid, webhookEvent.postback);
      }

    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

  // Your verify token. Should be a random string.
  var VERIFY_TOKEN = "<YOUR_VERIFY_TOKEN>"
    
  // Parse the query params
  var mode = req.query['hub.mode'];
  var token = req.query['hub.verify_token'];
  var challenge = req.query['hub.challenge'];
    
  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
  
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
});

// Handles messages events
function handleMessage(sender_psid, received_message) {
  var response

  // Check if the message contains text
  if (received_message.text) {    

    // Create the payload for a basic text message
    response = {
      "metadata": `You sent the message: "${received_message.text}". Now send me an image!\n\nTest Derajat: 30\xb0C . Test Ranging: 60\u201385\xb0F\n\nTest Requirements: Basic requirements\nAlmond grows best in Mediterranean climates with warm, dry summers and mild, wet winters. The optimal temperature for their growth is between 15 and 30\xb0C (60\u201385\xb0F) and the tree buds have a chilling requirement of between 300 and 600 hours below 7.2\xb0C (45\xb0F) to break dormancy. Almond trees will grow best when planted in deep, well-draining loam although they can withstand drought and grow in poor soils. The trees benefit from being planted in areas sheltered from frost and wind as trees bloom early and can therefore be susceptible to damage from late frosts. Trees will generally bear nuts after 3 to 4 years with the nut crop developing after blossom, in the fall. `
    }
  } else if (received_message.attachments) {
    var attachment_url = received_message.attachments[0].payload.url
    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "Is this the right picture?",
            "subtitle": "Tap a button to answer.",
            "image_url": attachment_url,
            "buttons": [
              {
                "type": "postback",
                "title": "Yes!",
                "payload": "yes",
              },
              {
                "type": "postback",
                "title": "No!",
                "payload": "no",
              }
            ],
          }]
        }
      }
    }
  }
  
  // Sends the response message
  callSendAPI(sender_psid, response);
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {

}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  the_request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  }); 
}
