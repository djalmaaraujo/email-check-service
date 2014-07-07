var Q = require('q');

var HELO_HI_STATUS = 220;
var MAIL_FROM_STATUS = 250;
var RCPT_TO_STATUS = 250;
var RESULT_STATUS = 250;

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

    if (self.connection.state == "done") {
      self.destroy();

      if (self.validation.isValid) {
        deferred.resolve(self.validation);
      } else {
        deferred.reject(self.validation);
      }
    }
  });

  self.connection.socketClient.on("error", function (errorObj) {
    deferred.reject(self.validation);
  });

  return deferred.promise;
};

EmailChecker.prototype.parseStatus = function(status) {
  var self = this;

  self.validation.email = self.email;
  self.validation.domain = self.getDomain();

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
    self.validation.isValid = true;
    self.connection.state = "done";

  } else {
    self.connection.state = "done";
  }
};

EmailChecker.prototype.resolveMx = function(callback) {
  var self = this;

  if (self.email && self.getDomain()) {
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

EmailChecker.prototype.connect = function(dns, socket) {
  var self = this;
  var deferred = Q.defer();

  if (dns) self.connection.dnsHandler = dns;
  if (socket) self.connection.socketClient = socket;

  self.resolveMx(function (servers) {
    if (servers.length > 0) {
      self.connection.socketClient.connect(self.connection.port, servers[0].exchange);
      self.servers = servers;

    } else {
      deferred.reject();
    }
  });

  self.connection.socketClient.on("connect", function () {
    deferred.resolve(true);
  });

  self.connection.socketClient.on("error", function () {
    deferred.reject();
  });

  self.connection.socketClient.on("end", function () {
    deferred.reject();
  });

  return deferred.promise;
};

EmailChecker.prototype.destroy = function() {
  this.connection.socketClient.destroy();
};

EmailChecker.prototype.send = function(cmd) {
  this.connection.socketClient.write(cmd);
};

module.exports = EmailChecker;
