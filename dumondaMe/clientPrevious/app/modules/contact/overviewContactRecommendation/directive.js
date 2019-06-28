'use strict';

module.exports = {
    directive: [function () {
        return {
            restrict: 'E',
            replace: true,
            scope: {},
            controller: require('./controller.js'),
            controllerAs: 'ctrl',
            bindToController: {},
            templateUrl: 'app/modules/contact/overviewContactRecommendation/template.html'
        };
    }],
    name: 'elyContactRecommendationOverview'
};