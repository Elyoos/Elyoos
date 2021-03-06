'use strict';

const users = require('dumonda-me-server-test-util').user;
const db = require('dumonda-me-server-test-util').db;
const dbDsl = require('dumonda-me-server-test-util').dbDSL;
const requestHandler = require('dumonda-me-server-test-util').requestHandler;
const moment = require('moment');

describe('Handling watch question requests from a user', function () {

    let startTime;

    beforeEach(async function () {
        await dbDsl.init(4);
        startTime = Math.floor(moment.utc().valueOf() / 1000);

        dbDsl.createRegion('region-1', {de: 'regionDe', en: 'regionEn'});

        dbDsl.createQuestion('1', {
            creatorId: '2', question: 'Das ist eine FragöÖÄäÜü', description: 'description', topics: ['Spiritual'],
            language: 'de'
        });

        dbDsl.createQuestion('2', {
            creatorId: '1', question: 'Das ist eine FragöÖÄäÜü2', description: 'description2', topics: ['Spiritual'],
            language: 'de'
        });
    });

    afterEach(function () {
        return requestHandler.logout();
    });

    it('User request to watch question', async function () {
        await dbDsl.sendToDb();
        await requestHandler.login(users.validUser);
        let res = await requestHandler.put('/api/user/question/watch/1');
        res.status.should.equal(200);

        let resp = await db.cypher().match("(q:Question)<-[w:WATCH]-(u:User)").return(`q, u, w`).end().send();
        resp.length.should.equals(1);
        resp[0].q.questionId.should.equals('1');
        resp[0].u.userId.should.equals('1');
        resp[0].w.created.should.least(startTime);
    });

    it('User request to watch question as admin is not allowed', async function () {
        await dbDsl.sendToDb();
        await requestHandler.login(users.validUser);
        let res = await requestHandler.put('/api/user/question/watch/2');
        res.status.should.equal(400);

        let resp = await db.cypher().match("(q:Question)<-[:WATCH]-(u:User)").return(`q, u`).end().send();
        resp.length.should.equals(0);

        resp = await db.cypher().match("(n:Notification)").return(`n`).end().send();
        resp.length.should.equals(0);
    });

    it('User request to unwatch question', async function () {
        dbDsl.watchQuestion({questionId: '1', userId: '1'});
        await dbDsl.sendToDb();
        await requestHandler.login(users.validUser);
        let res = await requestHandler.del('/api/user/question/watch', {questionId: '1'});
        res.status.should.equal(200);

        let resp = await db.cypher().match("(q:Question)<-[:WATCH]-(u:User)").return(`q, u`).end().send();
        resp.length.should.equals(0);
    });

    it('User request to unwatch question when notification with only one user watching exists', async function () {
        dbDsl.watchQuestion({questionId: '1', userId: '1'});
        dbDsl.userWatchesQuestion('50', {
            questionId: '1',
            created: 678, watchingUsers: [{userId: '1', created: 555}]
        });
        await dbDsl.sendToDb();
        await requestHandler.login(users.validUser);
        let res = await requestHandler.del('/api/user/question/watch', {questionId: '1'});
        res.status.should.equal(200);

        let resp = await db.cypher().match("(q:Question)<-[:WATCH]-(u:User)").return(`q, u`).end().send();
        resp.length.should.equals(0);

        resp = await db.cypher().match("(n:Notification)").return(`n`).end().send();
        resp.length.should.equals(0);
    });

    it('User request to unwatch question when notification with multiple user watching exists', async function () {
        dbDsl.watchQuestion({questionId: '1', userId: '1'});
        dbDsl.userWatchesQuestion('50', {
            questionId: '1',
            created: 678, watchingUsers: [{userId: '1', created: 555}, {userId: '3', created: 555}]
        });
        await dbDsl.sendToDb();
        await requestHandler.login(users.validUser);
        let res = await requestHandler.del('/api/user/question/watch', {questionId: '1'});
        res.status.should.equal(200);

        let resp = await db.cypher().match("(q:Question)<-[:WATCH]-(u:User)").return(`q, u`).end().send();
        resp.length.should.equals(0);

        resp = await db.cypher().match("(n:Notification)").return(`n`).end().send();
        resp.length.should.equals(1);
    });

    it('User request to unwatch question do not delete other notifications', async function () {
        dbDsl.createRegion('region', {de: 'regionDe', en: 'regionEn'});
        dbDsl.createCommitment('1', {
            adminId: '2', topics: ['Spiritual', 'Meditation'], language: 'de', created: 700,
            website: 'https://www.example.org/', regions: ['region']
        });
        dbDsl.watchCommitment({commitmentId: '1', userId: '1'});

        dbDsl.watchQuestion({questionId: '1', userId: '1'});
        dbDsl.userWatchesQuestion('50', {
            questionId: '1',
            created: 678, watchingUsers: [{userId: '1', created: 555}, {userId: '3', created: 555}]
        });
        dbDsl.notificationShowQuestionOnCommitmentRequest('51', {questionId: '1', commitmentId: '1', adminId: '2',
            created: 777});

        await dbDsl.sendToDb();
        await requestHandler.login(users.validUser);
        let res = await requestHandler.del('/api/user/question/watch', {questionId: '1'});
        res.status.should.equal(200);

        let resp = await db.cypher().match("(q:Question)<-[:WATCH]-(u:User)").return(`q, u`).end().send();
        resp.length.should.equals(0);

        resp = await db.cypher().match("(n:Notification)").return(`n`).end().send();
        resp.length.should.equals(2);
    });

    it('Only logged in user can watch question', async function () {
        await dbDsl.sendToDb();
        let res = await requestHandler.put('/api/user/question/watch/1');
        res.status.should.equal(401);
    });

    it('Only logged in user can delete watch of question', async function () {
        await dbDsl.sendToDb();
        let res = await requestHandler.del('/api/user/question/watch', {questionId: '1'});
        res.status.should.equal(401);
    });

    it('Harvesting user is not allowed to watch question', async function () {
        dbDsl.setUserIsHarvestingUser('1', {start: 100, end: 200, link: 'https://www.link.ch', address: 'Milky Way'});
        await dbDsl.sendToDb();
        await requestHandler.login(users.validUser);
        let res = await requestHandler.put('/api/user/question/watch/1');
        res.status.should.equal(401);

        let resp = await db.cypher().match("(q:Question)<-[w:WATCH]-(u:User)").return(`q, u, w`).end().send();
        resp.length.should.equals(0);
    });
});
