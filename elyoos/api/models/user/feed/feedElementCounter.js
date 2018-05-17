'use strict';

const filter = require('./filter');
const db = requireDb();

const getTotalNumberOfFeedElements = function (userId, timestamp, typeFilter) {
    return db.cypher()
        .match(`(user:User {userId: {userId}})-[:WATCH|IS_CONTACT]->(watch)
                -[rel:UP_VOTE|:WATCH|:IS_CREATOR|:ANSWER]->(feedElement)`)
        .where(filter.getTypeFilter(typeFilter))
        .return(`count(*) AS numberOfElements`)
        .end({userId, timestamp}).getCommand();
};

module.exports = {
    getTotalNumberOfFeedElements
};
