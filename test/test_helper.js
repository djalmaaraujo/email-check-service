var lib = require('../lib/email_checker');

module.exports = {
  EmailChecker: lib,
  fakeDNS: {
    resolveMx: function (domain, callback) {
      var servers = [
      { exchange: 'gmail-smtp-in.l.google.com', priority: 5 },
      { exchange: 'alt3.gmail-smtp-in.l.google.com', priority: 30 },
      { exchange: 'alt2.gmail-smtp-in.l.google.com', priority: 20 }];

      callback(null, servers);
    }
  }
};
