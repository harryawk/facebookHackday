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
      var webhookEvent = entry.messaging instanceof Array ? entry.messaging[0] : entry.messaging;
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
    temp = received_message.text.toLowerCase();
    if (temp == 'halo' || temp == 'hi' || temp == "hai" || temp == "halo tania") {
      response = {
        'attachment': {
          'type': 'template',
          'payload': {
            'template_type': 'generic',
            'elements': [
              {
                'title': 'Halo! Ada yang bisa Tania bantu?',
                'buttons': [
                  {
                    'type': 'postback',
                    'payload': 'baca',
                    'title': 'Baca'
                  },
                  {
                    'type': 'postback',
                    'payload': 'identifikasi',
                    'title': 'Identifikasi'
                  }
                ]
              }
            ]
          }
        }
      }
    } else if (received_message.text.toLowerCase() == 'baca') {
      // var the_text = received_message.text

      
      response = {
        'text': 'Mau baca tentang tanaman apa?',
        'quick_replies': [
          {
            'content_type': 'text',
            'title': 'Almond',
            'payload': 'almond',
          },
          {
            'content_type': 'text',
            'title': 'Alfalfa',
            'payload': 'alfalfa'
          },
          {
            'content_type': 'text',
            'title': 'Aloe vera',
            'payload': 'aloe-vera'
          },
          {
            'content_type': 'text',
            'title': 'Tomato',
            'payload': 'tomat'
          }, 
          {
            'content_type': 'text',
            'title': 'Banana',
            'payload': 'pisang'
          },
          {
            'content_type': 'text',
            'title': 'Rice',
            'payload': 'padi'
          }
        ]
      }
    } else if (received_message.text == 'Almond' || received_message.text == 'Aloe vera' || received_message.text == 'Alfalfa' || received_message.text == 'Tomato' || received_message.text == 'Banana' || received_message.text == 'Rice') {
      var tanaman = require('./model/tanaman')

      tanaman.model.where({nama_tanaman: received_message.text}).fetch().then((model) => {
        if (model) {
          var result = model.toJSON()['deskripsi_tanaman']
          var tanaman_id = model.toJSON()['id']
          
          response = {
            'attachment': {
              'type': 'template',
              'payload': {
                'template_type': 'generic',
                'elements': [
                  {
                    'title': 'Tentang ' + received_message.text,
                    'buttons': [
                      {
                        'type': 'web_url',
                        'url': 'https://fbhackday.herokuapp.com/propagasi/' + tanaman_id,
                        'title': 'Cara mengembang-biakan',
                        'messenger_extensions': true,
                        'fallback_url': 'https://fbhackday.herokuapp.com/propagasi/' + tanaman_id
                      },
                      {
                        'type': 'web_url',
                        'url': 'https://fbhackday.herokuapp.com/deskripsi/' + tanaman_id,
                        'title': 'Deskripsi',
                        'messenger_extensions': true,
                        'fallback_url': 'https://fbhackday.herokuapp.com/deskripsi/' + tanaman_id
                      },
                      {
                        'type': 'web_url',
                        'url': 'https://fbhackday.herokuapp.com/manfaat/' + tanaman_id,
                        'title': 'Manfaat',
                        'messenger_extensions': true,
                        'fallback_url': 'https://fbhackday.herokuapp.com/manfaat/' + tanaman_id
                      }
                    ]
                  }
                ]
              }
            }
          }
          callSendAPI(sender_psid, response)
        }
      })
      return; 
    } else if (received_message.text.toLowerCase() == 'identifikasi')  {
      response = {
        'text': 'Silakan kirim gambar tanamannya ya...'
      }
    } else {
      
      // Create the payload for a basic text message
      var basic_requirements = 'Test Requirements: Basic requirements\nAlmond grows best in Mediterranean climates with warm, dry summers and mild, wet winters. The optimal temperature for their growth is between 15 and 30\xb0C (60\u201385\xb0F) and the tree buds have a chilling requirement of between 300 and 600 hours below 7.2\xb0C (45\xb0F) to break dormancy. '
      // response = {
      //   "text": `You sent the message: "${received_message.text}". Now send me an image!\n\nTest Derajat: 30\xb0C . Test Ranging: 60\u201385\xb0F\n\n"${basic_requirements}"`
      // }

      response = {
        'text': 'Wait..'
      }
      console.log('==================')
      console.log(received_message.text)
      console.log('==================')
    }
  } else if (received_message.attachments) {
    console.log(received_message.attachments[0].payload.url)
    var attachment_url = received_message.attachments[0].payload.url
    var mapping = {
      'c_4': {
        'tanaman_id': 22,
        'penyakit_id': 0
      },
      'c_3': {
        'tanaman_id': 7,
        'penyakit_id': 0
      },
      'c_12': {
        'tanaman_id': 72,
        'penyakit_id': 734
      },
      'c_8': {
        'tanaman_id': 53,
        'penyakit_id': 537
      },
      'c_15': {
        'tanaman_id': 103,
        'penyakit_id': 963
      },
      'c_11': {
        'tanaman_id': 72,
        'penyakit_id': 729
      },
      'c_24': {
        'tanaman_id': 134,
        'penyakit_id': 0
      },
      'c_10': {
        'tanaman_id': 53,
        'penyakit_id': 540
      },
      'c_5': {
        'tanaman_id': 37,
        'penyakit_id': 375
      },
      'c_25': {
        'tanaman_id': 136,
        'penyakit_id': 1301
      },
      'c_16': {
        'tanaman_id': 109,
        'penyakit_id': 1028
      },
      'c_18': {
        'tanaman_id': 114,
        'penyakit_id': 1084
      },
      'c_19': {
        'tanaman_id': 114,
        'penyakit_id': 0
      },
      'c_33': {
        'tanaman_id': 147,
        'penyakit_id': 1388
      },
      'c_28': {
        'tanaman_id': 147,
        'penyakit_id': 1391
      },
      'c_32': {
        'tanaman_id': 147,
        'penyakit_id': 1399
      },
      'c_34': {
        'tanaman_id': 147,
        'penyakit_id': 1403
      },
      'c_37': {
        'tanaman_id': 147,
        'penyakit_id': 0
      },
      'c_35': {
        'tanaman_id': 147,
        'penyakit_id': 0
      },
      'c_30': {
        'tanaman_id': 147,
        'penyakit_id': 1421
      }
    }

    console.log("=======attachment_url=======")
    console.log(attachment_url)
    console.log("=======attachment_url=======")
    if (!attachment_url) {
      return
    }
    the_request({
      'uri': 'https://c312774f.ngrok.io/drtania/api/v1/predict/',
      'method': 'POST',
      'json': {
        'img_url': attachment_url
      }
    }, (err, res, body) => {
      if (!err) {
        console.log("==========body==========")
        result = body
        console.log(body['class'])
        console.log("==========body==========")
        // var result = JSON.parse(body)
        // console.log("==========result==========")
        // console.log(result)
        // console.log("==========result==========")
        var penyakit = require('./model/penyakit')
        var table_penyakit_id
        var table_tanaman_id
        if (mapping[result['class']]['penyakit_id'] == 0) {

          response = {
            "attachment": {
              "type": "template",
              "payload": {
                "template_type": "generic",
                "elements": [{
                  "title": "Hasil analisis",
                  "subtitle": "Tanaman ini sehat",
                  "image_url": attachment_url
                }]
              }
            }
          }

          callSendAPI(sender_psid, response);
          return

        } else {
          table_penyakit_id = mapping[result['class']]['penyakit_id']
          table_tanaman_id = mapping[result['class']]['tanaman_id']
          console.log('============data============')
          console.log(table_penyakit_id)
          console.log(table_tanaman_id)
          console.log('============data============')
          penyakit.model.where({ id: table_penyakit_id }).fetch({ withRelated: ['tanaman'] }).then((model) => {
            if (model) {
              var penyakit_result = model.toJSON()
              response = {
                "attachment": {
                  "type": "template",
                  "payload": {
                    "template_type": "generic",
                    "elements": [{
                      "title": "Hasil analisis: " + penyakit_result['tanaman']['nama_tanaman'] + ' - ' + penyakit_result['nama_penyakit'],
                      "subtitle": "Tekan tombol di bawah untuk melihat hasilnya",
                      "image_url": attachment_url,
                      "buttons": [
                        {
                          "type": "web_url",
                          "title": "Gejala",
                          "url": "https://fbhackday.herokuapp.com/gejala/" + table_tanaman_id + '/' + table_penyakit_id,
                          "messenger_extensions": true,
                          "fallback_url": "https://fbhackday.herokuapp.com/gejala/" + table_tanaman_id + '/' + table_penyakit_id
                        },
                        {
                          "type": "web_url",
                          "title": "Cara Mengatasi",
                          "url": "https://fbhackday.herokuapp.com/penanganan/" + table_tanaman_id + '/' + table_penyakit_id,
                          "messenger_extensions": true,
                          "fallback_url": "https://fbhackday.herokuapp.com/penanganan/" + table_tanaman_id + '/' + table_penyakit_id
                        }
                      ],
                    }]
                  }
                }
              }

              callSendAPI(sender_psid, response);
            }
          })
          return
        }
      } else {
        console.error("Unable to send message:" + err);
      }
    })
    return;
  }

  // Sends the response message
  callSendAPI(sender_psid, response);
    
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
  let response;

  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  if (payload === 'yes') {
    response = { "text": "Thanks!" }
  } else if (payload === 'no') {
    response = { "text": "Oops, try sending another image." }
  } else if (payload == 'baca') {
    
    response = {
      'text': 'Mau baca tentang tanaman apa?',
      'quick_replies': [
        {
          'content_type': 'text',
          'title': 'Almond',
          'payload': 'almond'
        },
        {
          'content_type': 'text',
          'title': 'Alfalfa',
          'payload': 'alfalfa'
        },
        {
          'content_type': 'text',
          'title': 'Aloe vera',
          'payload': 'aloe-vera'
        }
      ]
    }
  } else if (payload == 'identifikasi') {
    response = {
      'text': 'Silakan kirim gambar tanamannya'
    }
  } 
  // else if (payload == 'alfalfa') {
  //   var tanaman = require('./model/tanaman')

  //   tanaman.model.where({ nama_tanaman: 'Alfalfa' }).fetch().then((model) => {
  //     if (model) {
  //       var result = model.toJSON()['deskripsi_tanaman']
  //       var tanaman_id = model.toJSON()['id']

  //       response = {
  //         'attachment': {
  //           'type': 'template',
  //           'payload': {
  //             'template_type': 'generic',
  //             'elements': [
  //               {
  //                 'title': 'Tentang ' + received_message.text,
  //                 'buttons': [
  //                   {
  //                     'type': 'web_url',
  //                     'url': 'https://fbhackday.herokuapp.com/propagasi/' + tanaman_id,
  //                     'title': 'Cara mengembang-biakan',
  //                     'messenger_extensions': true,
  //                     'fallback_url': 'https://fbhackday.herokuapp.com/propagasi/' + tanaman_id
  //                   },
  //                   {
  //                     'type': 'web_url',
  //                     'url': 'https://fbhackday.herokuapp.com/deskripsi/' + tanaman_id,
  //                     'title': 'Deskripsi',
  //                     'messenger_extensions': true,
  //                     'fallback_url': 'https://fbhackday.herokuapp.com/deskripsi/' + tanaman_id
  //                   },
  //                   {
  //                     'type': 'web_url',
  //                     'url': 'https://fbhackday.herokuapp.com/manfaat/' + tanaman_id,
  //                     'title': 'Manfaat',
  //                     'messenger_extensions': true,
  //                     'fallback_url': 'https://fbhackday.herokuapp.com/manfaat/' + tanaman_id
  //                   }
  //                 ]
  //               }
  //             ]
  //           }
  //         }
  //       }
  //       callSendAPI(sender_psid, response)
  //     }
  //   })
  //   return;
  // }
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
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

