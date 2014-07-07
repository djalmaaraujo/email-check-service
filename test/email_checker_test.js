var net = require("net");
var dns = require("dns");
var expect = require("chai").expect;
var support = require("./test_helper");
var EmailChecker = support.EmailChecker;
var sinon = require("sinon");

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
      expect(m.checker.connection.domain).equal("gmail.com");
      expect(m.checker.connection.state).equal("helo");
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
          expect(servers).to.include({ exchange: "gmail-smtp-in.l.google.com", priority: 5 });
          expect(servers).to.include({ exchange: "alt3.gmail-smtp-in.l.google.com", priority: 30 });
          expect(servers).to.include({ exchange: "alt2.gmail-smtp-in.l.google.com", priority: 20 });
          done();
        });
      });
    });

    describe("#connect", function () {
      it("expect to connect to the socket server using one of the existing servers and port", function (done) {
        var spy = sinon.spy(m.checker.connection.socketClient, "connect");

        m.checker.connect();
        expect(spy.calledWith(25, support.servers[0].exchange)).true
        done();
      });
    });

    describe("#destroy", function () {
      it("expect to destroy the client socket", function (done) {
        var spy = sinon.spy(m.checker.connection.socketClient, "destroy");

        m.checker.destroy();
        expect(spy.called).true
        done();
      });
    });

    describe("#listen", function () {
      it("expect to call data listener", function (done) {
        var spy = sinon.spy(m.checker.connection.socketClient, "on");

        m.checker.listen();
        expect(spy.called).true
        done();
      });
    });

    describe("#send", function () {
      it("expect to write on the client socket", function (done) {
        m.checker.connect();
        var spy = sinon.spy(m.checker.connection.socketClient, "write");

        m.checker.send("cmd");
        expect(spy.calledWith("cmd")).true
        done();
      });
    });

    describe("#parseStatus", function () {
      describe("with the helo state", function () {
        it("expect to send helo hi command when status code is 220", function (done) {
          m.checker.connect();
          var spy = sinon.spy(m.checker.connection.socketClient, "write");

          m.checker.connection.state = "helo";
          m.checker.parseStatus(220);
          expect(spy.calledWith('helo hi \n')).true
          expect(m.checker.connection.state).equal("mail_from");
          done();
        });
      });

      describe("with the mail_from state", function () {
        it("expect to send mail from: email command when status code is 250", function (done) {
          m.checker.connect();
          var spy = sinon.spy(m.checker.connection.socketClient, "write");

          m.checker.connection.state = "mail_from";
          m.checker.parseStatus(250);
          expect(spy.calledWith('mail from: <mydumb@gmail.com> \n')).true
          expect(m.checker.connection.state).equal("rcpt_to");
          done();
        });
      });

      describe("with the rcpt_to state", function () {
        it("expect to send mail rcpt to: email command when status code is 250", function (done) {
          m.checker.connect();
          var spy = sinon.spy(m.checker.connection.socketClient, "write");

          m.checker.connection.state = "rcpt_to";
          m.checker.parseStatus(250);
          expect(spy.calledWith('rcpt to: <mydumb@gmail.com> \n')).true
          expect(m.checker.connection.state).equal("result");
          done();
        });
      });

      describe("with the result state", function () {
        it("expect to destroy the client session if the email is valid", function (done) {
          m.checker.connect();
          var spy = sinon.spy(m.checker.connection.socketClient, "destroy");

          m.checker.connection.state = "result";
          m.checker.parseStatus(250);

          expect(spy.called).true
          expect(m.checker.connection.state).equal("helo");
          expect(m.checker.validation.isValid).true;
          expect(m.checker.validation.domain).equal("gmail.com");
          expect(m.checker.validation.email).equal("mydumb@gmail.com");
          done();
        });
      });

      describe("with the errors status", function () {
        it("expect to destroy the session when 555 (bad syntax) status is present", function (done) {
          m.checker.connect();
          var spy = sinon.spy(m.checker.connection.socketClient, "destroy");

          m.checker.parseStatus(555);
          expect(spy.called).true
          done()
        });

        it("expect to destroy the session when 502 (bad command) status is present", function (done) {
          m.checker.connect();
          var spy = sinon.spy(m.checker.connection.socketClient, "destroy");

          m.checker.parseStatus(502);
          expect(spy.called).true
          done()
        });

        it("expect to destroy the session when 550 (email invalid) status is present", function (done) {
          m.checker.connect();
          var spy = sinon.spy(m.checker.connection.socketClient, "destroy");

          m.checker.parseStatus(550);
          expect(spy.called).true
          done()
        });
      });
    });
  });

  describe("#getDomain", function () {
    it("expect to return the email domain", function () {
      expect(m.checker.getDomain()).equal("gmail.com");
    });
  });
});
