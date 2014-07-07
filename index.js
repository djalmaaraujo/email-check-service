var net = require("net");
var dns = require("dns");
var express = require("express");
var app = express();

var socketClient = new net.Socket();
var EmailChecker = require("./lib/email_checker");

app.get("/validate/:email", function(req, res){
  var email = req.params.email;
  var EmailClient = new EmailChecker(email);

  EmailClient.connect(dns, socketClient).then(function () {
    EmailClient.validate().then(function (validation) {
      res.send(validation);
    })
    .fail(function (a) {
      res.send({isValid: false, email: email});
    });

  })
  .fail(function (a) {
    res.send({isValid: false, email: email});
  });
});

var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
  console.log('To use the API, access /validate/validemail@address.com');
});
