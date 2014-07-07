var EmailChecker = function (email) {
  this.email = email;
  this.servers = [];
  this.connection = {
    dnsHandler: null,
    socketHandler: null,
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
      if (!err) self.servers = addresses;

      return callback(self.servers);
    });
  } else {
    return callback([]);
  }
};

EmailChecker.prototype.getDomain = function() {
  return this.email.split('@').reverse()[0];
};

EmailChecker.prototype.newSocket = function() {
  return new this.connection.socketHandler();
};

module.exports = EmailChecker;
