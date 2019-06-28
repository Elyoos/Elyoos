'use strict';

module.exports = {
    directive: [function () {
        return {
            restrict: 'E',
            replace: true,
            scope: {settings: '='},
            controller: require('./controller.js'),
            controllerAs: 'ctrl',
            bindToController: {
                description: '@',
                propertyName: '@',
                groupNames: '='
            },
            templateUrl: 'app/modules/settings/modal/overviewGroupSettings/directive/group/template.html'
        };
    }],
    name: 'elySettingsPrivacyGroup'
};