app.get('/get_info', (req, resp) => {
  
  var info_id = req.query.id

  the_request({
    'uri': 'http://scrapping-fbhack.herokuapp.com',
    'qs': {
      'id': info_id
    },
    'method': 'GET'
  }, (err, res, body) => {
    if (!err) {
      console.log('request sent!')
      the_data = JSON.parse(body)

      // resp.json(the_data)
      // return;
      var tanaman = require('./model/tanaman')
      var penyakit = require('./model/penyakit')
      var propagasi = require('./model/propagasi')
      var penanganan_table = require('./model/penanganan')

      var nama_tanaman = the_data['name']
      var deskripsi_tanaman = the_data['description']
      var manfaat_tanaman = the_data['uses']
      
      // need: tanaman_id
      var komentar_penyebab = the_data['result_comments'] != [] ? the_data['result_comments'] : 'Maaf, Tania gak punya datanya...'
      var penyebab_penyakit = the_data['result_cause'] != [] ? the_data['result_cause'] : 'Maaf, Tania gak punya datanya...'
      var gejala_penyakit = the_data['result_symptoms'] != [] ? the_data['result_symptoms'] : 'Maaf, Tania gak punya datanya...'
      var nama_penyakit = the_data['result_name'] != [] ? the_data['result_name'] : 'Maaf, Tania gak punya datanya...'
      
      // need: tanaman_id
      var data_propagasi = the_data['propagation']
      
      // need: penyakit_id
      var penanganan = the_data['result_management']
      
      var tanaman_id
      var penyakit_id
      new tanaman.model({nama_tanaman: nama_tanaman, deskripsi_tanaman: deskripsi_tanaman.toString('binary'), manfaat_tanaman: manfaat_tanaman.toString('binary')})
        .save().then((model) => {
          if (model) {
            // console.log(model.toJSON())
            // console.log(model.get('id'))
            // return
            tanaman_id = model.get('id')
            var coll = []
            // console.log(nama_penyakit.length)
            // return
            for (var i = 0; i < (nama_penyakit.length > 0 ? nama_penyakit.length - 1 : 1); i++) {
              console.log('test' + i)
              if (nama_penyakit.length > 0) {
                coll.push({tanaman_id: tanaman_id, nama_penyakit: nama_penyakit[i][0][0], gejala_penyakit: gejala_penyakit[i], penyebab_penyakit: penyebab_penyakit[i], komentar_penyebab: komentar_penyebab[i], penanganan_penyakit: penanganan[i] })
              } else {
                coll.push({ tanaman_id: tanaman_id, nama_penyakit: 'Maaf, Tania gak punya datanya', gejala_penyakit: 'Maaf, Tania gak punya datanya', penyebab_penyakit: 'Maaf, Tania gak punya datanya', komentar_penyebab: 'Maaf, Tania gak punya datanya', penanganan_penyakit: 'Maaf, Tania gak punya datanya'})
              }
            }
            console.log(coll)
            penyakit.model.collection(coll).invokeThen('save')
              .then((model) => {
                // if (model) {
                  // penyakit_id = model.get('id')
                  new propagasi.model({tanaman_id: tanaman_id, data_propagasi: data_propagasi})
                    .save().then((model) => {
                      if (model) {
                        resp.send('OK')
                      } // add else - new propagasi
                    }) // add catch - new propagasi
                // } // add else - new penyakit
              }) // add catch - new penyakit
          } // add else - new tanaman
        }) // add catch - new tanaman

    } else {
      console.error('Unable to send request: ' + err)
      resp.status(500).send('NOT OK. ' + err)
    }
  })

})

