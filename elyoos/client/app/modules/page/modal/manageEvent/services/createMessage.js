'use strict';

var setAddress = function (message, data) {
    if (data.selectedAddress.hasOwnProperty('addressId')) {
        message.existingAddressId = data.selectedAddress.addressId;
    } else {
        message.address = {
            address: data.selectedAddress.formatted,
            lat: data.selectedAddress.geometry.lat,
            lng: data.selectedAddress.geometry.lng
        };
    }
};

module.exports = [function () {

    this.getCreateEventMessage = function (data, genericPageId) {
        var message = {
            create: {
                title: data.title,
                description: data.description,
                genericPageId: genericPageId,
                startDate: Math.floor(data.startDate.valueOf() / 1000),
                endDate: Math.floor(data.endDate.valueOf() / 1000)
            }
        };
        setAddress(message.create, data);
        return message;
    };

    this.getModifyEventMessage = function (data, eventId) {
        var message = {
            edit: {
                title: data.title,
                description: data.description,
                eventId: eventId,
                startDate: Math.floor(data.startDate.valueOf() / 1000),
                endDate: Math.floor(data.endDate.valueOf() / 1000)
            }
        };
        setAddress(message.edit, data);
        return message;
    };
}];
