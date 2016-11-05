'use strict';

module.exports = [function () {

    this.getMessage = function (places) {
        var message = [];
        angular.forEach(places, function (place) {
            message.push({description: place.formatted, lat: place.geometry.lat, lng: place.geometry.lng})
        });
        return message;
    };
}];
