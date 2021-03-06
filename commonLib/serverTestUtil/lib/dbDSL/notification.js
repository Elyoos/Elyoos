'use strict';

const db = require('../db');
const dbConnectionHandling = require('./dbConnectionHandling');

const showQuestionOnCommitmentRequest = function (notificationId, data) {
    let readLabel = ':Unread';
    if (data.read) {
        readLabel = '';
    }
    if (typeof data.showQuestion === 'undefined') {
        data.showQuestion = null;
    }
    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(c:Commitment {commitmentId: {commitmentId}}), (admin:User {userId: {adminId}}), 
                (q:Question {questionId: {questionId}})`)
        .merge(`(q)<-[:NOTIFICATION]-(notification:Notification${readLabel} {type: 'showQuestionRequest', 
                                      created: {created}, notificationId: {notificationId}})-[:NOTIFIED]->(admin)`)
        .merge(`(c)<-[:NOTIFICATION]-(notification)`)
        .set('notification', {showQuestion: data.showQuestion})
        .end({
            notificationId,
            commitmentId: data.commitmentId,
            questionId: data.questionId,
            adminId: data.adminId,
            created: data.created
        }).getCommand());
};

const userAddedToTrustCircle = function (notificationId, data) {
    let readLabel = ':Unread', sentLabel = '';
    if (data.read) {
        readLabel = '';
    }
    if (data.emailSent) {
        readLabel = ':EmailSent';
    }
    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(userAddedToTrustCircle:User {userId: {userId}})`)
        .merge(`(userAddedToTrustCircle)<-[:NOTIFIED]-(notification:Notification${readLabel}${sentLabel} {type: 'addedToTrustCircle', 
                                      created: {created}, notificationId: {notificationId}})`)
        .with(`notification`)
        .unwind(`{trustCircleUsers} AS trustCircleUser`)
        .match(`(user:User)`)
        .where(`user.userId = trustCircleUser.userId`)
        .merge(`(user)<-[:ORIGINATOR_OF_NOTIFICATION {created: trustCircleUser.created}]-(notification)`)
        .end({
            notificationId,
            userId: data.userId,
            trustCircleUsers: data.trustCircleUsers,
            created: data.created
        }).getCommand());
};

const invitedUserHasRegistered = function (notificationId, data) {
    let readLabel = ':Unread';
    if (data.read) {
        readLabel = '';
    }
    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(user:User {userId: {userId}}), (invitedUser:User {userId: {invitedUserId}})`)
        .merge(`(user)<-[:NOTIFIED]-(notification:Notification${readLabel} {type: 'invitedUserHasRegistered', 
                                      created: {created}, notificationId: {notificationId}})
                 -[:ORIGINATOR_OF_NOTIFICATION]->(invitedUser)`)
        .end({
            notificationId, userId: data.userId, invitedUserId: data.invitedUserId, created: data.created
        }).getCommand());
};

const userWatchesCommitment = function (notificationId, data) {
    let readLabel = ':Unread';
    if (data.read) {
        readLabel = '';
    }
    dbConnectionHandling.getCommands().push(db.cypher()
        .merge(`(notification:Notification${readLabel} {type: 'watchingCommitment', 
                                      created: {created}, notificationId: {notificationId}})`)
        .with(`notification`)
        .match(`(admin:User)-[:IS_ADMIN]->(c:Commitment {commitmentId: {commitmentId}})`)
        .merge(`(admin)<-[:NOTIFIED]-(notification)`)
        .merge(`(c)<-[:NOTIFICATION]-(notification)`)
        .with(`notification`)
        .unwind(`{watchingUsers} AS watchingUsers`)
        .match(`(user:User)`)
        .where(`user.userId = watchingUsers.userId`)
        .merge(`(user)<-[:ORIGINATOR_OF_NOTIFICATION {created: watchingUsers.created}]-(notification)`)
        .end({
            notificationId,
            commitmentId: data.commitmentId,
            watchingUsers: data.watchingUsers,
            created: data.created
        }).getCommand());
};

const userWatchesQuestion = function (notificationId, data) {
    let readLabel = ':Unread';
    if (data.read) {
        readLabel = '';
    }
    dbConnectionHandling.getCommands().push(db.cypher()
        .merge(`(notification:Notification${readLabel} {type: 'watchingQuestion', 
                 created: {created}, notificationId: {notificationId}})`)
        .with(`notification`)
        .match(`(creator:User)-[:IS_CREATOR]->(q:Question {questionId: {questionId}})`)
        .merge(`(creator)<-[:NOTIFIED]-(notification)`)
        .merge(`(q)<-[:NOTIFICATION]-(notification)`)
        .with(`notification`)
        .unwind(`{watchingUsers} AS watchingUsers`)
        .match(`(user:User)`)
        .where(`user.userId = watchingUsers.userId`)
        .merge(`(user)<-[:ORIGINATOR_OF_NOTIFICATION {created: watchingUsers.created}]-(notification)`)
        .end({
            notificationId,
            questionId: data.questionId,
            watchingUsers: data.watchingUsers,
            created: data.created
        }).getCommand());
};

const userCreatedQuestion = function (data) {
    let readLabel = ':Unread';
    if (data.read) {
        readLabel = '';
    }
    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(q:Question {questionId: {questionId}})<-[:IS_CREATOR]-(creator:User)<-[:IS_CONTACT]-(notifiedUser:User)`)
        .create(`(notification:Notification${readLabel} {type: 'newQuestion', created: {created},` +
            `notificationId: randomUUID()})`)
        .merge(`(creator)<-[:ORIGINATOR_OF_NOTIFICATION {created: {created}}]-(notification)`)
        .merge(`(notification)-[:NOTIFICATION]->(q)`)
        .merge(`(notification)-[:NOTIFIED]->(notifiedUser)`)
        .end({
            questionId: data.questionId,
            created: data.created
        }).getCommand());
};

