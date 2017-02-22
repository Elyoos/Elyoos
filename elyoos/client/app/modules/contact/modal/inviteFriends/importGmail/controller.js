'use strict';

module.exports = ['$window', 'ImportGmailContacts', 'ImportGmailCodeParser', 'SourceImportModification',
    function ($window, ImportGmailContacts, ImportGmailCodeParser, SourceImportModification) {
        var ctrl = this;

        ctrl.openGmail = function () {
            var newWindow = $window.open('https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=270929621236-4cauqnck95vm8ohkvu3rokhp74jued28.apps.googleusercontent.com&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcontacts.readonly&redirect_uri=http%3A%2F%2Flocalhost:8080%2Fauth', 'name',
                'height=600,width=450');
            if (angular.isFunction(newWindow.focus)) {
                newWindow.focus();
            }
            ctrl.importStarted();
            $window.elyChildWindowUrl = function (newUrl) {
                ctrl.gmailContacts = ImportGmailContacts.get({code: ImportGmailCodeParser.parseGoogleUrl(newUrl)}, function () {
                    SourceImportModification.addSourceDescription(ctrl.gmailContacts.addresses, 'Gmail');
                    ctrl.contacts.addresses = ctrl.contacts.addresses.concat(ctrl.gmailContacts.addresses);
                    ctrl.importFinish(null, 'gmail');
                }, function () {
                    ctrl.importFinish();
                });
            };

        };
    }];

