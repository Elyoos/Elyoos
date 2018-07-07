'use strict';

const users = require('elyoos-server-test-util').user;
const dbDsl = require('elyoos-server-test-util').dbDSL;
const stubEmailQueue = require('elyoos-server-test-util').stubEmailQueue();
const requestHandler = require('elyoos-server-test-util').requestHandler;
const db = require('elyoos-server-test-util').db;
const moment = require('moment');

describe('Integration Tests edit news', function () {

    let startTime;

    beforeEach(async function () {
        stubEmailQueue.createImmediatelyJob.reset();
        startTime = Math.floor(moment.utc().valueOf() / 1000);
        await dbDsl.init(4, true);
        dbDsl.createNews('1', {created: 500, modified: 602});
        await dbDsl.sendToDb();
    });

    afterEach(function () {
        return requestHandler.logout();
    });


    it('Edit news', async function () {

        await requestHandler.login(users.validUser);
        let res = await requestHandler.put('/api/news/1', {title: 'title', text: 'description'});
        res.status.should.equal(200);
        res.body.modified.should.be.at.least(startTime);

        stubEmailQueue.createImmediatelyJob.notCalled.should.be.true;

        let news = await db.cypher().match(`(news:News {newsId: '1'})`)
            .return('news').end().send();
        news.length.should.equals(1);
        news[0].news.modified.should.be.at.least(startTime);
        news[0].news.created.should.equals(500);
        news[0].news.title.should.equals("title");
        news[0].news.text.should.equals("description");
    });
});