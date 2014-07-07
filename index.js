var net = require("net");
var dns = require("dns");
var express = require("express");
var app = express();

var EmailChecker = require("./lib/email_checker");
var EmailClient = new EmailChecker("johndoe@gmail.com");
EmailClient.connection.dnsHandler = dns;
EmailClient.connection.socketClient = new net.Socket();

app.get("/validate/:email", function(req, res){
  EmailClient.email = req.params.email;
  EmailClient.validate().then(function(validation) {
    res.send(validation);
  }).fail(function (validation) {
    res.send(validation);
  })
});

EmailClient.connect(function () {
  var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
  });
});
