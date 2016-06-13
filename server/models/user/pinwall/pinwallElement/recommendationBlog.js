'use strict';

var profileUrl = require('./profileUrl');
var cdn = require('../../../util/cdn');

var addUrl= function (element) {

        if (element.heightPreviewImage) {
            element.url = cdn.getUrl(`blog/${element.blogId}/preview.jpg`);
            element.urlFull = cdn.getUrl(`blog/${element.blogId}/normal.jpg`);
        }
};

var getPinwallElement = function (pinwallElement) {
    var element = {};
    element.pinwallType = 'Recommendation';
    element.label = 'Blog';
    element.writerName = pinwallElement.writer.name;
    element.name = pinwallElement.contact.name;
    element.userId = pinwallElement.contact.userId;
    element.created = pinwallElement.pinwall.created;
    element.blogId = pinwallElement.pinwallData.blogId;
    element.text = pinwallElement.pinwallData.text;
    element.heightPreviewImage = pinwallElement.pinwallData.heightPreviewImage;
    element.isAdmin = pinwallElement.writer.userId === pinwallElement.user.userId;

    element.title = pinwallElement.pinwallData.title;
    element.topic = pinwallElement.pinwallData.topic;
    element.numberOfSamePinwallData = pinwallElement.numberOfSamePinwallData;
    profileUrl.addProfileUrl(element, pinwallElement);
    addUrl(element, pinwallElement);
    return element;
};


module.exports = {
    getPinwallElement: getPinwallElement
};
