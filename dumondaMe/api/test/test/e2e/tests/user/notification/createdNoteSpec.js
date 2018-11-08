'use strict';

const users = require('dumonda-me-server-test-util').user;
const dbDsl = require('dumonda-me-server-test-util').dbDSL;
const requestHandler = require('dumonda-me-server-test-util').requestHandler;

describe('Notification when note has been added to answer of user', function () {

    beforeEach(async function () {
        await dbDsl.init(5);

        dbDsl.createQuestion('1', {
            creatorId: '1', question: 'Das ist eine FragöÖÄäÜü', description: 'description', topics: ['Spiritual'],
            language: 'de'
        });
    });

    afterEach(function () {
        return requestHandler.logout();
    });

    it('Get notification when note has been added to answer', async function () {
        dbDsl.createBookAnswer('5', {
            creatorId: '1', questionId: '1', created: 555, authors: 'Hans Wurst', googleBookId: '1234',
            hasPreviewImage: true
        });
        dbDsl.createNote('50', {answerId: '5', creatorId: '2', created: 555});

        dbDsl.notificationCreateNote('100', {questionId: '1', answerId: '5', noteId: '50', created: 678});

        await dbDsl.sendToDb();
        await requestHandler.login(users.validUser);
        let res = await requestHandler.get('/api/user/notification');
        res.status.should.equal(200);
        res.body.numberOfNotifications.should.equals(1);
        res.body.notifications.length.should.equals(1);
        res.body.notifications[0].notificationId.should.equals('100');
        res.body.notifications[0].created.should.equals(678);
        res.body.notifications[0].type.should.equals('createdNote');
        res.body.notifications[0].questionId.should.equals('1');
        res.body.notifications[0].questionTitle.should.equals('Das ist eine FragöÖÄäÜü');
        res.body.notifications[0].questionSlug.should.equals('das-ist-eine-fragoeoeaeaeueue');
        res.body.notifications[0].answerId.should.equals('5');
        res.body.notifications[0].answerTitle.should.equals('book5Title');
        res.body.notifications[0].noteId.should.equals('50');
        res.body.notifications[0].noteText.should.equals('note50Text');
        res.body.notifications[0].users.length.should.equals(1);
        res.body.notifications[0].users[0].userId.should.equals('2');
        res.body.notifications[0].users[0].name.should.equals('user Meier2');
        res.body.notifications[0].users[0].slug.should.equals('user-meier2');
        res.body.notifications[0].users[0].thumbnailUrl.should.equals('profileImage/2/thumbnail.jpg');
    });
});