'use strict';

const validation = require('elyoos-server-lib').jsonValidation;
const auth = require('elyoos-server-lib').auth;
const schemaLanguage = require('../../../schema/language');
const feed = requireModel('user/feed/question');
const asyncMiddleware = require('elyoos-server-lib').asyncMiddleware;
const time = require('elyoos-server-lib').time;
const logger = require('elyoos-server-lib').logging.getLogger(__filename);

const schemaGetQuestionFeed = {
    name: 'getQuestionFeed',
    type: 'object',
    additionalProperties: false,
    required: ['guiLanguage', 'languages', 'order'],
    properties: {
        guiLanguage: schemaLanguage.language,
        languages: schemaLanguage.languageMultiple,
        order: {enum: ['mostPopular', 'newest', 'notAnswered', 'onlyFewAnswers']},
        periodOfTime: {enum: ['week', 'month']},
        page: {type: 'integer', minimum: 0},
        timestamp: {type: 'integer', minimum: 0},
        trustCircle: {type: 'integer', minimum: 1, maximum: 3},
        topics: {
            type: 'array',
            items: {type: 'string', format: 'notEmptyString', maxLength: 255},
            minItems: 1,
            maxItems: 100,
            uniqueItems: true
        }
    }
};

module.exports = function (router) {

    router.get('/', auth.isAuthenticated(), asyncMiddleware(async (req, res) => {
        const params = await validation.validateQueryRequest(req, schemaGetQuestionFeed, logger);
        params.page = params.page || 0;
        params.timestamp = params.timestamp || time.getNowUtcTimestamp();
        let response = await feed.getFeed(req.user.id, params.page, params.timestamp, params.order, params.periodOfTime,
            params.guiLanguage, params.languages, params.trustCircle, params.topics);
        res.status(200).json(response);
    }));
};