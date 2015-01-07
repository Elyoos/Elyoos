'use strict';

var app = require('angular').module('elyoosApp');

app.controller('ProfileRecommendationCtrl', require('./profileRecommendationCtrl'));

app.service('ProfileRecommendationCtrl', require('./sendRecommendation'));

app.config(['$stateProvider', function ($stateProvider) {

    $stateProvider
        .state('profile', {
            abstract: true,
            url: '/profile',
            views: {
                header: {
                    templateUrl: 'app/modules/navigation/loggedInHeader.html',
                    controller: 'PagesHeaderCtrl'
                }
            }
        })
        .state('profile.recommendation', {
            url: '/recommendation',
            views: {
                'content@': {
                    templateUrl: 'app/modules/profile/profileRecommendations.html',
                    controller: 'ProfileRecommendationCtrl'
                }
            }
        });
}]);