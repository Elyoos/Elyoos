'use strict';

const users = require('dumonda-me-server-test-util').user;
const db = require('dumonda-me-server-test-util').db;
const dbDsl = require('dumonda-me-server-test-util').dbDSL;
const requestHandler = require('dumonda-me-server-test-util').requestHandler;
const moment = require('moment');

describe('Creating a note for an answer', function () {

    let startTime;

    beforeEach(async function () {
        await dbDsl.init(3);
        startTime = Math.floor(moment.utc().valueOf() / 1000);
        dbDsl.createQuestion('1', {
            creatorId: '2', question: 'Das ist eine Frage', description: 'description', topics: ['Spiritual', 'Health'],
            language: 'de'
        });
    });

    afterEach(function () {
        return requestHandler.logout();
    });

    it('Creating a note for an answer (without url)', async function () {
        dbDsl.createDefaultAnswer('5', {
            creatorId: '2', questionId:'1', answer: 'Answer'
        });
        await dbDsl.sendToDb();
        await requestHandler.login(users.validUser);
        let res = await requestHandler.post('/api/user/question/answer/note', {answerId: '5', text: 'This is a note'});
        res.status.should.equal(200);
        res.body.created.should.least(startTime);
        res.body.textHtml.should.equals('This is a note');
        res.body.creator.userId.should.equals('1');
        res.body.creator.name.should.equals('user Meier');
        res.body.creator.slug.should.equals('user-meier');

        let resp = await db.cypher().match(`(answer:Default:Answer)-[:NOTE]->(note:Note)<-[:IS_CREATOR]-(:User {userId: '1'})`)
            .return(`answer, note`).end().send();
        resp.length.should.equals(1);
        resp[0].answer.answerId.should.equals('5');
        resp[0].note.noteId.should.equals(res.body.noteId);
        resp[0].note.text.should.equals('This is a note');
    });

    it('Creating a note for an answer (with url)', async function () {
        dbDsl.createDefaultAnswer('5', {
            creatorId: '2', questionId:'1', answer: 'Answer'
        });
        await dbDsl.sendToDb();
        await requestHandler.login(users.validUser);
        let res = await requestHandler.post('/api/user/question/answer/note',
            {answerId: '5', text: 'Test dumonda.me change the world'});
        res.status.should.equal(200);
        res.body.created.should.least(startTime);
        res.body.textHtml.should.equals(`Test <a href="http://dumonda.me" class="linkified" target="_blank" rel="noopener">dumonda.me</a> change the world`);
        res.body.creator.userId.should.equals('1');
        res.body.creator.name.should.equals('user Meier');
        res.body.creator.slug.should.equals('user-meier');

        let resp = await db.cypher().match(`(answer:Default:Answer)-[:NOTE]->(note:Note)<-[:IS_CREATOR]-(:User {userId: '1'})`)
            .return(`answer, note`).end().send();
        resp.length.should.equals(1);
        resp[0].answer.answerId.should.equals('5');
        resp[0].note.noteId.should.equals(res.body.noteId);
        resp[0].note.text.should.equals(`Test dumonda.me change the world`);
    });

    it('Creating a note for a commitment answer is not allowed', async function () {
        dbDsl.createCommitment('10', {
            adminId: '1', topics: ['Spiritual', 'Meditation'], language: 'de', created: 700,
            website: 'https://www.example.org/', regions: ['region-1']
        });

        dbDsl.createCommitmentAnswer('5', {
            creatorId: '2', questionId: '1', commitmentId: '10', created: 500, description: 'test'
        });
        await dbDsl.sendToDb();
        await requestHandler.login(users.validUser);
        let res = await requestHandler.post('/api/user/question/answer/note',
            {answerId: '5', text: 'Test dumonda.me change the world'});
        res.status.should.equal(400);

        let resp = await db.cypher().match(`(:Answer)-[:NOTE]->(note:Note)`)
            .return(`note`).end().send();
        resp.length.should.equals(0);
    });

    it('Only logged in user can create a note', async function () {
        dbDsl.createDefaultAnswer('5', {
            creatorId: '2', questionId:'1', answer: 'Answer'
        });
        await dbDsl.sendToDb();
        let res = await requestHandler.post('/api/user/question/answer/note',
            {answerId: '5', text: 'Test dumonda.me change the world'});
        res.status.should.equal(401);
    });
});
