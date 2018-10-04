'use strict';

const dbDsl = require('dumonda-me-server-test-util').dbDSL;
const users = require('dumonda-me-server-test-util').user;
const requestHandler = require('dumonda-me-server-test-util').requestHandler;
const should = require('chai').should();

describe('Show the user profile in the activity feed for created questions only if the privacy setting allows this', function () {

    beforeEach(async function () {
        await dbDsl.init(3);

        dbDsl.createMainTopic({topicId: 'topic1', descriptionDe: 'topic1De', descriptionEn: 'topic1En'});

        dbDsl.createQuestion('1', {
            creatorId: '3', question: 'Das ist eine Frage', description: 'Test dumonda.me change the world1',
            topics: ['topic1'], language: 'de', created: 500, modified: 700
        });
    });

    afterEach(function () {
        return requestHandler.logout();
    });

    it('Hide user when privacy setting are set to onlyContact and user is not in trust circle', async function () {
        dbDsl.setUserPrivacy('3', {privacyMode: 'onlyContact'});
        await dbDsl.sendToDb();
        await requestHandler.login(users.validUser);
        let res = await requestHandler.get('/api/user/feed/activity', {guiLanguage: 'de', languages: ['de']});
        res.status.should.equal(200);
        res.body.feed.length.should.equals(1);

        res.body.feed[0].type.should.equals('Question');
        res.body.feed[0].action.should.equals('created');
        res.body.feed[0].questionId.should.equals('1');
        res.body.feed[0].question.should.equals('Das ist eine Frage');
        res.body.feed[0].questionSlug.should.equals('das-ist-eine-frage');
        res.body.feed[0].description.should.equals('Test dumonda.me change the world1');
        res.body.feed[0].descriptionHtml.should.equals(`Test <a href="http://dumonda.me" class="linkified" target="_blank">dumonda.me</a> change the world1`);
        res.body.feed[0].created.should.equals(500);
        res.body.feed[0].numberOfAnswers.should.equals(0);
        res.body.feed[0].user.isAnonymous.should.equals(true);
        res.body.feed[0].user.userImage.should.equals('profileImage/default/thumbnail.jpg');
        res.body.feed[0].user.userImagePreview.should.equals('profileImage/default/profilePreview.jpg');
        should.not.exist(res.body.feed[0].user.userId);
        should.not.exist(res.body.feed[0].user.name);
        should.not.exist(res.body.feed[0].user.slug);
        should.not.exist(res.body.feed[0].user.isLoggedInUser);
        should.not.exist(res.body.feed[0].user.isTrustUser);
    });

    it('Show user when privacy setting are set to onlyContact and user is in trust circle', async function () {
        dbDsl.setUserPrivacy('3', {privacyMode: 'onlyContact'});
        dbDsl.createContactConnection('3', '1');
        await dbDsl.sendToDb();
        await requestHandler.login(users.validUser);
        let res = await requestHandler.get('/api/user/feed/activity', {guiLanguage: 'de', languages: ['de']});
        res.status.should.equal(200);
        res.body.feed.length.should.equals(1);

        res.body.feed[0].action.should.equals('created');
        res.body.feed[0].questionId.should.equals('1');
        res.body.feed[0].user.isAnonymous.should.equals(false);
        res.body.feed[0].user.userId.should.equals('3');
    });

    it('Show user when privacy setting are set to publicEl and user is logged in', async function () {
        dbDsl.setUserPrivacy('3', {privacyMode: 'publicEl'});
        await dbDsl.sendToDb();
        await requestHandler.login(users.validUser);
        let res = await requestHandler.get('/api/user/feed/activity', {guiLanguage: 'de', languages: ['de']});
        res.status.should.equal(200);
        res.body.feed.length.should.equals(1);

        res.body.feed[0].action.should.equals('created');
        res.body.feed[0].questionId.should.equals('1');
        res.body.feed[0].user.isAnonymous.should.equals(false);
        res.body.feed[0].user.userId.should.equals('3');
    });
});