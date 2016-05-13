'use strict';
var auth = require('./../../../../../../lib/auth');
var logger = requireLogger.getLogger(__filename);
var rate = require('./../../../../../../models/forum/answer/rate');
var controllerErrors = require('./../../../../../../lib/error/controllerErrors');
var validation = require('./../../../../../../lib/jsonValidation');

var schemaRateAnswer = {
    name: 'rateForumAnswer',
    type: 'object',
    additionalProperties: false,
    required: ['answerId'],
    properties: {
        answerId: {type: 'string', format: 'notEmptyString', maxLength: 30}
    }
};

module.exports = function (router) {

    router.post('/', auth.isAuthenticated(), function (req, res) {

        return controllerErrors('Error occurs when rating a forum answer', req, res, logger, function () {
            return validation.validateRequest(req, schemaRateAnswer, logger).then(function (request) {
                logger.info("User rates a forum answer", req);
                return rate.ratePositive(req.user.id, request.answerId, req);
            }).then(function (data) {
                res.status(200).json(data);
            });
        });
    });
};
