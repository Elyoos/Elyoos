'use strict';

var validation = require('./../../../../lib/jsonValidation');
var pinwall = require('./../../../../models/user/pinwall/pinwall');
var auth = require('./../../../../lib/auth');
var exceptions = require('./../../../../lib/error/exceptions');
var controllerErrors = require('./../../../../lib/error/controllerErrors');
var logger = requireLogger.getLogger(__filename);

var schemaRequestUserPinwall = {
    name: 'getUserDetailsPinwall',
    type: 'object',
    additionalProperties: false,
    required: ['userId'],
    properties: {
        userId: {type: 'string', format: 'notEmptyString', maxLength: 30},
        skip: {type: 'integer', minimum: 0},
        maxItems: {type: 'integer', minimum: 1, maximum: 50}
    }
};

module.exports = function (router) {
    router.get('/', auth.isAuthenticated(), function (req, res) {

        return controllerErrors('Error when getting pinwall of user', req, res, logger, function () {
            return validation.validateQueryRequest(req, schemaRequestUserPinwall, logger)
                .then(function (request) {
                    logger.info("User requests pinwall of user " + request.userId, req);
                    if (request.userId !== req.user.id) {
                        return pinwall.getPinwallOfDetailUser(req.user.id, request);
                    } else {
                        return exceptions.getInvalidOperation("Users id and userId are the same", logger, req);
                    }
                })
                .then(function (pinwall) {
                    res.status(200).json(pinwall);
                });
        });
    });
};
