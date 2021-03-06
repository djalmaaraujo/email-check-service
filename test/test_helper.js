var lib = require('../lib/email_checker');
var servers = [
{ exchange: 'gmail-smtp-in.l.google.com', priority: 5 },
{ exchange: 'alt3.gmail-smtp-in.l.google.com', priority: 30 },
{ exchange: 'alt2.gmail-smtp-in.l.google.com', priority: 20 }];

module.exports = {
  EmailChecker: lib,
  fakeDNS: {
    resolveMx: function (domain, callback) {
      callback(null, servers);
    }
  },
  netSocket: function () {
    this.connect = function (a,b,cb) {
      cb();
    };

    this.destroy = function () {};
    this.write = function () {};
    this.on = function () {};
  },

  servers: servers
};
