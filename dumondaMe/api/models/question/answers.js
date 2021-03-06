'use strict';

const db = requireDb();
const time = require('dumonda-me-server-lib').time;
const answerParser = require('./answer/answerParser');

const PAGE_SIZE = 20;

const answerFilter = function (answerId, harvestingId) {
    let filter = '';
    if (answerId) {
        filter = `answer.answerId = {answerId}`;
    } else if (harvestingId) {
        filter = `creator:HarvestingUser AND creator.userId = {harvestingId}`;
    }
    return filter;
};

const getAnswersCommand = function (questionId, answerId, harvestingId, page, userId) {
    let skip = page * PAGE_SIZE;
    return db.cypher()
        .match(`(q:Question {questionId: {questionId}})-[:ANSWER]->(answer:Answer)<-[:IS_CREATOR]-(creator:User)`)
        .where(answerFilter(answerId, harvestingId))
        .optionalMatch(`(answer)<-[upVotesRel:UP_VOTE]-(:User)`)
        .with(`q, creator, answer, count(DISTINCT upVotesRel) AS upVotes,
               creator.userId = {userId} AS isAdmin, labels(answer) AS answerType,
               EXISTS((:User {userId: {userId}})-[:UP_VOTE]->(answer)) AS hasVoted`)
        .orderBy(`upVotes DESC, answer.created DESC`)
        .optionalMatch(`(answer)-[:NOTE]->(note:Note)`)
        .optionalMatch(`(answer)-[:COMMITMENT]->(commitment:Commitment)-[:BELONGS_TO_REGION]-(region:Region)`)
        .with(`answer, creator, upVotes, isAdmin, hasVoted, commitment, answerType, region, note`)
        .orderBy(`upVotes DESC, answer.created DESC`)
        .optionalMatch(`(commitment)-[:EVENT]->(event:Event)-[:BELONGS_TO_REGION]->(eventRegion:Region)`)
        .where(`event.endDate > {now}`)
        .with(`answer, creator, upVotes, isAdmin, hasVoted, commitment, answerType, region, eventRegion, note, event`)
        .orderBy(`upVotes DESC, answer.created DESC, event.startDate`)
        .return(`DISTINCT answer, creator, upVotes, isAdmin, hasVoted, commitment, answerType, 
                 collect(DISTINCT region) AS regions, count(DISTINCT note) AS numberOfNotes,
                 collect(DISTINCT {event: event, region: eventRegion}) AS events,
                 EXISTS((:User {userId: {userId}})-[:IS_CONTACT]->(creator)) AS isTrustUser,
                 EXISTS((creator)-[:IS_CONTACT]->(:User {userId: {userId}})) AS creatorTrustUser,
                 ANY (label IN LABELS(answer) WHERE label = 'HasTitleImage') AS hasImage,
                 ANY (label IN LABELS(creator) WHERE label = 'HarvestingUser') AS isHarvestingUser`)
        .orderBy(`upVotes DESC, answer.created DESC`)
        .skip(`{skip}`)
        .limit(`${PAGE_SIZE + 1}`)
        .end({questionId, answerId, harvestingId, userId, skip, now: time.getNowUtcTimestamp()});
};

const getAnswers = async function (questionId, harvestingId, page, language, userId) {
    let response = await getAnswersCommand(questionId, null, harvestingId, page, userId).send();
    let question = {};
    question.hasMoreAnswers = response.length > PAGE_SIZE;
    if (question.hasMoreAnswers) {
        response = response.slice(0, PAGE_SIZE);
    }
    question.answers = await answerParser.getAnswers(response, language, userId);
    return question;
};

module.exports = {
    getAnswers,
    getAnswersCommand,
    PAGE_SIZE
};
