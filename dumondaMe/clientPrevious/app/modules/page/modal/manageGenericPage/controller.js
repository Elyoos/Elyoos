'use strict';

module.exports = ['ElyModal', 'Topics', 'GenericPageCreateMessageService', 'UploadPageService', 'Languages',
    function (ElyModal, Topics, GenericPageCreateMessageService, UploadPageService, Languages) {
        var ctrl = this, lastIsValid = true, imageChanged = false;

        ctrl.actualTitle = angular.copy(ctrl.data.title);
        ctrl.data.selectedTopics = Topics.getTopics(ctrl.data.selectedTopics);
        ctrl.data.selectedLanguages = Languages.getLanguages(ctrl.data.selectedLanguages);

        ctrl.cancel = function () {
            ElyModal.cancel();
        };

        ctrl.cancelPreviewImage = function () {
            ctrl.selectImage = false;
        };

        ctrl.setPreviewImage = function (blob, dataUri) {
            ctrl.selectImage = false;
            ctrl.data.dataUri = dataUri;
            ctrl.blob = blob;
            imageChanged = true;
            ctrl.dataChanged(true, lastIsValid);
        };

        ctrl.showImage = function () {
            ctrl.selectImage = true;
        };

        ctrl.dataChanged = function (hasChanged, isValid) {
            ctrl.isValidToChange = hasChanged && isValid || isValid && imageChanged;
            lastIsValid = isValid;
        };

        ctrl.editGenericPage = function () {
            var message = GenericPageCreateMessageService.getEditGenericPageMessage(ctrl.data);
            UploadPageService.uploadModifyPage(message, ctrl);
        };
    }];
