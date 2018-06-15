'use strict';

const dashify = require('dashify');
const cdn = require('elyoos-server-lib').cdn;
const db = requireDb();
const logger = require('elyoos-server-lib').logging.getLogger(__filename);

const getShowQuestionOnCommitmentRequest = function (notification) {
    let commitment = notification.infos.find((info) => typeof info.commitmentId === 'string');
    let question = notification.infos.find((info) => typeof info.questionId === 'string');
    return {
        notificationId: notification.notification.notificationId,
        created: notification.notification.created,
        type: notification.notification.type,
        commitmentId: commitment.commitmentId,
        commitmentTitle: commitment.title,
        commitmentSlug: dashify(commitment.title),
        questionId: question.questionId,
        question: question.question,
        questionSlug: dashify(question.question),
    }
};

const getNotificationWithOriginators = async function (notification) {
    let index, users = [];
    for (index = 0; index < 3 && index < notification.originators.length; index++) {
        let user = notification.originators[index];
        let created = notification.relOriginators[index].created;
        users.push({
            userId: user.userId,
            name: user.name,
            slug: dashify(user.name),
            added: created,
            thumbnailUrl: await cdn.getSignedUrl(`profileImage/${user.userId}/thumbnail.jpg`)
        });
    }
    return {
        notificationId: notification.notification.notificationId,
        users: users,
        numberOfUsers: notification.originators.length,
        created: notification.notification.created,
        type: notification.notification.type
    }
};

const addWatchingCommitmentProperties = function (notificationResponse, notification) {
    if (notificationResponse.type === 'watchingCommitment' && notification.infos.length === 1) {
        notificationResponse.commitmentId = notification.infos[0].commitmentId;
        notificationResponse.commitmentTitle = notification.infos[0].title;
        notificationResponse.commitmentSlug = dashify(notification.infos[0].title);
    }
};

const getResponse = async function (notifications) {
    let response = [];
    for (let notification of notifications) {
        if (notification.notification.type === 'showQuestionRequest') {
            response.push(getShowQuestionOnCommitmentRequest(notification));
        } else if (notification.notification.type === 'addedToTrustCircle' ||
            notification.notification.type === 'watchingCommitment') {
            let notificationResponse = await getNotificationWithOriginators(notification);
            addWatchingCommitmentProperties(notificationResponse, notification);
            response.push(notificationResponse);
        }
    }
    return response;
};

const getNumberOfNotificationsCommand = function (userId) {
    return db.cypher().match(`(:User {userId: {userId}})<-[:NOTIFIED]-(n:Notification)`)
        .return(`COUNT(DISTINCT n) AS numberOfNotifications`)
        .end({userId});
};

const getNumberOfNotifications = async function (userId) {
    let result = await getNumberOfNotificationsCommand(userId).send();
    return {numberOfNotifications: result[0].numberOfNotifications};
};

const getNotifications = async function (userId) {
    let result = await db.cypher()
        .match(`(:User {userId: {userId}})<-[:NOTIFIED]-(n:Notification)`)
        .optionalMatch(`(n)-[relInfo:NOTIFICATION]->(info)`)
        .optionalMatch(`(n)-[relOriginator:ORIGINATOR_OF_NOTIFICATION]->(originator:User)`)
        .with(`n, info, relInfo, originator, relOriginator`)
        .orderBy(`relOriginator.created DESC, relInfo.created DESC`)
        .return(`DISTINCT n AS notification, collect(DISTINCT info) AS infos, collect(DISTINCT relInfo) AS relInfos,
                 collect(DISTINCT originator) AS originators, collect(DISTINCT relOriginator) AS relOriginators`)
        .orderBy(`n.created DESC`)
        .end({userId}).send([getNumberOfNotificationsCommand(userId).getCommand()]);
    logger.info(`User ${userId} requested notifications`);
    return {
        notifications: await getResponse(result[1]),
        numberOfNotifications: result[0][0].numberOfNotifications
    };
};

module.exports = {
    getNotifications,
    getNumberOfNotifications
};
