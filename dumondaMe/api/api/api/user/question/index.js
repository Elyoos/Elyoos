'use strict';

const validation = require('dumonda-me-server-lib').jsonValidation;
const topic = require("../../../schema/topic");
const language = require("../../../schema/language");
const questionCreate = requireModel('user/question/create');
const questionEdit = requireModel('user/question/edit');
const questionDelete = requireModel('user/question/delete');
const asyncMiddleware = require('dumonda-me-server-lib').asyncMiddleware;
const auth = require('dumonda-me-server-lib').auth;

const schemaCreateQuestion = {
    name: 'createQuestion',
    type: 'object',
    additionalProperties: false,
    required: ['question', 'topics', 'lang'],
    properties: {
        question: {type: 'string', format: 'notEmptyString', maxLength: 200},
        description: {type: 'string', format: 'notEmptyString', maxLength: 2000},
        topics: topic.topics,
        lang: language.language
    }
};

const schemaEditQuestion = {
    name: 'editQuestion',
    type: 'object',
    additionalProperties: false,
    required: ['questionId', 'question', 'lang'],
    properties: {
        questionId: {type: 'string', format: 'notEmptyString', maxLength: 60},
        question: {type: 'string', format: 'notEmptyString', maxLength: 200},
        description: {type: 'string', format: 'notEmptyString', maxLength: 2000},
        lang: language.language
    }
};

const schemaDeleteQuestion = {
    name: 'deleteQuestion',
    type: 'object',
    additionalProperties: false,
    required: ['questionId'],
    properties: {
        questionId: {type: 'string', format: 'notEmptyString', maxLength: 60}
    }
};

module.exports = function (router) {

    router.post('/', auth.isAuthenticated(), asyncMiddleware(async (req, res) => {
        const params = await validation.validateRequest(req, schemaCreateQuestion);
        let response = await questionCreate.createQuestion(req.user.id, params);
        res.status(200).json(response);
    }));

    router.put('/', auth.isAuthenticated(), asyncMiddleware(async (req, res) => {
        const params = await validation.validateRequest(req, schemaEditQuestion);
        let response = await questionEdit.editQuestion(req.user.id, params);
        res.status(200).json(response);
    }));

    router.delete('/', auth.isAuthenticated(), asyncMiddleware(async (req, res) => {
        const params = await validation.validateRequest(req, schemaDeleteQuestion);
        let response = await questionDelete.deleteQuestion(req.user.id, params.questionId);
        res.status(200).json(response);
    }));
};
