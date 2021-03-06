'use strict';

const users = require('dumonda-me-server-test-util').user;
const dbDsl = require('dumonda-me-server-test-util').dbDSL;
const requestHandler = require('dumonda-me-server-test-util').requestHandler;

describe('Notification when question of user has been answered', function () {

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

    it('Get notification when book answer has been created', async function () {
        dbDsl.createBookAnswer('5', {
            creatorId: '2', questionId: '1', created: 555, authors: 'Hans Wurst', googleBookId: '1234',
            hasPreviewImage: true
        });
        dbDsl.notificationCreateAnswer('20', {questionId: '1', answerId: '5', created: 678});

        await dbDsl.sendToDb();
        await requestHandler.login(users.validUser);
        let res = await requestHandler.get('/api/user/notification', {skip: 0, limit: 10});
        res.status.should.equal(200);
        res.body.numberOfUnreadNotifications.should.equals(1);
        res.body.hasMoreNotifications.should.equals(false);
        res.body.notifications.length.should.equals(1);
        res.body.notifications[0].notificationId.should.equals('20');
        res.body.notifications[0].read.should.equals(false);
        res.body.notifications[0].created.should.equals(678);
        res.body.notifications[0].type.should.equals('createdAnswer');
        res.body.notifications[0].answerType.should.equals('Book');
        res.body.notifications[0].questionId.should.equals('1');
        res.body.notifications[0].questionTitle.should.equals('Das ist eine FragöÖÄäÜü');
        res.body.notifications[0].questionSlug.should.equals('das-ist-eine-fragoeoeaeaeueue');
        res.body.notifications[0].answerId.should.equals('5');
        res.body.notifications[0].answerTitle.should.equals('book5Title');
        res.body.notifications[0].users.length.should.equals(1);
        res.body.notifications[0].users[0].userId.should.equals('2');
        res.body.notifications[0].users[0].name.should.equals('user Meier2');
        res.body.notifications[0].users[0].slug.should.equals('user-meier2');
        res.body.notifications[0].users[0].thumbnailUrl.should.equals('profileImage/2/thumbnail.jpg');
        res.body.notifications[0].users[0].isAnonymous.should.equals(false);
    });

    it('Get notification when link answer has been created', async function () {
        dbDsl.createCommitment('100', {
            adminId: '2', topics: ['Spiritual', 'Meditation'], language: 'de', created: 700,
            website: 'https://www.example.org/', regions: ['region-1'], title: 'Das ist ein Engagement'
        });
        dbDsl.createCommitmentAnswer('5', {
            creatorId: '2', questionId: '1', commitmentId: '100', created: 555, description: 'test'
        });

        dbDsl.notificationCreateAnswer('20', {questionId: '1', answerId: '5', created: 678});

        await dbDsl.sendToDb();
        await requestHandler.login(users.validUser);
        let res = await requestHandler.get('/api/user/notification', {skip: 0, limit: 10});
        res.status.should.equal(200);
        res.body.numberOfUnreadNotifications.should.equals(1);
        res.body.hasMoreNotifications.should.equals(false);
        res.body.notifications.length.should.equals(1);
        res.body.notifications[0].notificationId.should.equals('20');
        res.body.notifications[0].read.should.equals(false);
        res.body.notifications[0].created.should.equals(678);
        res.body.notifications[0].type.should.equals('createdAnswer');
        res.body.notifications[0].answerType.should.equals('CommitmentAnswer');
        res.body.notifications[0].questionId.should.equals('1');
        res.body.notifications[0].questionTitle.should.equals('Das ist eine FragöÖÄäÜü');
        res.body.notifications[0].questionSlug.should.equals('das-ist-eine-fragoeoeaeaeueue');
        res.body.notifications[0].answerId.should.equals('5');
        res.body.notifications[0].answerTitle.should.equals('Das ist ein Engagement');
        res.body.notifications[0].users.length.should.equals(1);
        res.body.notifications[0].users[0].userId.should.equals('2');
        res.body.notifications[0].users[0].name.should.equals('user Meier2');
        res.body.notifications[0].users[0].slug.should.equals('user-meier2');
        res.body.notifications[0].users[0].thumbnailUrl.should.equals('profileImage/2/thumbnail.jpg');
        res.body.notifications[0].users[0].isAnonymous.should.equals(false);
        res.body.notifications[0].users[0].isHarvestingUser.should.equals(false);
    });

    it('Get notification when book answer has been created', async function () {
        dbDsl.createLinkAnswer('5', {
            creatorId: '2', questionId: '1', created: 555, link: 'https://example.com', pageType: 'blog'
        });
        dbDsl.notificationCreateAnswer('20', {questionId: '1', answerId: '5', created: 678});

        await dbDsl.sendToDb();
        await requestHandler.login(users.validUser);
        let res = await requestHandler.get('/api/user/notification', {skip: 0, limit: 10});
        res.status.should.equal(200);
        res.body.numberOfUnreadNotifications.should.equals(1);
        res.body.hasMoreNotifications.should.equals(false);
        res.body.notifications.length.should.equals(1);
        res.body.notifications[0].notificationId.should.equals('20');
        res.body.notifications[0].read.should.equals(false);
        res.body.notifications[0].created.should.equals(678);
        res.body.notifications[0].type.should.equals('createdAnswer');
        res.body.notifications[0].answerType.should.equals('Link');
        res.body.notifications[0].questionId.should.equals('1');
        res.body.notifications[0].questionTitle.should.equals('Das ist eine FragöÖÄäÜü');
        res.body.notifications[0].questionSlug.should.equals('das-ist-eine-fragoeoeaeaeueue');
        res.body.notifications[0].answerId.should.equals('5');
        res.body.notifications[0].answerTitle.should.equals('link5Title');
        res.body.notifications[0].users.length.should.equals(1);
        res.body.notifications[0].users[0].userId.should.equals('2');
        res.body.notifications[0].users[0].name.should.equals('user Meier2');
        res.body.notifications[0].users[0].slug.should.equals('user-meier2');
        res.body.notifications[0].users[0].thumbnailUrl.should.equals('profileImage/2/thumbnail.jpg');
        res.body.notifications[0].users[0].isAnonymous.should.equals(false);
        res.body.notifications[0].users[0].isHarvestingUser.should.equals(false);
    });

    it('Get notification when text answer has been created', async function () {
        dbDsl.createDefaultAnswer('5', {creatorId: '2', questionId:'1', answer: 'Answer'});
        dbDsl.notificationCreateAnswer('20', {questionId: '1', answerId: '5', created: 678});

        await dbDsl.sendToDb();
        await requestHandler.login(users.validUser);
        let res = await requestHandler.get('/api/user/notification', {skip: 0, limit: 10});
        res.status.should.equal(200);
        res.body.numberOfUnreadNotifications.should.equals(1);
        res.body.hasMoreNotifications.should.equals(false);
        res.body.notifications.length.should.equals(1);
        res.body.notifications[0].notificationId.should.equals('20');
        res.body.notifications[0].read.should.equals(false);
        res.body.notifications[0].created.should.equals(678);
        res.body.notifications[0].type.should.equals('createdAnswer');
        res.body.notifications[0].answerType.should.equals('Default');
        res.body.notifications[0].questionId.should.equals('1');
        res.body.notifications[0].questionTitle.should.equals('Das ist eine FragöÖÄäÜü');
        res.body.notifications[0].questionSlug.should.equals('das-ist-eine-fragoeoeaeaeueue');
        res.body.notifications[0].answerId.should.equals('5');
        res.body.notifications[0].answerTitle.should.equals('Answer');
        res.body.notifications[0].users.length.should.equals(1);
        res.body.notifications[0].users[0].userId.should.equals('2');
        res.body.notifications[0].users[0].name.should.equals('user Meier2');
        res.body.notifications[0].users[0].slug.should.equals('user-meier2');
        res.body.notifications[0].users[0].thumbnailUrl.should.equals('profileImage/2/thumbnail.jpg');
        res.body.notifications[0].users[0].isAnonymous.should.equals(false);
        res.body.notifications[0].users[0].isHarvestingUser.should.equals(false);
    });

    it('Get notification when book answer has been created', async function () {
        dbDsl.createYoutubeAnswer('5', {
            creatorId: '2', questionId: '1', created: 555, idOnYoutube: 'Lhku7ZBWEK8',
            link: 'https://www.youtube.com/watch?v=Lhku7ZBWEK8', linkEmbed: 'https://www.youtube.com/embed/Lhku7ZBWEK8'
        });
        dbDsl.notificationCreateAnswer('20', {questionId: '1', answerId: '5', created: 678, read: true});
        dbDsl.setUserIsHarvestingUser('2', {start: 100, end: 200, link: 'https://www.link.ch', address: 'Milky Way'});

        await dbDsl.sendToDb();
        await requestHandler.login(users.validUser);
        let res = await requestHandler.get('/api/user/notification', {skip: 0, limit: 10});
        res.status.should.equal(200);
        res.body.numberOfUnreadNotifications.should.equals(0);
        res.body.hasMoreNotifications.should.equals(false);
        res.body.notifications.length.should.equals(1);
        res.body.notifications[0].notificationId.should.equals('20');
        res.body.notifications[0].read.should.equals(true);
        res.body.notifications[0].created.should.equals(678);
        res.body.notifications[0].type.should.equals('createdAnswer');
        res.body.notifications[0].answerType.should.equals('Youtube');
        res.body.notifications[0].questionId.should.equals('1');
        res.body.notifications[0].questionTitle.should.equals('Das ist eine FragöÖÄäÜü');
        res.body.notifications[0].questionSlug.should.equals('das-ist-eine-fragoeoeaeaeueue');
        res.body.notifications[0].answerId.should.equals('5');
        res.body.notifications[0].answerTitle.should.equals('youtube5Title');
        res.body.notifications[0].users.length.should.equals(1);
        res.body.notifications[0].users[0].userId.should.equals('2');
        res.body.notifications[0].users[0].name.should.equals('user Meier2');
        res.body.notifications[0].users[0].slug.should.equals('user-meier2');
        res.body.notifications[0].users[0].thumbnailUrl.should.equals('profileImage/2/thumbnail.jpg');
        res.body.notifications[0].users[0].isAnonymous.should.equals(false);
        res.body.notifications[0].users[0].isHarvestingUser.should.equals(true);
    });

    it('Show user as anonymous when onlyContact and no contact relationship', async function () {
        dbDsl.setUserPrivacy('2', {privacyMode: 'onlyContact'});

        dbDsl.createYoutubeAnswer('5', {
            creatorId: '2', questionId: '1', created: 555, idOnYoutube: 'Lhku7ZBWEK8',
            link: 'https://www.youtube.com/watch?v=Lhku7ZBWEK8', linkEmbed: 'https://www.youtube.com/embed/Lhku7ZBWEK8'
        });
        dbDsl.notificationCreateAnswer('20', {questionId: '1', answerId: '5', created: 678, read: true});

        await dbDsl.sendToDb();
        await requestHandler.login(users.validUser);
        let res = await requestHandler.get('/api/user/notification', {skip: 0, limit: 10});
        res.status.should.equal(200);
        res.body.numberOfUnreadNotifications.should.equals(0);
        res.body.hasMoreNotifications.should.equals(false);
        res.body.notifications.length.should.equals(1);
        res.body.notifications[0].notificationId.should.equals('20');
        res.body.notifications[0].read.should.equals(true);
        res.body.notifications[0].created.should.equals(678);
        res.body.notifications[0].type.should.equals('createdAnswer');
        res.body.notifications[0].answerType.should.equals('Youtube');
        res.body.notifications[0].questionId.should.equals('1');
        res.body.notifications[0].questionTitle.should.equals('Das ist eine FragöÖÄäÜü');
        res.body.notifications[0].questionSlug.should.equals('das-ist-eine-fragoeoeaeaeueue');
        res.body.notifications[0].answerId.should.equals('5');
        res.body.notifications[0].answerTitle.should.equals('youtube5Title');
        res.body.notifications[0].users.length.should.equals(1);
        res.body.notifications[0].users[0].userId.should.equals('2');
        res.body.notifications[0].users[0].name.should.equals('user Meier2');
        res.body.notifications[0].users[0].slug.should.equals('user-meier2');
        res.body.notifications[0].users[0].thumbnailUrl.should.equals('profileImage/default/thumbnail.jpg');
        res.body.notifications[0].users[0].isAnonymous.should.equals(true);
        res.body.notifications[0].users[0].isHarvestingUser.should.equals(false);
    });
});
