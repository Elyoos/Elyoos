'use strict';

module.exports = {
    directive: [function () {
        return {
            restrict: 'E',
            replace: true,
            scope: {},
            templateUrl: 'app/modules/util/file/previewPicture/template.html',
            controllerAs: 'ctrl',
            bindToController: {
                ratio: '@',
                unsupportedFile: '@',
                cancel: '=',
                finish: '='
            },
            controller: require('./controller.js')
        };
    }],
    name: 'elyPreviewPicture'
};
