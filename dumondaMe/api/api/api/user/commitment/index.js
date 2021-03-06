'use strict';

const validation = require('dumonda-me-server-lib').jsonValidation;
const topic = require("../../../schema/topic");
const language = require("../../../schema/language");
const commitmentCreate = requireModel('user/commitment/create');
const commitmentEdit = requireModel('user/commitment/edit');
const commitmentDelete = requireModel('user/commitment/delete');
const asyncMiddleware = require('dumonda-me-server-lib').asyncMiddleware;
const auth = require('dumonda-me-server-lib').auth;
const apiHelper = require('dumonda-me-server-lib').apiHelper;

const schemaCreateCommitment = {
    name: 'createCommitment',
    type: 'object',
    additionalProperties: false,
    required: ['title', 'description', 'topics', 'regions', 'lang'],
    properties: {
        title: {type: 'string', format: 'notEmptyString', maxLength: 100},
        description: {type: 'string', format: 'notEmptyString', maxLength: 1000},
        topics: topic.topics,
        regions: {
            type: 'array',
            items: {type: 'string', format: 'notEmptyString', maxLength: 60},
            minItems: 1,
            maxItems: 50,
            uniqueItems: true
        },
        lang: language.language,
        website: {type: 'string', format: 'urlWithProtocol', maxLength: 2000}
    }
};

const schemaEditCommitment = {
    name: 'editCommitment',
    type: 'object',
    additionalProperties: false,
    required: ['commitmentId', 'title', 'description', 'lang'],
    properties: {
        commitmentId: {type: 'string', format: 'notEmptyString', maxLength: 60},
        title: {type: 'string', format: 'notEmptyString', maxLength: 100},
        description: {type: 'string', format: 'notEmptyString', maxLength: 1000},
        lang: language.language,
        website: {type: 'string', format: 'urlWithProtocol', maxLength: 2000},
        resetImage: {type: 'boolean'}
    }
};

const schemaDeleteCommitment = {
    name: 'deleteCommitment',
    type: 'object',
    additionalProperties: false,
    required: ['commitmentId'],
    properties: {
        commitmentId: {type: 'string', format: 'notEmptyString', maxLength: 60}
    }
};

module.exports = function (router) {

    router.post('/', auth.isAuthenticated(), asyncMiddleware(async (req, res) => {
        const params = await validation.validateRequest(req, schemaCreateCommitment);
        let response = await commitmentCreate.createCommitment(req.user.id, params, apiHelper.getFile(req));
        res.status(200).json(response);
    }));

    router.put('/:commitmentId', auth.isAuthenticated(), asyncMiddleware(async (req, res) => {
        const params = await validation.validateRequest(req, schemaEditCommitment);
        let response = await commitmentEdit.editCommitment(req.user.id, params, apiHelper.getFile(req));
        res.status(200).json(response);
    }));

    router.delete('/', auth.isAuthenticated(), asyncMiddleware(async (req, res) => {
        const params = await validation.validateRequest(req, schemaDeleteCommitment);
        await commitmentDelete.deleteCommitment(req.user.id, params.commitmentId);
        res.status(200).end();
    }));
};
