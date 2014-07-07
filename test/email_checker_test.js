var net = require('net');
var dns = require('dns');
var EmailChecker = require('../lib/email_checker');
var expect = require("chai").expect;
var fakeDNS = {
  resolveMx: function (domain, callback) {
    var servers = [
    { exchange: 'gmail-smtp-in.l.google.com', priority: 5 },
    { exchange: 'alt3.gmail-smtp-in.l.google.com', priority: 30 },
    { exchange: 'alt2.gmail-smtp-in.l.google.com', priority: 20 }];

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
      expect(m.checker.connection.dnsHandler).null;
      expect(m.checker.connection.socketHandler).null;
      expect(m.checker.connection.port).equal(25);
      expect(m.checker.connection.domain).equal('gmail.com');
    });
  });

  describe("Connection Tests", function () {
    beforeEach(function () {
      m.checker.connection.dnsHandler = fakeDNS;
      m.checker.connection.socketHandler = net.Socket;
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

    describe("#newSocket", function () {
      it("expect to return an instance of net.Socket module", function () {
        expect(m.checker.newSocket()).to.be.an.instanceof(net.Socket);
      });
    });

    describe("#bindEvents", function () {
      it("expect to call connect method on the client", function () {

      });
    });
  });

  describe("#getDomain", function () {
    it("expect to return the email domain", function () {
      expect(m.checker.getDomain()).equal("gmail.com");
    });
  });
});
