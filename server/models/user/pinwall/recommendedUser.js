'use strict';

var db = require('./../../../neo4j');

var getRecommendedByContactUsers = function (userId) {
    return db.cypher().match(`(user:User {userId: {userId}})-[:IS_CONTACT]->(:User)-[:IS_CONTACT]->(contactedUser:User)`)
        .where("contactedUser.userId <> user.userId AND NOT (user)-[:IS_CONTACT]->(contactedUser)")
        .optionalMatch("(user)<-[relContactedUser:IS_CONTACT]-(contactedUser)-[privacyRel:HAS_PRIVACY]->(privacy:Privacy)")
        .where("privacyRel.type = relContactedUser.type")
        .optionalMatch("(contactedUser:User)-[:HAS_PRIVACY_NO_CONTACT]->(privacyNoContact:Privacy)")
        .where("NOT EXISTS((user)<-[:IS_CONTACT]-(contactedUser))")
        .with("user, contactedUser, privacyNoContact, relContactedUser, privacy, count(contactedUser) AS numberOfContactingByContactUser")
        .where(`NOT EXISTS((user)<-[:IS_CONTACT]-(contactedUser)) OR relContactedUser.contactAdded < user.previousLastLogin`)
        .return(`SIZE((contactedUser)<-[:IS_CONTACT]-(:User)) AS numberOfContacting, contactedUser.userId AS userId, contactedUser.name AS name, 
                 privacy.profile AS profileVisible, privacy.image AS imageVisible, privacyNoContact.profile AS profileVisibleNoContact, 
                 privacyNoContact.image AS imageVisibleNoContact, numberOfContactingByContactUser`)
        .orderBy("numberOfContactingByContactUser DESC, numberOfContacting DESC")
        .limit("10")
        .end({userId: userId});
};

var getRecommendedUsers = function (userId) {
    return db.cypher().match(`(contactingUser:User)-[:IS_CONTACT]->(contactedUser:User), (user:User {userId: {userId}})`)
        .where(`NOT (user)-[:IS_CONTACT]->()-[:IS_CONTACT]->(contactedUser) AND NOT (user)-[:IS_CONTACT]->(contactedUser) AND 
                contactingUser.userId <> user.userId AND contactedUser.userId <> user.userId AND NOT (user)-[:IS_BLOCKED]->(contactedUser)`)
        .optionalMatch("(user)<-[relContactedUser:IS_CONTACT]-(contactedUser)-[privacyRel:HAS_PRIVACY]->(privacy:Privacy)")
        .where("privacyRel.type = relContactedUser.type")
        .optionalMatch("(contactedUser:User)-[:HAS_PRIVACY_NO_CONTACT]->(privacyNoContact:Privacy)")
        .where("NOT EXISTS((user)<-[:IS_CONTACT]-(contactedUser))")
        .with("user, contactedUser, privacyNoContact, relContactedUser, privacy, count(contactedUser) AS numberOfContacting")
        .where(`NOT EXISTS((user)<-[:IS_CONTACT]-(contactedUser)) OR relContactedUser.contactAdded < user.previousLastLogin`)
        .return(`numberOfContacting, contactedUser.userId AS userId, contactedUser.name AS name, 
                 privacy.profile AS profileVisible, privacy.image AS imageVisible, privacyNoContact.profile AS profileVisibleNoContact, 
                 privacyNoContact.image AS imageVisibleNoContact`)
        .orderBy("numberOfContacting DESC")
        .limit("10")
        .end({userId: userId});
};

module.exports = {
    getRecommendedByContactUsers: getRecommendedByContactUsers,
    getRecommendedUsers: getRecommendedUsers
};
