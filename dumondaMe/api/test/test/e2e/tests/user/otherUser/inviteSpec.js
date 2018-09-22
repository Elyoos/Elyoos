/*
'use strict';

let users = require('dumonda-me-server-test-util').user;
let eMail = require('dumonda-me-server-lib').eMail;
let requestHandler = require('dumonda-me-server-test-util').requestHandler;
let db = require('dumonda-me-server-test-util').db;
let dbDsl = require('dumonda-me-server-test-util').dbDSL;
let sinon = require('sinon');
let expect = require('chai').expect;

describe('Integration Tests for inviting other users to dumondaMe', function () {

    let sandbox, stubSendEMail;

    beforeEach(async function () {

        await dbDsl.init(6);

        sandbox = sinon.sandbox.create();
        stubSendEMail = sandbox.stub(eMail, 'sendEMail');
        stubSendEMail.resolves({});

        dbDsl.invitationSentBeforeRegistration('4', [{
            email: 'user10@IRGENDWO.ch',
            emailNormalized: 'user10@irgendwo.ch',
            invitationSent: 500
        }]);
        dbDsl.createContactConnection('1', '5');

        dbDsl.invitationSentBeforeRegistration('3', [{
            email: 'USER10@irgendwo.ch',
            emailNormalized: 'user10@irgendwo.ch',
            invitationSent: 500
        }]);
        dbDsl.invitationSentBeforeRegistration('1', [{
            email: 'USER11@irgendwo.ch',
            emailNormalized: 'user11@irgendwo.ch',
            invitationSent: 500
        }]);
        dbDsl.unsubscribeInvitation('user30@irgendwo.ch');
        await dbDsl.sendToDb();
    });

    afterEach(function () {
        sandbox.restore();
        return requestHandler.logout();
    });

    it('Invite only user without a profile on dumondaMe or without a contact connection', async function () {
        await requestHandler.login(users.validUser);
        let res = await requestHandler.put('/api/user/otherUser/invite',
            {
                emails: ['user2@irgendwo.ch',
                    'user5@irgendwo.ch',
                    'useR8@irgendwo.ch',
                    'user9@IRGENDWO.ch',
                    'user10@irgendwo.ch',
                    'user11@IRGENDWO.ch',
                    'user30@irgendwo.ch'],
                message: "Elyoos ist super!"
            });
        res.status.should.equal(200);

        stubSendEMail.calledWith("invitePerson",
            {},
            'de', 'USER@irgendwo.ch').should.be.true;

        let argument = stubEmailQueue.createImmediatelyJob.getCall(0).args[1],
            sendCommand = stubEmailQueue.createImmediatelyJob.getCall(0).args[0];
        expect(sendCommand).to.equal('sendInviteEmail');
        expect(argument.userId).to.equal('1');

        let resp = await db.cypher().match(`(user:InvitedUser)<-[:HAS_INVITED]-(:User {userId: '1'})`)
            .return("user.email AS email, user.emailNormalized AS emailNormalized, user.message AS message")
            .orderBy("user.email DESC").end().send();
        expect(resp.length).to.equal(3);
        expect(resp[0].email).to.equal('user9@IRGENDWO.ch');
        expect(resp[0].emailNormalized).to.equal('user9@irgendwo.ch');
        expect(resp[0].message).to.equal('Elyoos ist super!');
        expect(resp[1].email).to.equal('user10@irgendwo.ch');
        expect(resp[1].emailNormalized).to.equal('user10@irgendwo.ch');
        expect(resp[1].message).to.equal('Elyoos ist super!');
        expect(resp[2].email).to.equal('useR8@irgendwo.ch');
        expect(resp[2].emailNormalized).to.equal('user8@irgendwo.ch');
        expect(resp[2].message).to.equal('Elyoos ist super!');

        resp = await db.cypher().match(`(user:User {userId: '2'})<-[:HAS_INVITED]-(:User {userId: '1'})`).return("user")
            .orderBy("user.email DESC").end().send();
        expect(resp.length).to.equal(1);
    });

    it('Invite only user with existing account on dumondaMe', function () {
        return requestHandler.login(users.validUser).then(function () {
            return requestHandler.put('/api/user/otherUser/invite',
                {
                    emails: ['user2@irgendwo.ch',
                        'user4@IRGENDWO.ch',
                        'User5@irgendwo.ch']
                });
        }).then(function (res) {
            res.status.should.equal(200);

            expect(stubEmailQueue.createImmediatelyJob.called).to.equal(false);

            return db.cypher().match(`(user:InvitedUser)<-[:HAS_INVITED]-(:User {userId: '1'})`)
                .where("NOT EXISTS(user.invitationSent)")
                .return("user").end().send();
        }).then(function (resp) {
            expect(resp.length).to.equal(0);
            return db.cypher().match(`(user:User )<-[:HAS_INVITED]-(:User {userId: '1'})`).return("user")
                .orderBy("user.userId DESC").end().send();
        }).then(function (resp) {
            expect(resp.length).to.equal(2);
            expect(resp[0].user.userId).to.equal('4');
            expect(resp[0].user.email).to.equal('user4@irgendwo.ch');
            expect(resp[1].user.userId).to.equal('2');
            expect(resp[1].user.email).to.equal('user2@irgendwo.ch');
        });
    });

    it('Invite all not existing users to dumondaMe', function () {
        return requestHandler.login(users.validUser).then(function () {
            return requestHandler.put('/api/user/otherUser/invite',
                {
                    emails: ['user8@irgendwo.ch',
                        'user9@IRGENDWO.ch',
                        'USER10@irgendwo.ch']
                });
        }).then(function (res) {
            res.status.should.equal(200);

            let argument = stubEmailQueue.createImmediatelyJob.getCall(0).args[1],
                sendCommand = stubEmailQueue.createImmediatelyJob.getCall(0).args[0];
            expect(sendCommand).to.equal('sendInviteEmail');
            expect(argument.userId).to.equal('1');
            return db.cypher().match(`(user:InvitedUser)<-[:HAS_INVITED]-(:User {userId: '1'})`)
                .where("NOT EXISTS(user.invitationSent)")
                .return("user.email AS email, user.emailNormalized AS emailNormalized")
                .orderBy("user.email DESC").end().send();
        }).then(function (resp) {
            expect(resp.length).to.equal(3);
            expect(resp[0].email).to.equal('user9@IRGENDWO.ch');
            expect(resp[0].emailNormalized).to.equal('user9@irgendwo.ch');
            expect(resp[1].email).to.equal('user8@irgendwo.ch');
            expect(resp[1].emailNormalized).to.equal('user8@irgendwo.ch');
            expect(resp[2].email).to.equal('USER10@irgendwo.ch');
            expect(resp[2].emailNormalized).to.equal('user10@irgendwo.ch');
        });
    });

    it('Invite no user', function () {
        return requestHandler.login(users.validUser).then(function () {
            return requestHandler.put('/api/user/otherUser/invite',
                {
                    emails: ['User5@irgendwo.ch']
                });
        }).then(function (res) {
            res.status.should.equal(200);
            expect(stubEmailQueue.createImmediatelyJob.called).to.equal(false);
            return db.cypher().match(`(user:InvitedUser)<-[:HAS_INVITED]-(:User {userId: '1'})`)
                .where("NOT EXISTS(user.invitationSent)").return("user.email AS email")
                .orderBy("user.email DESC").end().send();
        }).then(function (resp) {
            expect(resp.length).to.equal(0);
            return db.cypher().match(`(user:User )<-[:HAS_INVITED]-(:User {userId: '1'})`)
                .where("NOT EXISTS(user.invitationSent)").return("user")
                .orderBy("user.userId DESC").end().send();
        }).then(function (resp) {
            expect(resp.length).to.equal(0);
        });
    });
});
*/