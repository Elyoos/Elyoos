'use strict';

const db = requireDb();
const logger = require('elyoos-server-lib').logging.getLogger(__filename);

const getDetail = async function (userId, answerId) {

    let resp = await db.cypher().match("(c:Answer:Commitment {answerId: {answerId}})<-[:IS_ADMIN]-(user:User)")
        .optionalMatch(`(t:Topic)-[:TOPIC]->(c)`)
        .return(`c.title AS title, c.description AS description, c.website AS website, c.created AS created,
                 c.language AS language, EXISTS((:User {userId: {userId}})-[:IS_ADMIN]->(c)) AS isAdmin,
                 collect(t.name) AS topics`)
        .end({userId, answerId}).send();
    if (resp.length !== 1) {
        logger.warn(`Commitment with id ${answerId} not found`);
        throw new Error('404');
    }
    logger.info(`Get commitment with answerId ${answerId}`);
    return resp[0];
};

module.exports = {
    getDetail
};
