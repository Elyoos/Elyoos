'use strict';

var db = require('./../../../neo4j');
var moment = require('moment');
var uuid = require('./../../../lib/uuid');
var security = require('./../security');

var createPageReference = function (pageId) {
    var command = db.cypher();
    if (pageId) {
        command.with("explanation")
            .match("(page:Page {pageId: {pageId}})")
            .createUnique("(page)<-[:REFERENCE]-(explanation)")
            .return("explanation.explanationId AS explanationId");
    } else {
        command.return("explanation.explanationId AS explanationId");
    }
    return command.getCommandString();
};

var createExplanation = function (userId, questionId, description, pageId, req) {

    var timeCreatedExplanation = Math.floor(moment.utc().valueOf() / 1000),
        explanationId = uuid.generateUUID();
    return security.questionExists(questionId, req).then(function () {
        return db.cypher().match("(u:User {userId: {userId}}), (forumQuestion:ForumQuestion {questionId: {questionId}})")
            .createUnique("(u)-[:IS_ADMIN]->(explanation:ForumExplanation {explanationId: {explanationId}, description: {description}, " +
                "created: {timeCreatedQuestion}})<-[:HAS_EXPLANATION]-(forumQuestion)")
            .addCommand(createPageReference(pageId))
            .end({
                userId: userId,
                description: description,
                timeCreatedQuestion: timeCreatedExplanation,
                explanationId: explanationId,
                questionId: questionId,
                pageId: pageId
            })
            .send().then(function (resp) {
                return {explanationId: resp[0].explanationId};
            });
    });
};


module.exports = {
    createExplanation: createExplanation
};