app.get('/coba', (req, res) => {
  // var tanaman = require('./model/tanaman')

  // tanaman.model.fetchAll().then((model) => {

  //   var result = model.toJSON()[0]
  //   console.log(model.toJSON()[0]['deskripsi_tanaman'])
  //   var buffer = model.toJSON()[0]['deskripsi_tanaman']
  //   console.log(buffer.toString('binary'))

  //   result['deskripsi_tanaman'] = buffer.toString('binary')
  //   buffer = model.toJSON()[0]['manfaat_tanaman']

  //   // console.log(buffer.toString())
  //   // var reader = new window.FileReader()
  //   // var blb = new Blob(model.toJSON()['deskripsi_tanaman']['buffer'])

  //   // reader.addEventListener('loadend', (e) => {
  //   //   var text = e.srcElement.result
  //   //   console.log(text)
  //   // })

  //   // reader.readAsArrayBuffer(model.toJSON()['deskripsi_tanaman'])
  //   res.json()
  // })
  var propagasi = require('./model/propagasi')

  propagasi.model.fetchAll().then((model) => {
    result = model.toJSON()[0]

    
  })
})

app.get('/deskripsi/:id', (req, res) => {
  var id = req.params.id

  var tanaman = require('./model/tanaman')

  tanaman.model.where({id: id}).fetch().then((model) => {
    var result = model.toJSON()['deskripsi_tanaman']
    var buffer = result.toString()

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send('<html><head><meta name= "viewport" content= "width=device-width,initial-scale=1.0"></head><body>'+ buffer + '</body></html>')
  })
})

