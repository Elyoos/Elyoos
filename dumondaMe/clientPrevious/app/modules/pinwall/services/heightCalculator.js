'use strict';

var setLinkHeight = function (recommendation) {
    recommendation.pinwallHeight = 130;
    if (recommendation.hasOwnProperty('heightPreviewImage')) {
        recommendation.pinwallHeight += recommendation.heightPreviewImage;
    }
};

var heightCalculator = {
    Blog: function (blog) {
        blog.pinwallHeight = 170;
        if (blog.hasOwnProperty('heightPreviewImage')) {
            blog.pinwallHeight += blog.heightPreviewImage;
        }
    },
    Recommendation: function (recommendation, $log) {
        if (recommendation.hasOwnProperty('label')) {
            switch (recommendation.label) {
                case "Book":
                    recommendation.pinwallHeight = 305;
                    break;
                case "Youtube":
                    recommendation.pinwallHeight = 475;
                    break;
                case "Blog":
                    recommendation.pinwallHeight = 165;
                    if (recommendation.hasOwnProperty('heightPreviewImage')) {
                        recommendation.pinwallHeight += recommendation.heightPreviewImage;
                    }
                    break;
                case "Link":
                    setLinkHeight(recommendation);
                    break;
                case "Generic":
                    recommendation.pinwallHeight = 424;
                    break;
                default:
                    $log.error("Unknown recommendation label " + recommendation.label);
            }
        } else {
            recommendation.pinwallHeight = 315;
        }
    }
};

module.exports = ['$log',
    function ($log) {

        this.setHeightPinwallElements = function (pinwall) {
            angular.forEach(pinwall, function (pinwallElement) {
                if (pinwallElement.hasOwnProperty('pinwallType')) {
                    if (heightCalculator[pinwallElement.pinwallType]) {
                        heightCalculator[pinwallElement.pinwallType](pinwallElement, $log);
                    }
                }
            });
        };
    }];