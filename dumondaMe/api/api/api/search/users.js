'use strict';

const validation = require('dumonda-me-server-lib').jsonValidation;
const search = requireModel('search/user/index');
const schemaLanguage = require("../../schema/language");
const asyncMiddleware = require('dumonda-me-server-lib').asyncMiddleware;

const schemaSearchUsers = {
    name: 'searchUsers',
    type: 'object',
    additionalProperties: false,
    required: ['query', 'lang', 'skip', 'limit'],
    properties: {
        query: {type: 'string', format: 'notEmptyString', maxLength: 255},
        lang: schemaLanguage.language,
        skip: {type: 'integer', minimum: 0},
        limit: {type: 'integer', minimum: 1, maximum: 50}
    }
};

module.exports = function (router) {

    router.get('/', asyncMiddleware(async (req, res) => {
        const params = await validation.validateRequest(req, schemaSearchUsers);
        let response = await search.search(params.query, params.lang, req.user.id, params.skip, params.limit,);
        res.status(200).json(response);
    }));
};
