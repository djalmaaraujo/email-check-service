var net = require('net');
var dns = require('dns');
var expect = require("chai").expect;
var support = require('./test_helper');
var EmailChecker = support.EmailChecker;
var sinon = require('sinon');

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
      expect(m.checker.connection.socketClient).null;
      expect(m.checker.connection.port).equal(25);
      expect(m.checker.connection.domain).equal('gmail.com');
    });

    it("expect to have edfault informations about the validation", function () {
      expect(m.checker.validation.isValid).false;
      expect(m.checker.validation.email).equal(null);
      expect(m.checker.validation.domain).equal(null);
    });
  });

  describe("Connection Tests", function () {
    beforeEach(function () {
      m.checker.connection.dnsHandler = support.fakeDNS;
      m.checker.connection.socketClient = new net.Socket();
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

    describe("#connect", function () {
      it("expect to connect to the socket server using one of the existing servers and port", function (done) {
        var spy = sinon.spy(m.checker.connection.socketClient, 'connect');

        m.checker.connect();
        expect(spy.calledWith(25, support.servers[0].exchange)).true
        done();
      });
    });

    describe("#destroy", function () {
      it("expect to destroy the client socket", function (done) {
        var spy = sinon.spy(m.checker.connection.socketClient, 'destroy');

        m.checker.destroy();
        expect(spy.called).true
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
