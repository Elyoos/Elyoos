'use strict';

var validation = require('./../../../../lib/jsonValidation'),
    contactDetails = require('./../../../../models/contact/contactDetails'),
    auth = require('./../../../../lib/auth'),
    controllerErrors = require('./../../../../lib/error/controllerErrors'),
    logger = requireLogger.getLogger(__filename);

var schemaRequestGetContactDetails = {
    name: 'getContactDetails',
    type: 'object',
    additionalProperties: false,
    required: ['userId', 'contactsPerPage', 'skipContacts', 'mode'],
    properties: {
        userId: {type: 'string', format: 'notEmptyString', maxLength: 30},
        contactsPerPage: {type: 'integer', minimum: 1, maximum: 50},
        skipContacts: {type: 'integer', minimum: 0},
        mode: {enum: ['detailOfUser', 'onlyContacts']}
    }
};

module.exports = function (router) {
    router.get('/', auth.isAuthenticated(), function (req, res) {

        return controllerErrors('Error when getting detail of a user', req, res, logger, function () {
            return validation.validateQueryRequest(req, schemaRequestGetContactDetails, logger)
                .then(function (request) {
                    if (request.mode === 'detailOfUser') {
                        logger.info("User  requests detail contact information of user " + request.userId, req);
                        return contactDetails.getContactDetails(req.user.id,
                            request.userId, request.contactsPerPage, request.skipContacts, req);
                    }
                    if (request.mode === 'onlyContacts') {
                        logger.info("User requests only contact information of user " + request.userId, req);
                        return contactDetails.getContacts(req.user.id,
                            request.userId, request.contactsPerPage, request.skipContacts);
                    }
                })
                .then(function (userDetails) {
                    res.status(200).json(userDetails);
                });
        });
    });
};
