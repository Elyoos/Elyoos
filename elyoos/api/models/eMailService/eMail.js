"use strict";
let emailService = require('elyoos-server-lib').eMailService;
let emailQueue = require('elyoos-server-lib').eMailQueue;
let messageReceivedJob = require('./jobs/messageReceivedJob');
let resetPasswordJob = require('./jobs/resetPasswordJob');
let registerUserRequestJob = require('./jobs/registerUserRequestJob');
let sendInviteEmailJob = require('./jobs/sendInviteEmailJob');

let startEmailService = function () {
    emailQueue.addJobDefinition('messageReceived', messageReceivedJob.processDefinition);
    emailQueue.addJobDefinition('resetPassword', resetPasswordJob.processDefinition);
    emailQueue.addJobDefinition('registerUserRequest', registerUserRequestJob.processDefinition);
    emailQueue.addJobDefinition('sendInviteEmail', sendInviteEmailJob.processDefinition);
    emailService.startEmailService();
};

module.exports = {
    start: startEmailService
};