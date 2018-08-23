'use strict';

const validation = require('elyoos-server-lib').jsonValidation;
const answerCreate = requireModel('user/question/answer/create/youtube');
const answerEdit = requireModel('user/question/answer/edit/youtube');
const asyncMiddleware = require('elyoos-server-lib').asyncMiddleware;
const auth = require('elyoos-server-lib').auth;
const logger = require('elyoos-server-lib').logging.getLogger(__filename);

const schemaCreateYoutubeAnswer = {
    name: 'createYoutubeAnswer',
    type: 'object',
    additionalProperties: false,
    required: ['questionId', 'link', 'title', 'description'],
    properties: {
        questionId: {type: 'string', format: 'notEmptyString', maxLength: 60},
        link: {type: 'string', format: 'youtubeLink', maxLength: 2000},
        title: {type: 'string', format: 'notEmptyString', maxLength: 100},
        description: {type: 'string', format: 'notEmptyString', maxLength: 1000},
    }
};

const schemaEditYoutubeAnswer = {
    name: 'editYoutubeAnswer',
    type: 'object',
    additionalProperties: false,
    required: ['answerId', 'title', 'description'],
    properties: {
        answerId: {type: 'string', format: 'notEmptyString', maxLength: 60},
        title: {type: 'string', format: 'notEmptyString', maxLength: 100},
        description: {type: 'string', format: 'notEmptyString', maxLength: 1000},
    }
};


module.exports = function (router) {

    router.post('/:questionId', auth.isAuthenticated(), asyncMiddleware(async (req, res) => {
        const params = await validation.validateRequest(req, schemaCreateYoutubeAnswer, logger);
        let response = await answerCreate.createYoutubeAnswer(req.user.id, params);
        res.status(200).json(response);
    }));

    router.put('/:answerId', auth.isAuthenticated(), asyncMiddleware(async (req, res) => {
        const params = await validation.validateRequest(req, schemaEditYoutubeAnswer, logger);
        let response = await answerEdit.editYoutubeAnswer(req.user.id, params);
        res.status(200).json(response);
    }));
};