app.get('/manfaat/:id', (req, res) => {
  var id = req.params.id

  var tanaman = require('./model/tanaman')

  tanaman.model.where({id: id}).fetch().then((model) => {
    var result = model.toJSON()['manfaat_tanaman']
    var buffer = result.toString()

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send('<html><head><meta name= "viewport" content= "width=device-width,initial-scale=1.0"></head><body>'+ buffer + '</body></html>')
  })
})

app.get('/propagasi/:id', (req, res) => {
  var id = req.params.id

  var propagasi = require('./model/propagasi')

  propagasi.model.where({tanaman_id: id}).fetch().then((model) => {
    var result = model.toJSON()['data_propagasi']
    var buffer = result.toString()

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send('<html><head><meta name= "viewport" content= "width=device-width,initial-scale=1.0"></head><body>' + buffer + '</body></html>')
  })
})

app.get('/gejala/:id/:penyakit_id', (req, res) => {
  var id = req.params.id
  var penyakit_id = req.params.penyakit_id

  var penyakit = require('./model/penyakit')

  penyakit.model.where({tanaman_id: id, id: penyakit_id}).fetch().then((model) => {
    var result = model.toJSON()['gejala_penyakit']
    var buffer = result.toString()

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send('<html><head><meta name= "viewport" content= "width=device-width,initial-scale=1.0"></head><body>' + buffer + '</body></html>')
  })
})

app.get('/penanganan/:id/:penyakit_id', (req, res) => {
  var id = req.params.id
  var penyakit_id = req.params.penyakit_id

  var penyakit = require('./model/penyakit')

  penyakit.model.where({tanaman_id: id, id: penyakit_id}).fetch().then((model) => {
    var result = model.toJSON()['penanganan_penyakit']
    var buffer = result.toString()

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send('<html><head><meta name= "viewport" content= "width=device-width,initial-scale=1.0"></head><body>' + buffer + '</body></html>')
  })
})

app.get('/komentar/:id/:penyakit_id', (req, res) => {
  var id = req.params.id
  var penyakit_id = req.params.penyakit_id

  var penyakit = require('./model/penyakit')

  penyakit.model.where({tanaman_id: id, id: penyakit_id}).fetch().then((model) => {
    var result = model.toJSON()['komentar_penyebab']
    var buffer = result.toString()

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send('<html><head><meta name= "viewport" content= "width=device-width,initial-scale=1.0"></head><body>' + buffer + '</body></html>')
  })
})

app.get('/fallback', (req, res) => {
  res.send('Fallback')
})