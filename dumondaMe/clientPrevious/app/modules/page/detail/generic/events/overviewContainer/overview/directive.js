'use strict';

module.exports = {
    directive: [ function () {
        return {
            restrict: 'E',
            replace: true,
            scope: {},
            controller: require('./controller.js'),
            controllerAs: 'ctrl',
            bindToController: {
                isActual: '@',
                editAllowed: '@',
                isAdmin: '=',
                commands: '=',
                addresses: '=',
                hasEvents: '='
            },
            templateUrl: 'app/modules/page/detail/generic/events/overviewContainer/overview/template.html'
        };
    }],
    name: 'elyPageDetailEventsOverview'
};