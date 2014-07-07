var net = require("net");
var dns = require("dns");
var express = require("express");
var app = express();

var EmailChecker = require("./lib/email_checker");

app.get("/validate/:email", function(req, res){
  var EmailClient = new EmailChecker(req.params.email);
  EmailClient.connection.dnsHandler = dns;
  EmailClient.connection.socketClient = new net.Socket();

  EmailClient.connect(function () {
    EmailClient.validate().then(function(validation) {
      res.send(validation);
    }).fail(function (validation) {
      res.send(validation);
    });
  });
});


var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
  console.log('To use the API, access /validate/validemail@address.com');
});
