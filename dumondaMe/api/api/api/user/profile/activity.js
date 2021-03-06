'use strict';

const validation = require('dumonda-me-server-lib').jsonValidation;
const schemaLanguage = require('../../../schema/language');
const activity = requireModel('user/profile/activity');
const asyncMiddleware = require('dumonda-me-server-lib').asyncMiddleware;
const time = require('dumonda-me-server-lib').time;
const logger = require('dumonda-me-server-lib').logging.getLogger(__filename);

const schemaGetProfileActivity = {
    name: 'getProfileActivity',
    type: 'object',
    additionalProperties: false,
    required: ['userId', 'languages', 'guiLanguage'],
    properties: {
        userId: {type: 'string', format: 'notEmptyString', maxLength: 60},
        languages: schemaLanguage.languageMultiple,
        guiLanguage: schemaLanguage.language,
        page: {type: 'integer', minimum: 0},
        timestamp: {type: 'integer', minimum: 0},
        topics: {
            type: 'array',
            items: {type: 'string', format: 'notEmptyString', maxLength: 255},
            minItems: 1,
            maxItems: 100,
            uniqueItems: true
        },
        regions: {
            type: 'array',
            items: {type: 'string', format: 'notEmptyString', maxLength: 255},
            minItems: 1,
            maxItems: 1000,
            uniqueItems: true
        },
    }
};

module.exports = function (router) {
    router.get('/', asyncMiddleware(async (req, res) => {
        let params = await validation.validateRequest(req, schemaGetProfileActivity);
        logger.info(`Requests activity of user ${params.userId}`, req);
        params.page = params.page || 0;
        params.timestamp = params.timestamp || time.getNowUtcTimestamp();
        let feed = await activity.getFeed(req.user.id, params.userId, params.page, params.timestamp,
            params.languages, params.guiLanguage, params.topics, params.regions, req);
        res.status(200).json(feed);
    }));
};
