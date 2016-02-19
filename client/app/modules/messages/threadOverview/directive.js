'use strict';

var controller = require('./controller.js');

module.exports = {
    directive: [function () {
        return {
            restrict: 'E',
            replace: true,
            scope: {},
            controller: controller.directiveCtrl(),
            controllerAs: 'ctrl',
            bindToController: true,
            templateUrl: 'app/modules/messages/threadOverview/template.html'
        };
    }],
    name: 'elyMessagesOverview'
};
