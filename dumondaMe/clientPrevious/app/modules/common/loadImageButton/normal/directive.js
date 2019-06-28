'use strict';

module.exports = {
    directive: [ function () {
        return {
            restrict: 'E',
            replace: true,
            scope: {},
            templateUrl: 'app/modules/common/loadImageButton/normal/template.html',
            controller: require('./../controller.js'),
            link: require('./../link.js'),
            controllerAs: 'ctrl',
            bindToController: {
                imageForUpload: '=',
                label: '@',
                ariaLabel: '@',
                openDialogInit: '@'
            }
        };
    }],
    name: 'elyLoadImageButtonNormal'
};