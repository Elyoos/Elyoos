'use strict';

const validation = require('elyoos-server-lib').jsonValidation;
const schemaLanguage = require("../../../schema/language");
const language = requireModel('user/language/index');
const asyncMiddleware = require('elyoos-server-lib').asyncMiddleware;
const logger = require('elyoos-server-lib').logging.getLogger(__filename);


const schemaEditLanguage = {
    name: 'editLanguage',
    type: 'object',
    additionalProperties: false,
    required: ['language'],
    properties: {
        language: schemaLanguage.language
    }
};

module.exports = function (router) {

    router.put('/:language', asyncMiddleware(async (req, res) => {
        const params = await validation.validateRequest(req, schemaEditLanguage, logger);
        await language.setLanguage(req.user, req.session, params.language);
        res.status(200).end();
    }));
};
