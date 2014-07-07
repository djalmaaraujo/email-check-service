var Q = require('q');

var HELO_HI_STATUS = 220;
var MAIL_FROM_STATUS = 250;
var RCPT_TO_STATUS = 250;
var RESULT_STATUS = 250;
var BAD_SYNTAX_STATUS = 555;
var BAD_COMMAND_STATUS = 502;
var INVALID_EMAIL_STATUS = 550;

var EmailChecker = function (email) {
  this.email = email;
  this.servers = [];
  this.connection = {
    dnsHandler: null,
    socketClient: null,
    port: 25,
    domain: "gmail.com",
    state: 'helo'
  };

  this.validation = {
    done: false,
    isValid: false,
    domain: null,
    email: null
  };
};

EmailChecker.prototype.validate = function() {
  var self = this;
  var deferred = Q.defer();

  self.connection.socketClient.on("data", function (data) {
    var data = data.toString();
    var statusCode = data.slice(0, 3);

    self.parseStatus(statusCode);

    if ((self.validation.isValid) || (self.connection.state == "error")) {
      deferred.resolve(self.validation);
      self.destroy();
    }
  });

  return deferred.promise;
};

EmailChecker.prototype.parseStatus = function(status) {
  var self = this;

  if ((self.connection.state === "helo") && (status == HELO_HI_STATUS)) {
    self.send('helo hi \n')
    self.connection.state = "mail_from";

  } else if ((self.connection.state === "mail_from") && (status == MAIL_FROM_STATUS)) {
    self.send('mail from: <' + self.email + '> \n');
    self.connection.state = "rcpt_to";

  } else if ((self.connection.state === "rcpt_to") && (status == RCPT_TO_STATUS)) {
    self.send('rcpt to: <' + self.email + '> \n');
    self.connection.state = "result";

  } else if ((self.connection.state === "result") && (status == RESULT_STATUS)) {
    self.validation = {
      isValid: true,
      email: self.email,
      domain: self.getDomain()
    };

    self.connection.state = "done";

  } else if ((status == BAD_SYNTAX_STATUS) || (status == BAD_COMMAND_STATUS) || (status == INVALID_EMAIL_STATUS)) {
    self.connection.state = "error";
  }
};

EmailChecker.prototype.resolveMX = function(callback) {
  var self = this;

  if (self.email) {
    self.connection.dnsHandler.resolveMx(self.getDomain(), function (err, addresses) {
      if (!err) {
        return callback(addresses);
      } else {
        return callback([]);
      }

    });
  } else {
    return callback([]);
  }
};

EmailChecker.prototype.getDomain = function() {
  return this.email.split('@').reverse()[0];
};

EmailChecker.prototype.connect = function(callback) {
  var self = this;

  self.resolveMX(function (servers) {
    self.servers = servers;

    self.connection.socketClient.connect(self.connection.port, servers[0].exchange, function () {
      callback();
    });
  });
};

EmailChecker.prototype.destroy = function() {
  this.connection.socketClient.destroy();
};

EmailChecker.prototype.send = function(cmd) {
  this.connection.socketClient.write(cmd);
};

module.exports = EmailChecker;
