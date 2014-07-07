var EmailChecker = function (email) {
  this.email = email;
  this.connection = {
    dnsHandler: null,
    socketClient: null,
    port: 25,
    domain: "gmail.com"
  };

  this.validation = {
    isValid: false,
    domain: null,
    email: null
  };
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

EmailChecker.prototype.connect = function() {
  var self = this;

  self.resolveMX(function (servers) {
    return self.connection.socketClient.connect(self.connection.port, servers[0].exchange);
  });
};

EmailChecker.prototype.destroy = function() {
  this.connection.socketClient.destroy()
};

module.exports = EmailChecker;
