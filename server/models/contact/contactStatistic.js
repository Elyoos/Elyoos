'use strict';

var db = require('./../../neo4j');

var getTotalNumberOfContacts = function (userId) {
    return db.cypher().match('(u:User {userId: {userId}})-[:IS_CONTACT]->(:User)')
        .return('count(*) AS numberOfContacts')
        .end({
            userId: userId
        });
};

var getTotalNumberOfContactsPerType = function (userId, types) {
    return db.cypher().match('(u:User {userId: {userId}})-[r:IS_CONTACT]->(:User)')
        .where('r.type IN {types}')
        .return('count(*) AS contactsForPagination')
        .end({
            userId: userId,
            types: types
        });
};

var getContactStatisticsCommand = function (userId) {
    return db.cypher().match('(u:User {userId: {userId}})-[r:IS_CONTACT]->(:User)')
        .return('r.type AS type, count(*) AS count')
        .orderBy("type")
        .end({
            userId: userId
        });
};

var getContactStatistics = function (userId) {
    return getContactStatisticsCommand(userId).send([getTotalNumberOfContacts(userId).getCommand()]).then(function (resp) {
        return {numberOfContacts: resp[0][0].numberOfContacts, statistic: resp[1]};
    });
};

module.exports = {
    getContactStatisticsCommand: getContactStatisticsCommand,
    getContactStatistics: getContactStatistics,
    getTotalNumberOfContacts: getTotalNumberOfContacts,
    getTotalNumberOfContactsPerType: getTotalNumberOfContactsPerType
};
