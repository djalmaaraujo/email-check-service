var EmailChecker = require('../lib/email_checker');
var expect = require("chai").expect;

describe("Email Checker", function () {
  it("expect to receive a email as a parameter", function () {
    checker = new EmailChecker("mydumb@gmail.com");
    expect(checker.email).equal("mydumb@gmail.com");
  });
});
