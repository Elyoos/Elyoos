'use strict';

var controller = require('./contactPreviewCtrl');

module.exports = {
    directive: [function () {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                enableSelect: '@',
                contact: '=',
                statistic: '=',
                numberOfContacts: '='
            },
            templateUrl: 'app/modules/contact/contactPreview/template.html',
            controller: controller
        };
    }],
    name: 'elyContactPreview'
};
