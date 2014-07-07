var EmailChecker = require('../lib/email_checker');
var expect = require("chai").expect;
var fakeDNS = {
  resolveMX: function (domain, callback) {
    var servers = [
    'gmail-smtp-in.l.google.com',
    'alt2.gmail-smtp-in.l.google.com',
    'alt4.gmail-smtp-in.l.google.com'];

    callback(null, servers);
  }
}

var statusCodes =

describe("Email Checker", function () {
  var m = {};

  beforeEach(function () {
    m.checker = new EmailChecker("mydumb@gmail.com");
  });

  describe("#constructor", function () {
    it("expect to receive a email as a parameter", function () {
      expect(m.checker.email).equal("mydumb@gmail.com");
    });

    it("expect to have default options for the connection", function () {
      expect(m.checker.connection.port).equal(25);
      expect(m.checker.connection.domain).equal('gmail.com');
    });
  });

  describe("#resolveMX", function () {
    it("expect to return an empty array of servers for no email", function (done) {
      dumbChecker = new EmailChecker();
      dumbChecker.resolveMX(function (servers) {
        expect(servers).to.be.empty;
        done();
      });
    });

    it("expect to return an array of servers for a valid email", function (done) {
      m.checker.resolveMX(function (servers) {
        expect(servers).to.not.be.empty;
        done();
      });
    });

    it("expect to return an array of servers for gmail mx recors", function (done) {
      m.checker.email = "steve@gmail.com";

      m.checker.resolveMX(function (servers) {
        expect(servers).to.include({ exchange: 'gmail-smtp-in.l.google.com', priority: 5 });
        expect(servers).to.include({ exchange: 'alt3.gmail-smtp-in.l.google.com', priority: 30 });
        expect(servers).to.include({ exchange: 'alt2.gmail-smtp-in.l.google.com', priority: 20 });
        done();
      });
    });
  });

  describe("#getDomain", function () {
    it("expect to return the email domain", function () {
      expect(m.checker.getDomain()).equal("gmail.com");
    });
  });
});
