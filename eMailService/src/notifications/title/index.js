const i18next = require('i18next');
const user = require('../user');

const createdAnswer = function (notification, language) {
    let answerCreator = notification.originators[0];
    let question = notification.notificationObjects.find((n) => typeof n.questionId === 'string');
    return i18next.t('notification:createdAnswer.title',
        {name: user.getUserName(answerCreator, language), question: question.question, lng: language});
};

const newQuestion = function (notification, language) {
    let questionCreator = notification.originators[0];
    return i18next.t('notification:newQuestion.title',
        {name: user.getUserName(questionCreator, language), lng: language});
};

const addedToTrustCircle = function (notification, language) {
    let user = notification.originators[0].originator;
    return i18next.t('notification:addedToTrustCircle.title', {name: user.name, lng: language});
};

const invitedUserHasRegistered = function (notification, language) {
    let user = notification.originators[0].originator;
    return i18next.t('notification:invitedUserHasRegistered.title', {name: user.name, lng: language});
};

const requestAdminOfCommitment = function (notification, language) {
    let commitment = notification.notificationObjects[0];
    return i18next.t('notification:adminOfCommitmentRequest.title', {commitment: commitment.title, lng: language});
};

const notificationsHandler = {
    newQuestion, createdAnswer, addedToTrustCircle, invitedUserHasRegistered, requestAdminOfCommitment
};

const getTitleOfNotification = function (notifications, numberOfNotifications, language) {
    let title = i18next.t('notification:noPreview.emailTitle', {count: numberOfNotifications, lng: language});
    let setTitle = false;
    for (let notification of notifications) {
        if (notification.notification && typeof notificationsHandler[notification.notification.type] === 'function') {
            title = notificationsHandler[notification.notification.type](notification, language);
            setTitle = true;
        }
    }
    if (numberOfNotifications > 1 && setTitle) {
        title += ' ' + i18next.t('notification:common.andMore', {lng: language});
    }
    return title;
};


module.exports = {
    getTitleOfNotification
};
