'use strict';

const users = require('dumonda-me-server-test-util').user;
const dbDsl = require('dumonda-me-server-test-util').dbDSL;
const requestHandler = require('dumonda-me-server-test-util').requestHandler;
const moment = require('moment');
const should = require('chai').should();

describe('Getting answers of a question', function () {

    let startTime;

    beforeEach(async function () {
        await dbDsl.init(6);
        await requestHandler.logout();
        startTime = Math.floor(moment.utc().valueOf() / 1000);

        dbDsl.createRegion('region-1', {de: 'Region1De', en: 'Region1En'});
        dbDsl.createRegion('region-2', {de: 'Region2De', en: 'Region2En'});
        dbDsl.createRegion('region-3', {de: 'Region3De', en: 'Region3En'});

        dbDsl.createMainTopic({topicId: 'topic1', descriptionDe: 'topic1De', descriptionEn: 'topic1En'});
        dbDsl.createMainTopic({topicId: 'topic2', descriptionDe: 'topic2De', descriptionEn: 'topic2En'});

        dbDsl.createCommitment('2', {
            title: 'Das ist ein Engagement ♥',
            regions: ['region-1', 'region-2'],
            adminId: '2',
            topics: ['topic1', 'topic2'],
            language: 'de',
            created: 700, modified: 701,
            website: 'https://www.example.org/'
        }, []);

        dbDsl.createQuestion('1', {
            creatorId: '1', question: 'Das ist eine Frage', description: 'Test dumonda.me change the world',
            topics: ['topic1', 'topic2'], language: 'de', modified: 700
        });
        dbDsl.createDefaultAnswer('5', {
            creatorId: '1', questionId: '1', answer: 'Answer', created: 600,
        });
        dbDsl.createDefaultAnswer('6', {
            creatorId: '3', questionId: '1', answer: 'Answer2 www.dumonda.me', hasImage: true
        });
        dbDsl.createYoutubeAnswer('7', {
            creatorId: '2', questionId: '1', created: 499, idOnYoutube: 'Lhku7ZBWEK8',
            description: 'www.dumonda.me description youtube',
            link: 'https://www.youtube.com/watch?v=Lhku7ZBWEK8', linkEmbed: 'https://www.youtube.com/embed/Lhku7ZBWEK8'
        });
        dbDsl.createLinkAnswer('8', {
            creatorId: '2', questionId: '1', created: 498, hasPreviewImage: true,
            description: 'www.dumonda.me description link', link: 'https://example.com', pageType: 'blog'
        });
        dbDsl.createBookAnswer('9', {
            creatorId: '3', questionId: '1', created: 497, authors: 'Hans Wurst', googleBookId: '1234',
            hasPreviewImage: true, description: 'www.dumonda.me description book'
        });
        dbDsl.createCommitmentAnswer('11', {
            creatorId: '2', questionId: '1', commitmentId: '2', created: 496,
            description: 'www.dumonda.me description commitment'
        });

        dbDsl.createCommitmentEvent({
            commitmentId: '2', eventId: '22',
            startDate: startTime - 100, endDate: startTime + 200, regionId: 'region-2'
        });
        dbDsl.createCommitmentEvent({
            commitmentId: '2', eventId: '23',
            startDate: startTime - 101, endDate: startTime + 201, regionId: 'region-3'
        });
        dbDsl.createCommitmentEvent({
            commitmentId: '2', eventId: '24',
            startDate: startTime - 100, endDate: startTime - 10, regionId: 'region-2'
        });
    });

    afterEach(function () {
        return requestHandler.logout();
    });

    it('Getting answers of a question without answers', async function () {
        dbDsl.createQuestion('2', {
            creatorId: '3', question: 'Das ist eine Frage2', description: 'Test dumonda.me change the world',
            topics: ['topic2'], language: 'en', modified: 701
        });
        await dbDsl.sendToDb();
        await requestHandler.login(users.validUser);
        let res = await requestHandler.get('/api/question/answer', {questionId: '2', page: 0, language: 'de'});
        res.status.should.equal(200);
        res.body.hasMoreAnswers.should.equals(false);
        res.body.answers.length.should.equals(0);
    });

    it('Getting answers of a question sorted by date', async function () {
        dbDsl.watchQuestion({questionId: '1', userId: '1'});
        dbDsl.watchQuestion({questionId: '1', userId: '4'});

        dbDsl.createNote('50', {answerId: '6', creatorId: '1', created: 555});
        dbDsl.createNote('51', {answerId: '6', creatorId: '2', created: 444});
        dbDsl.createNote('52', {answerId: '7', creatorId: '3', created: 666});
        dbDsl.createNote('53', {answerId: '7', creatorId: '1', created: 666});
        dbDsl.upVoteNote({noteId: '52', userId: '1'});
        dbDsl.upVoteNote({noteId: '52', userId: '2'});
        dbDsl.upVoteNote({noteId: '53', userId: '3'});

        await dbDsl.sendToDb();
        await requestHandler.login(users.validUser);
        let res = await requestHandler.get('/api/question/answer', {questionId: '1', page: 0, language: 'de'});
        res.status.should.equal(200);

        res.body.hasMoreAnswers.should.equals(false);
        res.body.answers.length.should.equals(6);
        res.body.answers[0].answerId.should.equals('5');
        res.body.answers[0].answerType.should.equals('Default');
        should.not.exist(res.body.answers[0].imageUrl);
        res.body.answers[0].answer.should.equals('Answer');
        res.body.answers[0].upVotes.should.equals(0);
        res.body.answers[0].isAdmin.should.equals(true);
        res.body.answers[0].hasVoted.should.equals(false);
        res.body.answers[0].created.should.equals(600);
        res.body.answers[0].creator.name.should.equals('user Meier');
        res.body.answers[0].creator.userId.should.equals('1');
        res.body.answers[0].creator.slug.should.equals('user-meier');
        res.body.answers[0].creator.userImage.should.equals('profileImage/1/thumbnail.jpg');
        res.body.answers[0].creator.userImagePreview.should.equals('profileImage/1/profilePreview.jpg');
        res.body.answers[0].creator.isLoggedInUser.should.equals(true);
        res.body.answers[0].creator.isTrustUser.should.equals(false);
        res.body.answers[0].creator.isHarvestingUser.should.equals(false);
        res.body.answers[0].numberOfNotes.should.equals(0);

        res.body.answers[1].answerId.should.equals('6');
        res.body.answers[1].answerType.should.equals('Default');
        res.body.answers[1].imageUrl.should.equals(`${process.env.PUBLIC_IMAGE_BASE_URL}/defaultAnswer/6/500x800/title.jpg?v=500`);
        res.body.answers[1].answer.should.equals('Answer2 www.dumonda.me');
        res.body.answers[1].answerHtml.should.equals('Answer2 <a href="http://www.dumonda.me" class="linkified" target="_blank" rel="noopener">www.dumonda.me</a>');
        res.body.answers[1].upVotes.should.equals(0);
        res.body.answers[1].isAdmin.should.equals(false);
        res.body.answers[1].hasVoted.should.equals(false);
        res.body.answers[1].created.should.equals(500);
        res.body.answers[1].creator.name.should.equals('user Meier3');
        res.body.answers[1].creator.userId.should.equals('3');
        res.body.answers[1].creator.slug.should.equals('user-meier3');
        res.body.answers[1].creator.userImage.should.equals('profileImage/3/thumbnail.jpg');
        res.body.answers[1].creator.userImagePreview.should.equals('profileImage/3/profilePreview.jpg');
        res.body.answers[1].creator.isLoggedInUser.should.equals(false);
        res.body.answers[1].creator.isTrustUser.should.equals(false);
        res.body.answers[1].creator.isHarvestingUser.should.equals(false);
        res.body.answers[1].numberOfNotes.should.equals(2);

        res.body.answers[2].answerId.should.equals('7');
        res.body.answers[2].answerType.should.equals('Youtube');
        res.body.answers[2].idOnYoutube.should.equals('Lhku7ZBWEK8');
        res.body.answers[2].link.should.equals('https://www.youtube.com/watch?v=Lhku7ZBWEK8');
        res.body.answers[2].linkEmbed.should.equals('https://www.youtube.com/embed/Lhku7ZBWEK8');
        res.body.answers[2].title.should.equals('youtube7Title');
        res.body.answers[2].description.should.equals('www.dumonda.me description youtube');
        res.body.answers[2].descriptionHtml.should.equals('<a href="http://www.dumonda.me" class="linkified" target="_blank" rel="noopener">www.dumonda.me</a> description youtube');
        res.body.answers[2].upVotes.should.equals(0);
        res.body.answers[2].isAdmin.should.equals(false);
        res.body.answers[2].hasVoted.should.equals(false);
        res.body.answers[2].created.should.equals(499);
        res.body.answers[2].creator.name.should.equals('user Meier2');
        res.body.answers[2].creator.userId.should.equals('2');
        res.body.answers[2].creator.slug.should.equals('user-meier2');
        res.body.answers[2].creator.userImage.should.equals('profileImage/2/thumbnail.jpg');
        res.body.answers[2].creator.userImagePreview.should.equals('profileImage/2/profilePreview.jpg');
        res.body.answers[2].creator.isLoggedInUser.should.equals(false);
        res.body.answers[2].creator.isTrustUser.should.equals(false);
        res.body.answers[2].creator.isHarvestingUser.should.equals(false);
        res.body.answers[2].numberOfNotes.should.equals(2);

        res.body.answers[3].answerId.should.equals('8');
        res.body.answers[3].answerType.should.equals('Link');
        res.body.answers[3].link.should.equals('https://example.com');
        res.body.answers[3].imageUrl.should.equals(`${process.env.PUBLIC_IMAGE_BASE_URL}/link/8/460x460/preview.jpg`);
        res.body.answers[3].title.should.equals('link8Title');
        res.body.answers[3].description.should.equals('www.dumonda.me description link');
        res.body.answers[3].descriptionHtml.should.equals('<a href="http://www.dumonda.me" class="linkified" target="_blank" rel="noopener">www.dumonda.me</a> description link');
        res.body.answers[3].pageType.should.equals('blog');
        res.body.answers[3].upVotes.should.equals(0);
        res.body.answers[3].isAdmin.should.equals(false);
        res.body.answers[3].hasVoted.should.equals(false);
        res.body.answers[3].created.should.equals(498);
        res.body.answers[3].creator.name.should.equals('user Meier2');
        res.body.answers[3].creator.userId.should.equals('2');
        res.body.answers[3].creator.slug.should.equals('user-meier2');
        res.body.answers[3].creator.userImage.should.equals('profileImage/2/thumbnail.jpg');
        res.body.answers[3].creator.userImagePreview.should.equals('profileImage/2/profilePreview.jpg');
        res.body.answers[3].creator.isLoggedInUser.should.equals(false);
        res.body.answers[3].creator.isTrustUser.should.equals(false);
        res.body.answers[3].creator.isHarvestingUser.should.equals(false);
        res.body.answers[3].numberOfNotes.should.equals(0);

        res.body.answers[4].answerId.should.equals('9');
        res.body.answers[4].answerType.should.equals('Book');
        res.body.answers[4].imageUrl.should.equals(`${process.env.PUBLIC_IMAGE_BASE_URL}/book/9/120x250/preview.jpg`);
        res.body.answers[4].title.should.equals('book9Title');
        res.body.answers[4].description.should.equals('www.dumonda.me description book');
        res.body.answers[4].descriptionHtml.should.equals('<a href="http://www.dumonda.me" class="linkified" target="_blank" rel="noopener">www.dumonda.me</a> description book');
        res.body.answers[4].googleBookId.should.equals('1234');
        res.body.answers[4].authors.should.equals('Hans Wurst');
        res.body.answers[4].upVotes.should.equals(0);
        res.body.answers[4].isAdmin.should.equals(false);
        res.body.answers[4].hasVoted.should.equals(false);
        res.body.answers[4].created.should.equals(497);
        res.body.answers[4].creator.name.should.equals('user Meier3');
        res.body.answers[4].creator.userId.should.equals('3');
        res.body.answers[4].creator.slug.should.equals('user-meier3');
        res.body.answers[4].creator.userImage.should.equals('profileImage/3/thumbnail.jpg');
        res.body.answers[4].creator.userImagePreview.should.equals('profileImage/3/profilePreview.jpg');
        res.body.answers[4].creator.isLoggedInUser.should.equals(false);
        res.body.answers[4].creator.isTrustUser.should.equals(false);
        res.body.answers[4].creator.isHarvestingUser.should.equals(false);
        res.body.answers[4].numberOfNotes.should.equals(0);

        res.body.answers[5].answerId.should.equals('11');
        res.body.answers[5].commitmentId.should.equals('2');
        res.body.answers[5].answerType.should.equals('Commitment');
        res.body.answers[5].imageUrl.should.equals(`${process.env.PUBLIC_IMAGE_BASE_URL}/commitment/2/460x460/title.jpg?v=701`);
        res.body.answers[5].title.should.equals('Das ist ein Engagement ♥');
        res.body.answers[5].commitmentSlug.should.equals('das-ist-ein-engagement-love');
        res.body.answers[5].description.should.equals('www.dumonda.me description commitment');
        res.body.answers[5].descriptionHtml.should.equals('<a href="http://www.dumonda.me" class="linkified" target="_blank" rel="noopener">www.dumonda.me</a> description commitment');
        res.body.answers[5].upVotes.should.equals(0);
        res.body.answers[5].isAdmin.should.equals(false);
        res.body.answers[5].hasVoted.should.equals(false);
        res.body.answers[5].created.should.equals(496);
        res.body.answers[5].regions.length.should.equals(2);
        res.body.answers[5].regions.should.include('Region1De');
        res.body.answers[5].regions.should.include('Region2De');
        res.body.answers[5].creator.name.should.equals('user Meier2');
        res.body.answers[5].creator.userId.should.equals('2');
        res.body.answers[5].creator.slug.should.equals('user-meier2');
        res.body.answers[5].creator.userImage.should.equals('profileImage/2/thumbnail.jpg');
        res.body.answers[5].creator.userImagePreview.should.equals('profileImage/2/profilePreview.jpg');
        res.body.answers[5].creator.isLoggedInUser.should.equals(false);
        res.body.answers[5].creator.isTrustUser.should.equals(false);
        res.body.answers[5].creator.isHarvestingUser.should.equals(false);
        res.body.answers[5].events.length.should.equals(2);
        res.body.answers[5].events[0].eventId.should.equals('23');
        res.body.answers[5].events[0].title.should.equals('event23Title');
        res.body.answers[5].events[0].startDate.should.equals(startTime - 101);
        res.body.answers[5].events[0].endDate.should.equals(startTime + 201);
        res.body.answers[5].events[0].location.should.equals('event23Location');
        res.body.answers[5].events[0].region.should.equals('Region3De');
        res.body.answers[5].events[1].eventId.should.equals('22');
        res.body.answers[5].events[1].title.should.equals('event22Title');
        res.body.answers[5].events[1].startDate.should.equals(startTime - 100);
        res.body.answers[5].events[1].endDate.should.equals(startTime + 200);
        res.body.answers[5].events[1].location.should.equals('event22Location');
        res.body.answers[5].events[1].region.should.equals('Region2De');
    });

    it('Getting default answer with only images', async function () {
        dbDsl.createQuestion('10', {
            creatorId: '1', question: 'Das ist eine Frage', description: 'Test dumonda.me change the world',
            topics: ['topic1', 'topic2'], language: 'de', modified: 700
        });
        dbDsl.createDefaultAnswer('55', {
            creatorId: '1', questionId: '10', created: 600, hasImage: true
        });

        await dbDsl.sendToDb();
        await requestHandler.login(users.validUser);
        let res = await requestHandler.get('/api/question/answer', {questionId: '10', page: 0, language: 'de'});
        res.status.should.equal(200);

        res.body.hasMoreAnswers.should.equals(false);
        res.body.answers.length.should.equals(1);
        res.body.answers[0].answerId.should.equals('55');
        res.body.answers[0].answerType.should.equals('Default');
        res.body.answers[0].imageUrl.should.equals(`${process.env.PUBLIC_IMAGE_BASE_URL}/defaultAnswer/55/500x800/title.jpg?v=600`);
        should.not.exist(res.body.answers[0].answer);
        should.not.exist(res.body.answers[0].answerHtml);
        res.body.answers[0].upVotes.should.equals(0);
    });

    it('Getting answers of a question sorted by up votes', async function () {
        dbDsl.upVoteAnswer({userId: '1', answerId: '6'});
        dbDsl.upVoteAnswer({userId: '4', answerId: '7'});
        dbDsl.upVoteAnswer({userId: '5', answerId: '7'});
        await dbDsl.sendToDb();
        await requestHandler.login(users.validUser);
        let res = await requestHandler.get('/api/question/answer', {questionId: '1', page: 0, language: 'de'});
        res.status.should.equal(200);

        res.body.hasMoreAnswers.should.equals(false);
        res.body.answers.length.should.equals(6);
        res.body.answers[0].answerId.should.equals('7');
        res.body.answers[0].answerType.should.equals('Youtube');

        res.body.answers[1].answerId.should.equals('6');
        res.body.answers[1].answerType.should.equals('Default');

        res.body.answers[2].answerId.should.equals('5');
        res.body.answers[2].answerType.should.equals('Default');

        res.body.answers[3].answerId.should.equals('8');
        res.body.answers[3].answerType.should.equals('Link');

        res.body.answers[4].answerId.should.equals('9');
        res.body.answers[4].answerType.should.equals('Book');

        res.body.answers[5].answerId.should.equals('11');
        res.body.answers[5].commitmentId.should.equals('2');
        res.body.answers[5].answerType.should.equals('Commitment');
    });

    it('Getting answers of a question when not logged in', async function () {
        dbDsl.watchQuestion({questionId: '1', userId: '1'});
        dbDsl.watchQuestion({questionId: '1', userId: '4'});
        await dbDsl.sendToDb();
        let res = await requestHandler.get('/api/question/answer', {questionId: '1', page: 0, language: 'de'});
        res.status.should.equal(200);

        res.body.hasMoreAnswers.should.equals(false);
        res.body.answers.length.should.equals(6);
        res.body.answers[0].answerId.should.equals('5');
        res.body.answers[0].answerType.should.equals('Default');

        res.body.answers[1].answerId.should.equals('6');
        res.body.answers[1].answerType.should.equals('Default');

        res.body.answers[2].answerId.should.equals('7');
        res.body.answers[2].answerType.should.equals('Youtube');

        res.body.answers[3].answerId.should.equals('8');
        res.body.answers[3].answerType.should.equals('Link');

        res.body.answers[4].answerId.should.equals('9');
        res.body.answers[4].answerType.should.equals('Book');

        res.body.answers[5].answerId.should.equals('11');
        res.body.answers[5].commitmentId.should.equals('2');
        res.body.answers[5].answerType.should.equals('Commitment');
    });

    it('Has next answers', async function () {
        for (let index = 12; index < 27; index++) {
            dbDsl.createDefaultAnswer(`${index}`, {
                creatorId: '1', questionId: '1', answer: 'Answer', created: 600 + index,
            });
        }
        await dbDsl.sendToDb();
        let res = await requestHandler.get('/api/question/answer', {questionId: '1', page: 0, language: 'de'});
        res.status.should.equal(200);

        res.body.answers.length.should.equals(20);
        res.body.hasMoreAnswers.should.equals(true);
    });

    it('Getting next answers', async function () {
        for (let index = 12; index < 27; index++) {
            dbDsl.createDefaultAnswer(`${index}`, {
                creatorId: '1', questionId: '1', answer: 'Answer', created: 1000 + index,
            });
        }
        await dbDsl.sendToDb();
        let res = await requestHandler.get('/api/question/answer', {questionId: '1', page: 1, language: 'de'});
        res.status.should.equal(200);

        res.body.answers.length.should.equals(1);
        res.body.answers[0].answerId.should.equals('11');
        res.body.hasMoreAnswers.should.equals(false);
    });
});