const userCreatedCommitment = function (data) {
    let readLabel = ':Unread';
    if (data.read) {
        readLabel = '';
    }
    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(c:Commitment {commitmentId: {commitmentId}})<-[:IS_CREATOR]-(creator:User), 
                (notifiedUser:User {userId: {notifiedUserId}})`)
        .create(`(notification:Notification${readLabel} {type: 'newCommitment', created: {created},` +
            `notificationId: randomUUID()})`)
        .merge(`(creator)<-[:ORIGINATOR_OF_NOTIFICATION]-(notification)`)
        .merge(`(notification)-[:NOTIFICATION]->(c)`)
        .merge(`(notification)-[:NOTIFIED]->(notifiedUser)`)
        .end({
            commitmentId: data.commitmentId,
            created: data.created,
            notifiedUserId: data.notifiedUserId
        }).getCommand());
};

const createdCommitmentCreator = function (data) {
    let readLabel = ':Unread';
    if (data.read) {
        readLabel = '';
    }
    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(c:Commitment {commitmentId: {commitmentId}})<-[:IS_CREATOR]-(creator:User)`)
        .create(`(notification:Notification${readLabel} {type: 'newCommitmentCreator', created: {created},` +
            `notificationId: randomUUID()})`)
        .merge(`(notification)-[:NOTIFICATION]->(c)`)
        .merge(`(notification)-[:NOTIFIED]->(creator)`)
        .end({
            commitmentId: data.commitmentId,
            created: data.created,
        }).getCommand());
};

const createAnswer = function (notificationId, data) {
    let readLabel = ':Unread';
    if (data.read) {
        readLabel = '';
    }
    dbConnectionHandling.getCommands().push(db.cypher()
        .merge(`(notification:Notification${readLabel} {type: 'createdAnswer', 
                                      created: {created}, notificationId: {notificationId}})`)
        .with(`notification`)
        .match(`(creator:User)-[:IS_CREATOR]->(q:Question {questionId: {questionId}})`)
        .merge(`(creator)<-[:NOTIFIED]-(notification)`)
        .merge(`(q)<-[:NOTIFICATION]-(notification)`)
        .with(`notification`)
        .match(`(user:User)-[:IS_CREATOR]-(answer:Answer {answerId: {answerId}})`)
        .merge(`(user)<-[:ORIGINATOR_OF_NOTIFICATION {created: {created}}]-(notification)`)
        .merge(`(answer)<-[:NOTIFICATION]-(notification)`)
        .with(`notification, answer`)
        .match(`(answer)-[:COMMITMENT]->(commitment:Commitment)`)
        .merge(`(commitment)<-[:NOTIFICATION]-(notification)`)
        .end({
            notificationId,
            questionId: data.questionId,
            answerId: data.answerId,
            created: data.created
        }).getCommand());
};

const createNote = function (notificationId, data) {
    let readLabel = ':Unread';
    if (data.read) {
        readLabel = '';
    }
    dbConnectionHandling.getCommands().push(db.cypher()
        .merge(`(notification:Notification${readLabel} {type: 'createdNote', 
                                      created: {created}, notificationId: {notificationId}})`)
        .with(`notification`)
        .match(`(q:Question {questionId: {questionId}})`)
        .merge(`(q)<-[:NOTIFICATION]-(notification)`)
        .with(`notification`)
        .match(`(answer:Answer {answerId: {answerId}})<-[:IS_CREATOR]-(answerCreator:User)`)
        .merge(`(answer)<-[:NOTIFICATION]-(notification)`)
        .with(`notification, answer, answerCreator`)
        .match(`(user:User)-[:IS_CREATOR]-(note:Note {noteId: {noteId}})<-[:NOTE]-(a)`)
        .merge(`(user)<-[:ORIGINATOR_OF_NOTIFICATION {created: {created}}]-(notification)`)
        .merge(`(note)<-[:NOTIFICATION]-(notification)`)
        .merge(`(answerCreator)<-[:NOTIFIED]-(notification)`)
        .end({
            notificationId,
            questionId: data.questionId,
            answerId: data.answerId,
            noteId: data.noteId,
            created: data.created
        }).getCommand());
};

