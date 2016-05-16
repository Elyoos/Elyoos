'use strict';
var auth = require('./../../../../../../lib/auth');
var logger = requireLogger.getLogger(__filename);
var answer = require('./../../../../../../models/forum/answer/answer');
var controllerErrors = require('./../../../../../../lib/error/controllerErrors');
var validation = require('./../../../../../../lib/jsonValidation');

var schemaAddQuestionAnswer = {
    name: 'createForumAnswer',
    type: 'object',
    additionalProperties: false,
    properties: {
        normal: {
            type: 'object',
            additionalProperties: false,
            required: ['questionId', 'title', 'description', 'type'],
            properties: {
                questionId: {type: 'string', format: 'notEmptyString', maxLength: 30},
                title: {type: 'string', format: 'notEmptyString', maxLength: 160},
                description: {type: 'string', format: 'notEmptyString', maxLength: 3000},
                type: {'$ref': '#/definitions/type'}
            }
        },
        page: {
            type: 'object',
            additionalProperties: false,
            required: ['questionId', 'pageId', 'description', 'type'],
            properties: {
                questionId: {type: 'string', format: 'notEmptyString', maxLength: 30},
                pageId: {type: 'string', format: 'notEmptyString', maxLength: 30},
                description: {type: 'string', format: 'notEmptyString', maxLength: 3000},
                type: {'$ref': '#/definitions/type'}
            }
        }
    },
    definitions: {
        type: {enum: ['explanation', 'solution']}
    }
};

module.exports = function (router) {

    router.post('/', auth.isAuthenticated(), function (req, res) {

        return controllerErrors('Error occurs when creating a forum answer', req, res, logger, function () {
            return validation.validateRequest(req, schemaAddQuestionAnswer, logger).then(function (request) {
                logger.info("User created a new forum answer", req);
                if (request.hasOwnProperty('normal')) {
                    return answer.createAnswer(req.user.id, request.normal.questionId, request.normal.title, request.normal.description,
                        request.normal.type, null, req);
                } else if (request.hasOwnProperty('page')) {
                    return answer.createAnswer(req.user.id, request.page.questionId, null, request.page.description,
                        request.page.type, request.page.pageId, req);
                }
            }).then(function (data) {
                res.status(200).json(data);
            });
        });
    });
};
