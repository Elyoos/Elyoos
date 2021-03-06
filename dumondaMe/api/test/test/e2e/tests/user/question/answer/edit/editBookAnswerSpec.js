'use strict';

let users = require('dumonda-me-server-test-util').user;
let db = require('dumonda-me-server-test-util').db;
let dbDsl = require('dumonda-me-server-test-util').dbDSL;
let requestHandler = require('dumonda-me-server-test-util').requestHandler;
let moment = require('moment');

describe('Edit book answer', function () {

    let startTime;

    beforeEach(async function () {
        await dbDsl.init(3);
        startTime = Math.floor(moment.utc().valueOf() / 1000);
        dbDsl.createQuestion('1', {
            creatorId: '2', question: 'Das ist eine Frage', description: 'description', topics: ['Spiritual', 'Health'],
            language: 'de'
        });
        dbDsl.createBookAnswer('5', {
            creatorId: '1', questionId: '1', created: 555, authors: 'Hans Wurst', googleBookId: '1234',
            hasPreviewImage: true
        });
        dbDsl.createBookAnswer('6', {
            creatorId: '2', questionId: '1', created: 666, authors: 'Hans Wurst', googleBookId: '1235',
            hasPreviewImage: true
        });
        await dbDsl.sendToDb();
    });

    afterEach(function () {
        return requestHandler.logout();
    });

    it('Edit book answer', async function () {
        await requestHandler.login(users.validUser);
        let res = await requestHandler.put('/api/user/question/answer/book/5', {
            description: 'descriptionBook www.dumonda.me'
        });
        res.status.should.equal(200);
        res.body.descriptionHtml.should.equals('descriptionBook <a href="http://www.dumonda.me" class="linkified" target="_blank" rel="noopener">www.dumonda.me</a>');

        let resp = await db.cypher().match(`(:Question {questionId: '1'})-[:ANSWER]->(answer:Answer {answerId: '5'})`)
            .return(`answer`).end().send();
        resp.length.should.equals(1);
        resp[0].answer.title.should.equals('book5Title');
        resp[0].answer.description.should.equals('descriptionBook www.dumonda.me');
        resp[0].answer.authors.should.equals('Hans Wurst');
        resp[0].answer.created.should.equals(555);
        resp[0].answer.modified.should.least(startTime);
    });

    it('The user can only edit the answers he has created.', async function () {
        await requestHandler.login(users.validUser);
        let res = await requestHandler.put('/api/user/question/answer/book/6', {
            authors: 'Hans Muster', description: 'descriptionBook'
        });
        res.status.should.equal(400);

        let resp = await db.cypher().match(`(:Question {questionId: '1'})-[:ANSWER]->
                                            (answer:Answer {answerId: '6'})`)
            .return(`answer`).end().send();
        resp.length.should.equals(1);
        resp[0].answer.title.should.equals('book6Title');
        resp[0].answer.description.should.equals('book6Description');
        resp[0].answer.authors.should.equals('Hans Wurst');
        resp[0].answer.created.should.equals(666);
    });
});
