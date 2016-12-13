"use strict";

var db = requireDb();
var email = require('elyoos-server-lib').eMail;

var processDefinition = function (data, done) {

    return db.cypher().match("(user:User {email: {email}})")
        .return("user").end({email: data.email}).send()
        .then(function (resp) {
            if (resp.length === 1 && resp[0].user.hasOwnProperty('resetPasswordLinkId')) {
                email.sendEMail("resetPassword", {link: `https://www.elyoos.com/password/reset/${resp[0].user.resetPasswordLinkId}`},
                    data.email);
            }
            return done();
        });
};

module.exports = {
    processDefinition: processDefinition
};
