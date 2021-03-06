'use strict';

let db = require('../db');
let dbConnectionHandling = require('./dbConnectionHandling');

let createMainTopic = function ({topicId, descriptionDe, descriptionEn, similarDe, similarEn}) {
    similarDe = similarDe || [];
    similarEn = similarEn || [];
    dbConnectionHandling.getCommands().push(db.cypher()
        .create(`(:Topic {topicId: {topicId}, de: {descriptionDe}, en: {descriptionEn}, similarDe: {similarDe}, similarEn: {similarEn}})`)
        .end({topicId, descriptionDe, descriptionEn, similarDe, similarEn}).getCommand());
};

let createSubTopic = function ({parentTopicId, topicId, descriptionDe, descriptionEn, similarDe, similarEn}) {
    similarDe = similarDe || [];
    similarEn = similarEn || [];
    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(parentTopic:Topic {topicId: {parentTopicId}})`)
        .create(`(topic:Topic {topicId: {topicId}, de: {descriptionDe}, en: {descriptionEn}, similarDe: {similarDe}, similarEn: {similarEn}})`)
        .merge(`(parentTopic)-[:SUB_TOPIC]->(topic)`)
        .end({parentTopicId, topicId, descriptionDe, descriptionEn, similarDe, similarEn}).getCommand());
};

let createTopicSuggestion = function ({topic, created, userId}) {
    dbConnectionHandling.getCommands().push(db.cypher()
        .match(`(user:User {userId: {userId}})`)
        .create(`(suggestion:TopicSuggestion {topic: {topic}, created: {created}})`)
        .merge(`(user)-[:SUGGEST]->(suggestion)`)
        .end({topic, created, userId}).getCommand());
};

module.exports = {
    createMainTopic,
    createSubTopic,
    createTopicSuggestion
};