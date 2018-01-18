'use strict';

let db = require('elyoos-server-test-util').db;
let dbDsl = require('elyoos-server-test-util').dbDSL;
let should = require('chai').should();
let requestHandler = require('elyoos-server-test-util').requestHandler;
let moment = require('moment');
let randomstring = require("randomstring");
let _ = require('lodash');

describe('Integration Tests for verify registering a new user', function () {

    let registerRequestUserValid = {
            email: 'inFo@elYoos.org',
            emailNormalized: 'info@elyoos.org',
            password: '$2a$10$JlKlyw9RSpt3.nt78L6VCe0Kw5KW4SPRaCGSPMmpW821opXpMgKAm',
            name: 'user Waldvogel',
            forename: 'user',
            surname: 'Waldvogel',
            latitude: 0,
            longitude: 0,
            linkId: randomstring.generate(64)
        }, registerRequestUserExpired, startTime = Math.floor(moment.utc().valueOf() / 1000),
        registerRequestUserValidWithInvitation, registerRequestUserValidCaseSensitiveEmail;
    beforeEach(function () {
        return dbDsl.init(4).then(function () {
            registerRequestUserExpired = _.cloneDeep(registerRequestUserValid);
            registerRequestUserValidWithInvitation = _.cloneDeep(registerRequestUserValid);
            registerRequestUserValidCaseSensitiveEmail = _.cloneDeep(registerRequestUserValid);
            registerRequestUserValid.registerDate = startTime;
            registerRequestUserValidCaseSensitiveEmail.registerDate = startTime;
            registerRequestUserValidCaseSensitiveEmail.linkId = randomstring.generate(64);
            registerRequestUserValidCaseSensitiveEmail.email = 'info@elyoos.org';
            registerRequestUserExpired.registerDate = startTime - (60 * 60 * 12) - 1;
            registerRequestUserExpired.linkId = randomstring.generate(64);
            registerRequestUserExpired.email = 'INFO2@elyoos.org';
            registerRequestUserExpired.emailNormalized = 'info2@elyoos.org';
            registerRequestUserValidWithInvitation.email = 'info3@ELYOOS.org';
            registerRequestUserValidWithInvitation.emailNormalized = 'info3@elyoos.org';
            registerRequestUserValidWithInvitation.registerDate = startTime;
            registerRequestUserValidWithInvitation.linkId = randomstring.generate(64);
            dbDsl.createUserRegisterRequest(registerRequestUserValid);
            dbDsl.createUserRegisterRequest(registerRequestUserValidCaseSensitiveEmail);
            dbDsl.createUserRegisterRequest(registerRequestUserExpired);
            dbDsl.createUserRegisterRequest(registerRequestUserValidWithInvitation);

            dbDsl.invitationSentBeforeRegistration('2', [{email: 'info3@ELYOOS.org', emailNormalized: 'info3@elyoos.org'}]);
            dbDsl.invitationSentBeforeRegistration('3', [{email: 'INFO3@elyoos.org', emailNormalized: 'info3@elyoos.org'}]);
            dbDsl.invitationSentBeforeRegistration('4', [{email: 'info3@elyoos.org', emailNormalized: 'info3@elyoos.org'}]);
            return dbDsl.sendToDb();
        });
    });

    afterEach(function () {
        return requestHandler.logout();
    });

    it('Verify email address with valid linkId and create account- Return 200', function () {

        return requestHandler.post('/api/register/verify', {linkId: registerRequestUserValid.linkId}).then(function (res) {
            res.status.should.equal(200);
            res.body.email.should.equals(registerRequestUserValid.email);

            return db.cypher().match("(friendPrivacy:Privacy)<-[:HAS_PRIVACY {type: 'Freund'}]-(user:User {email: 'inFo@elYoos.org'})-[:HAS_PRIVACY_NO_CONTACT]->(noContactPrivacy:Privacy)")
                .return('user, friendPrivacy, noContactPrivacy').end().send();
        }).then(function (user) {
            user.length.should.equals(1);
            should.exist(user[0].user.userId);
            user[0].user.emailNormalized.should.equals('info@elyoos.org');
            user[0].user.name.should.equals('user Waldvogel');
            should.not.exist(user[0].user.linkId);
            user[0].user.forename.should.equals(registerRequestUserValid.forename);
            user[0].user.surname.should.equals(registerRequestUserValid.surname);
            user[0].user.latitude.should.equals(registerRequestUserValid.latitude);
            user[0].user.longitude.should.equals(registerRequestUserValid.longitude);
            user[0].user.registerDate.should.equals(startTime);
            user[0].friendPrivacy.profile.should.be.true;
            user[0].friendPrivacy.image.should.be.true;
            user[0].friendPrivacy.contacts.should.be.true;
            user[0].friendPrivacy.profileData.should.be.true;
            user[0].friendPrivacy.pinwall.should.be.true;
            user[0].noContactPrivacy.profile.should.be.true;
            user[0].noContactPrivacy.image.should.be.true;
            user[0].noContactPrivacy.contacts.should.be.true;
            user[0].noContactPrivacy.profileData.should.be.true;
            user[0].noContactPrivacy.pinwall.should.be.true;
            return db.cypher().match("(user:UserRegisterRequest {linkId: {linkId}})")
                .return('user').end({linkId: registerRequestUserValid.linkId}).send();
        }).then(function (user) {
            user.length.should.equals(0);
            return requestHandler.login({
                'username': 'info@elyoos.org',
                'password': '1'
            });
        }).then(function () {
            return requestHandler.get('/api/user/userInfo');
        }).then(function (res) {
            res.status.should.equal(200);
            res.body.name.should.equal('user Waldvogel');
        });
    });

    it('Verify email address with valid linkId and create account with invitations- Return 200', function () {

        return requestHandler.post('/api/register/verify', {linkId: registerRequestUserValidWithInvitation.linkId}).then(function (res) {
            res.status.should.equal(200);
            res.body.email.should.equals(registerRequestUserValidWithInvitation.email);

            return db.cypher().match("(friendPrivacy:Privacy)<-[:HAS_PRIVACY {type: 'Freund'}]-(user:User {email: 'info3@ELYOOS.org'})-[:HAS_PRIVACY_NO_CONTACT]->(noContactPrivacy:Privacy)")
                .return('user, friendPrivacy, noContactPrivacy').end().send();
        }).then(function (user) {
            user.length.should.equals(1);
            should.exist(user[0].user.userId);
            user[0].user.emailNormalized.should.equals('info3@elyoos.org');
            user[0].user.name.should.equals('user Waldvogel');
            should.not.exist(user[0].user.linkId);
            user[0].user.forename.should.equals(registerRequestUserValidWithInvitation.forename);
            user[0].user.surname.should.equals(registerRequestUserValidWithInvitation.surname);
            user[0].user.latitude.should.equals(registerRequestUserValid.latitude);
            user[0].user.longitude.should.equals(registerRequestUserValid.longitude);
            user[0].user.registerDate.should.equals(startTime);
            user[0].friendPrivacy.profile.should.be.true;
            user[0].friendPrivacy.image.should.be.true;
            user[0].friendPrivacy.contacts.should.be.true;
            user[0].friendPrivacy.profileData.should.be.true;
            user[0].friendPrivacy.pinwall.should.be.true;
            user[0].noContactPrivacy.profile.should.be.true;
            user[0].noContactPrivacy.image.should.be.true;
            user[0].noContactPrivacy.contacts.should.be.true;
            user[0].noContactPrivacy.profileData.should.be.true;
            user[0].noContactPrivacy.pinwall.should.be.true;
            return db.cypher().match("(:User {email: 'info3@ELYOOS.org'})<-[:HAS_INVITED]-(user:User)")
                .return('user').orderBy("user.userId").end().send();
        }).then(function (user) {
            user.length.should.equals(3);
            user[0].user.userId.should.equals('2');
            user[1].user.userId.should.equals('3');
            user[2].user.userId.should.equals('4');
            return db.cypher().match("(user:InvitedUser)")
                .return('user').end().send();
        }).then(function (invitedUser) {
            invitedUser.length.should.equals(0);
            return db.cypher().match("(user:UserRegisterRequest {linkId: {linkId}})")
                .return('user').end({linkId: registerRequestUserValidWithInvitation.linkId}).send();
        }).then(function (user) {
            user.length.should.equals(0);
            return requestHandler.login({
                'username': 'infO3@elyoos.org',
                'password': '1'
            });
        }).then(function () {
            return requestHandler.get('/api/user/userInfo');
        }).then(function (res) {
            res.status.should.equal(200);
            res.body.name.should.equal('user Waldvogel');
        });
    });

    it('First verify is success. Second verify fails because of same normalized email', function () {

        return requestHandler.post('/api/register/verify', {linkId: registerRequestUserValid.linkId}).then(function (res) {
            res.status.should.equal(200);
            res.body.email.should.equals(registerRequestUserValid.email);

            return db.cypher().match("(friendPrivacy:Privacy)<-[:HAS_PRIVACY {type: 'Freund'}]-(user:User {email: 'inFo@elYoos.org'})-[:HAS_PRIVACY_NO_CONTACT]->(noContactPrivacy:Privacy)")
                .return('user').end().send();
        }).then(function (user) {
            user.length.should.equals(1);
            return requestHandler.post('/api/register/verify', {linkId: registerRequestUserValidCaseSensitiveEmail.linkId});
        }).then(function (res) {
            res.status.should.equal(400);
            return db.cypher().match("(friendPrivacy:Privacy)<-[:HAS_PRIVACY {type: 'Freund'}]-(user:User {email: 'info@elyoos.org'})-[:HAS_PRIVACY_NO_CONTACT]->(noContactPrivacy:Privacy)")
                .return('user').end().send();
        }).then(function (user) {
            user.length.should.equals(0);
            return db.cypher().match("(user:UserRegisterRequest {linkId: {linkId}})")
                .return('user').end({linkId: registerRequestUserValidCaseSensitiveEmail.linkId}).send();
        }).then(function (user) {
            user.length.should.equals(0);
            return requestHandler.login({
                'username': 'info@elyoos.org',
                'password': '1'
            });
        }).then(function () {
            return requestHandler.get('/api/user/userInfo');
        }).then(function (res) {
            res.status.should.equal(200);
            res.body.name.should.equal('user Waldvogel');
        });
    });

    it('Send Error when linkId has expired - Return 400', function () {

        return requestHandler.post('/api/register/verify', {linkId: registerRequestUserExpired.linkId}).then(function (res) {
            res.status.should.equal(400);

            return db.cypher().match("(user:UserRegisterRequest {linkId: {linkId}})")
                .return('user').end({linkId: registerRequestUserExpired.linkId}).send();
        }).then(function (user) {
            user.length.should.equals(0);
        });
    });

    it('Send Error when linkId does not exist - Return 400', function () {

        return requestHandler.post('/api/register/verify', {linkId: randomstring.generate(64)}).then(function (res) {
            res.status.should.equal(400);

            return db.cypher().match("(user:UserRegisterRequest {linkId: {linkId}})")
                .return('user').end({linkId: registerRequestUserValid.linkId}).send();
        }).then(function (user) {
            user.length.should.equals(1);
        });
    });
});