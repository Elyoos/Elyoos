'use strict';

var testee = require('../../../../../lib/passwordEncryption');
var sinon = require('sinon');
var expect = require('chai').expect;

describe('Unit Test lib/passwordEncryption', function () {

    var sandbox;

    before(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('Generate a password hash', function () {

        return testee.generatePasswordHash('1').then(function (hash) {
            expect(hash.length).to.equal(60);
        });
    });

    it('Compare Password with Hash', function () {

        return testee.comparePassword('1', '$2a$10$JlKlyw9RSpt3.nt78L6VCe0Kw5KW4SPRaCGSPMmpW821opXpMgKAm').then(function (result) {
            expect(result).to.be.true;
        });
    });

    it('Compare Password with Hash fails', function () {

        return testee.comparePassword('2', '$2a$10$JlKlyw9RSpt3.nt78L6VCe0Kw5KW4SPRaCGSPMmpW821opXpMgKAm').then(function (result) {
            expect(result).to.be.false;
        });
    });

});
