'use strict';

let users = require('elyoos-server-test-util').user;
let dbDsl = require('elyoos-server-test-util').dbDSL;
let requestHandler = require('elyoos-server-test-util').requestHandler;
let db = require('elyoos-server-test-util').db;
let moment = require('moment');

describe('Integration Tests creating bug feedback', function () {

    let requestAgent, startTime;

    beforeEach(function () {
        startTime = Math.floor(moment.utc().valueOf() / 1000);
        return dbDsl.init(4);
    });

    afterEach(function () {
        return requestHandler.logout();
    });


    it('Create bug feedback', function () {

        dbDsl.createFeedbackBug('1', {creatorUserId: '1', created: 500});
        dbDsl.createFeedbackBug('2', {creatorUserId: '4', created: 503, status: 'closed'});
        dbDsl.createFeedbackIdea('3', {creatorUserId: '1', created: 504});
        dbDsl.createFeedbackIdea('4', {creatorUserId: '3', created: 506, modified: 507, status: 'closed'});
        dbDsl.createFeedbackDiscussion('5', {creatorUserId: '1', created: 507});
        dbDsl.createFeedbackDiscussion('6', {creatorUserId: '2', created: 508, modified: 509, status: 'closed'});

        return dbDsl.sendToDb().then(function () {
            return requestHandler.login(users.validUser);
        }).then(function (agent) {
            requestAgent = agent;
            return requestHandler.post('/api/user/feedback/create/bug', {
                title: 'title',
                description: 'description',
                screen: 'desktop',
                browser: 'chrome',
                operatingSystem: 'linux'
            }, requestAgent);
        }).then(function (res) {
            res.status.should.equal(200);
            res.body.created.should.be.at.least(startTime);
            res.body.creator.name.should.be.at.least('user Meier');
            return db.cypher().match("(feedback:Feedback:Bug {feedbackId: {feedbackId}})<-[:IS_CREATOR]-(:User {userId: '1'})")
                .return('feedback')
                .end({feedbackId: res.body.feedbackId}).send();
        }).then(function (feedback) {
            feedback.length.should.equals(1);
            feedback[0].feedback.created.should.be.at.least(startTime);
            feedback[0].feedback.title.should.equals("title");
            feedback[0].feedback.description.should.equals("description");
            feedback[0].feedback.status.should.equals("open");
            feedback[0].feedback.screen.should.equals("desktop");
            feedback[0].feedback.browser.should.equals("chrome");
            feedback[0].feedback.operatingSystem.should.equals("linux");
        });
    });
});