const requestAdminOfCommitment = function (notificationId, data) {
    let readLabel = ':Unread';
    if (data.read) {
        readLabel = '';
    }
    dbConnectionHandling.getCommands().push(db.cypher()
        .merge(`(notification:Notification${readLabel} {type: 'requestAdminOfCommitment', 
                                      created: {created}, notificationId: {notificationId}})`)
        .with(`notification`)
        .match(`(c:Commitment {commitmentId: {commitmentId}})`)
        .merge(`(c)<-[:NOTIFICATION]-(notification)`)
        .with(`notification`)
        .match(`(existingAdmin:User {userId: {existingAdminId}})`)
        .merge(`(existingAdmin)<-[:ORIGINATOR_OF_NOTIFICATION {created: {created}}]-(notification)`)
        .with(`notification`)
        .match(`(newAdmin:User {userId: {newAdminId}})`)
        .merge(`(newAdmin)<-[:NOTIFIED {created: {created}}]-(notification)`)
        .end({
            notificationId,
            commitmentId: data.commitmentId,
            existingAdminId: data.existingAdminId,
            newAdminId: data.newAdminId,
            created: data.created
        }).getCommand());
};

const oneTimeWelcome = function (notificationId, data) {
    oneTime(notificationId, data, 'oneTimeWelcome');
};

const oneTimeWatchQuestion = function (notificationId, data) {
    oneTime(notificationId, data, 'oneTimeWatchQuestion');
};

const oneTimeWatchFirstQuestion = function (notificationId, data) {
    oneTime(notificationId, data, 'oneTimeWatchingFirstQuestion');
};

const oneTimeWatchFirstCommitment = function (notificationId, data) {
    oneTime(notificationId, data, 'oneTimeWatchingFirstCommitment');
};

const oneTimeFirstAnswer = function (notificationId, data) {
    oneTime(notificationId, data, 'oneTimeFirstAnswer');
};

const oneTimeFirstQuestion = function (notificationId, data) {
    oneTime(notificationId, data, 'oneTimeFirstQuestion');
};

const oneTimeFirstCommitment = function (notificationId, data) {
    oneTime(notificationId, data, 'oneTimeFirstCommitment');
};

const oneTimeUpVoteFirstAnswer = function (notificationId, data) {
    oneTime(notificationId, data, 'oneTimeUpVoteFirstAnswer');
};

const oneTimeChallengeUpVoteAnswer = function (notificationId, data) {
    oneTime(notificationId, data, 'oneTimeChallengeUpVoteAnswer');
};

const oneTimeChallengeWatchCommitment = function (notificationId, data) {
    oneTime(notificationId, data, 'oneTimeChallengeWatchCommitment');
};

const oneTimeChallengeCreateCommitment = function (notificationId, data) {
    oneTime(notificationId, data, 'oneTimeChallengeCreateCommitment');
};

const oneTimeInviteFriends = function (notificationId, data) {
    oneTime(notificationId, data, 'oneTimeInviteFriends');
};

const oneTimeFirstTrustCircleUser = function (notificationId, data) {
    oneTime(notificationId, data, 'oneTimeFirstTrustCircleUser');
};

const oneTimeChallengeComplete = function (notificationId, data) {
    oneTime(notificationId, data, 'oneTimeChallengeComplete');
};

const oneTime = function (notificationId, data, type) {
    let readLabel = ':Unread';
    if (data.read) {
        readLabel = '';
    }
    dbConnectionHandling.getCommands().push(db.cypher().match(`(u:User {userId: {userId}})`)
        .merge(`(u)<-[:NOTIFIED]-(notification:Notification:NoEmail:OneTime${readLabel} {type: {type}, 
                                      created: {created}, notificationId: {notificationId}})`)
        .end({
            notificationId, userId: data.userId, created: data.created, type
        }).getCommand());
};

module.exports = {
    showQuestionOnCommitmentRequest,
    userAddedToTrustCircle,
    invitedUserHasRegistered,
    userWatchesCommitment,
    userWatchesQuestion,
    userCreatedQuestion,
    userCreatedCommitment,
    createdCommitmentCreator,
    createAnswer,
    createNote,
    requestAdminOfCommitment,
    oneTimeWelcome,
    oneTimeWatchQuestion,
    oneTimeWatchFirstQuestion,
    oneTimeWatchFirstCommitment,
    oneTimeFirstAnswer,
    oneTimeFirstQuestion,
    oneTimeFirstCommitment,
    oneTimeUpVoteFirstAnswer,
    oneTimeChallengeUpVoteAnswer,
    oneTimeInviteFriends,
    oneTimeFirstTrustCircleUser,
    oneTimeChallengeWatchCommitment,
    oneTimeChallengeCreateCommitment,
    oneTimeChallengeComplete
};