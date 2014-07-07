var dns = require('dns');
var net = require('net');

var EmailChecker = function (email) {
  this.email = email;
  this.servers = [];
  this.connection = {
    port: 25,
    domain: "gmail.com"
  };
};

EmailChecker.prototype.resolveMX = function(callback) {
  var self = this;

  if (self.email) {
    dns.resolveMx(self.getDomain(), function (err, addresses) {
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
  return new net.Socket();
};

module.exports = EmailChecker;
