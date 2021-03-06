'use strict';

const users = require('dumonda-me-server-test-util').user;
const dbDsl = require('dumonda-me-server-test-util').dbDSL;
const requestHandler = require('dumonda-me-server-test-util').requestHandler;
const moment = require('moment');

describe('Get details of a commitment', function () {

    let startTime;

    beforeEach(async function () {
        await dbDsl.init(8);
        startTime = Math.floor(moment.utc().valueOf() / 1000);

        dbDsl.createRegion('region-1', {de: 'Region1De', en: 'Region1En'});
        dbDsl.createRegion('region-2', {de: 'Region2De', en: 'Region2En'});
        dbDsl.createRegion('region-1-1', {parentRegionId: 'region-1', de: 'Region11De', en: 'Region11En'});
        dbDsl.createRegion('region-1-2', {parentRegionId: 'region-1', de: 'Region12De', en: 'Region12En'});

        dbDsl.createMainTopic({topicId: 'topic1', descriptionDe: 'topic1De', descriptionEn: 'topic1En'});
        dbDsl.createMainTopic({topicId: 'topic2', descriptionDe: 'topic2De', descriptionEn: 'topic2En'});
        dbDsl.createMainTopic({topicId: 'topic3', descriptionDe: 'topic3De', descriptionEn: 'topic3En'});

        dbDsl.createCommitment('1', {
            adminId: '1', topics: ['topic1', 'topic3'], language: 'de', created: 700, modified: 701,
            website: 'https://www.example.org/', regions: ['region-1-1', 'region-1-2']
        });

        dbDsl.createQuestion('10', {
            creatorId: '2', question: 'Das ist eine Frage', description: 'description',
            topics: ['topic1', 'topic2'], language: 'de', created: 533, modified: 700
        });
        dbDsl.createQuestion('11', {
            creatorId: '2', question: 'Das ist eine Frage2', description: 'description2',
            topics: ['topic1'], language: 'de', created: 544
        });
        dbDsl.createQuestion('12', {
            creatorId: '2', question: 'Das ist eine Frage3', description: 'description3',
            topics: ['topic1'], language: 'de', created: 555
        });

        dbDsl.createCommitmentAnswer('100', {
            creatorId: '1', questionId: '10', commitmentId: '1', created: 500, description: 'test'
        });
        dbDsl.createCommitmentAnswer('101', {
            creatorId: '2', questionId: '11', commitmentId: '1', created: 501, description: 'test2'
        });
        dbDsl.createCommitmentAnswer('102', {
            creatorId: '2', questionId: '12', commitmentId: '1', created: 502, description: 'test3'
        });

        dbDsl.createCommitmentEvent({commitmentId: '1', eventId: '22',
            startDate: startTime - 100, endDate: startTime + 200, regionId: 'region-2'});

        dbDsl.createCommitmentEvent({commitmentId: '1', eventId: '23',
            startDate: startTime - 300, endDate: startTime - 200, regionId: 'region-2'});
    });

    afterEach(function () {
        return requestHandler.logout();
    });

    it('Get a commitment (User is Admin and logged in)', async function () {
        dbDsl.showQuestionOnCommitment({questionId: '10', commitmentId: '1'});
        dbDsl.showQuestionOnCommitment({questionId: '11', commitmentId: '1'});
        dbDsl.upVoteAnswer({userId: '1', answerId: '100'});
        dbDsl.upVoteAnswer({userId: '4', answerId: '100'});
        dbDsl.watchCommitment({commitmentId: '1', userId: '5'});
        dbDsl.watchCommitment({commitmentId: '1', userId: '6'});

        await dbDsl.sendToDb();
        await requestHandler.login(users.validUser);
        let res = await requestHandler.get('/api/commitment', {commitmentId: '1', language: 'de'});
        res.status.should.equal(200);
        res.body.commitmentId.should.equals('1');
        res.body.title.should.equals('commitment1Title');
        res.body.description.should.equals('commitment1Description');
        res.body.imageUrl.should.equals(`${process.env.PUBLIC_IMAGE_BASE_URL}/commitment/1/320x320/title.jpg?v=701`);
        res.body.created.should.equals(700);
        res.body.website.should.equals('https://www.example.org/');
        res.body.lang.should.equals('de');
        res.body.numberOfWatches.should.equals(2);
        res.body.userWatchesCommitment.should.equals(false);
        res.body.regions.length.should.equals(2);
        res.body.regions.should.deep.include({id: 'region-1-1', description: 'Region11De'});
        res.body.regions.should.deep.include({id: 'region-1-2', description: 'Region12De'});
        res.body.isAdmin.should.equals(true);
        res.body.topics.length.should.equals(2);
        res.body.topics.should.deep.include({id: 'topic1', description: 'topic1De'});
        res.body.topics.should.deep.include({id: 'topic3', description: 'topic3De'});
        res.body.linkedWithQuestions.length.should.equals(2);
        res.body.linkedWithQuestions[0].questionId.should.equals('10');
        res.body.linkedWithQuestions[0].commitmentAnswerId.should.equals('100');
        res.body.linkedWithQuestions[0].isUpVotedByUser.should.equals(true);
        res.body.linkedWithQuestions[0].isCreatedByUser.should.equals(true);
        res.body.linkedWithQuestions[0].question.should.equals('Das ist eine Frage');
        res.body.linkedWithQuestions[0].slug.should.equals('das-ist-eine-frage');
        res.body.linkedWithQuestions[0].description.should.equals('description');
        res.body.linkedWithQuestions[0].upVotes.should.equals(2);
        res.body.linkedWithQuestions[1].questionId.should.equals('11');
        res.body.linkedWithQuestions[1].commitmentAnswerId.should.equals('101');
        res.body.linkedWithQuestions[1].isUpVotedByUser.should.equals(false);
        res.body.linkedWithQuestions[1].isCreatedByUser.should.equals(false);
        res.body.linkedWithQuestions[1].question.should.equals('Das ist eine Frage2');
        res.body.linkedWithQuestions[1].slug.should.equals('das-ist-eine-frage2');
        res.body.linkedWithQuestions[1].description.should.equals('description2');
        res.body.linkedWithQuestions[1].upVotes.should.equals(0);

        res.body.contributors.length.should.equals(1);
        res.body.contributors[0].userId.should.equals('1');
        res.body.contributors[0].name.should.equals('user Meier');
        res.body.contributors[0].slug.should.equals('user-meier');
        res.body.contributors[0].profileUrl.should.equals('profileImage/1/thumbnail.jpg');
        res.body.contributors[0].isLoggedInUser.should.equals(true);

        res.body.totalNumberOfEvents.should.equals(1);
        res.body.events.length.should.equals(1);
        res.body.events[0].eventId.should.equals('22');
        res.body.events[0].title.should.equals('event22Title');
        res.body.events[0].description.should.equals('event22Description');
        res.body.events[0].startDate.should.equals(startTime - 100);
        res.body.events[0].endDate.should.equals(startTime + 200);
        res.body.events[0].linkDescription.should.equals('https://example.org/22');
        res.body.events[0].region.id.should.equals('region-2');
        res.body.events[0].region.description.should.equals('Region2De');
        res.body.events[0].location.should.equals('event22Location');
    });

    it('Get a commitment (User is not Admin and logged in)', async function () {
        dbDsl.watchCommitment({commitmentId: '1', userId: '2'});
        await dbDsl.sendToDb();
        await requestHandler.login(users.validUser2);
        let res = await requestHandler.get('/api/commitment', {commitmentId: '1', language: 'en'});
        res.status.should.equal(200);
        res.body.commitmentId.should.equals('1');
        res.body.title.should.equals('commitment1Title');
        res.body.description.should.equals('commitment1Description');
        res.body.imageUrl.should.equals(`${process.env.PUBLIC_IMAGE_BASE_URL}/commitment/1/320x320/title.jpg?v=701`);
        res.body.created.should.equals(700);
        res.body.website.should.equals('https://www.example.org/');
        res.body.lang.should.equals('de');
        res.body.numberOfWatches.should.equals(1);
        res.body.userWatchesCommitment.should.equals(true);
        res.body.regions.length.should.equals(2);
        res.body.regions.should.deep.include({id: 'region-1-1', description: 'Region11En'});
        res.body.regions.should.deep.include({id: 'region-1-2', description: 'Region12En'});
        res.body.isAdmin.should.equals(false);
        res.body.topics.length.should.equals(2);
        res.body.topics.should.deep.include({id: 'topic1', description: 'topic1En'});
        res.body.topics.should.deep.include({id: 'topic3', description: 'topic3En'});
        res.body.linkedWithQuestions.length.should.equals(0);
        res.body.events.length.should.equals(1);
        res.body.totalNumberOfEvents.should.equals(1);

        res.body.contributors.length.should.equals(1);
        res.body.contributors[0].userId.should.equals('1');
        res.body.contributors[0].name.should.equals('user Meier');
        res.body.contributors[0].slug.should.equals('user-meier');
        res.body.contributors[0].profileUrl.should.equals('profileImage/1/thumbnail.jpg');
        res.body.contributors[0].isLoggedInUser.should.equals(false);
    });

    it('Get a commitment (User is not logged in)', async function () {
        dbDsl.showQuestionOnCommitment({questionId: '10', commitmentId: '1'});
        dbDsl.showQuestionOnCommitment({questionId: '11', commitmentId: '1'});
        dbDsl.upVoteAnswer({userId: '3', answerId: '100'});
        dbDsl.upVoteAnswer({userId: '4', answerId: '100'});
        dbDsl.watchCommitment({commitmentId: '1', userId: '1'});
        dbDsl.watchCommitment({commitmentId: '1', userId: '6'});

        await dbDsl.sendToDb();
        let res = await requestHandler.get('/api/commitment', {commitmentId: '1', language: 'de'});
        res.status.should.equal(200);
        res.body.commitmentId.should.equals('1');
        res.body.title.should.equals('commitment1Title');
        res.body.description.should.equals('commitment1Description');
        res.body.imageUrl.should.equals(`${process.env.PUBLIC_IMAGE_BASE_URL}/commitment/1/320x320/title.jpg?v=701`);
        res.body.created.should.equals(700);
        res.body.website.should.equals('https://www.example.org/');
        res.body.lang.should.equals('de');
        res.body.numberOfWatches.should.equals(2);
        res.body.userWatchesCommitment.should.equals(false);
        res.body.regions.length.should.equals(2);
        res.body.regions.should.deep.include({id: 'region-1-1', description: 'Region11De'});
        res.body.regions.should.deep.include({id: 'region-1-2', description: 'Region12De'});
        res.body.isAdmin.should.equals(false);
        res.body.topics.length.should.equals(2);
        res.body.topics.should.deep.include({id: 'topic1', description: 'topic1De'});
        res.body.topics.should.deep.include({id: 'topic3', description: 'topic3De'});
        res.body.linkedWithQuestions.length.should.equals(2);
        res.body.linkedWithQuestions[0].questionId.should.equals('10');
        res.body.linkedWithQuestions[0].commitmentAnswerId.should.equals('100');
        res.body.linkedWithQuestions[0].isUpVotedByUser.should.equals(false);
        res.body.linkedWithQuestions[0].isCreatedByUser.should.equals(false);
        res.body.linkedWithQuestions[0].question.should.equals('Das ist eine Frage');
        res.body.linkedWithQuestions[0].slug.should.equals('das-ist-eine-frage');
        res.body.linkedWithQuestions[0].description.should.equals('description');
        res.body.linkedWithQuestions[0].upVotes.should.equals(2);
        res.body.linkedWithQuestions[1].questionId.should.equals('11');
        res.body.linkedWithQuestions[1].commitmentAnswerId.should.equals('101');
        res.body.linkedWithQuestions[1].isUpVotedByUser.should.equals(false);
        res.body.linkedWithQuestions[1].isCreatedByUser.should.equals(false);
        res.body.linkedWithQuestions[1].question.should.equals('Das ist eine Frage2');
        res.body.linkedWithQuestions[1].slug.should.equals('das-ist-eine-frage2');
        res.body.linkedWithQuestions[1].description.should.equals('description2');
        res.body.linkedWithQuestions[1].upVotes.should.equals(0);
        res.body.events.length.should.equals(1);
        res.body.totalNumberOfEvents.should.equals(1);

        res.body.contributors.length.should.equals(1);
        res.body.contributors[0].userId.should.equals('1');
        res.body.contributors[0].name.should.equals('user Meier');
        res.body.contributors[0].slug.should.equals('user-meier');
        res.body.contributors[0].profileUrl.should.equals('profileImage/1/thumbnail.jpg');
        res.body.contributors[0].isLoggedInUser.should.equals(false);
    });

    it('Get non existing commitment', async function () {
        let res = await requestHandler.get('/api/commitment', {commitmentId: '2', language: 'de'});
        res.status.should.equal(404);
    });

});
