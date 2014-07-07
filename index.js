var net = require("net");
var dns = require("dns");
var express = require("express");
var app = express();

var socketClient = new net.Socket();
var EmailChecker = require("./lib/email_checker");

app.get("/validate/:email", function(req, res){
  var EmailClient = new EmailChecker(req.params.email);

  EmailClient.connect(dns, socketClient).then(function () {
    EmailClient.validate().then(function(validation) {
      res.send(validation);

    }).fail(function (validation) {
      res.send(validation);
    });

  }).fail(function () {
    res.send(validation);
  });
});


var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
  console.log('To use the API, access /validate/validemail@address.com');
});
