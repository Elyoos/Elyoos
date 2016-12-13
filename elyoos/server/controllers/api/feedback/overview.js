'use strict';

var auth = require('elyoos-server-lib').auth;
var controllerErrors = require('elyoos-server-lib').controllerErrors;
var feedbackOverview = requireModel('feedback/overview');
var logger = require('elyoos-server-lib').logging.getLogger(__filename);

module.exports = function (router) {

    router.get('/', auth.isAuthenticated(), function (req, res) {

        return controllerErrors('Error occurs when getting feedback overview', req, res, logger, function () {
            logger.info('Request feedback overview', req);
            return feedbackOverview.getOverview().then(function (feedbackOverview) {
                res.status(200).json(feedbackOverview);
            });
        });
    });
};
