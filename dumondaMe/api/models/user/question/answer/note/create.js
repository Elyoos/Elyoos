const db = requireDb();
const time = require('dumonda-me-server-lib').time;
const uuid = require('dumonda-me-server-lib').uuid;
const notification = require('./notification');
const exceptions = require('dumonda-me-server-lib').exceptions;
const linkifyHtml = require('linkifyjs/html');
const slug = require('limax');
const logger = require('dumonda-me-server-lib').logging.getLogger(__filename);

const createNoteCommand = function (answerId, userId, text, created, noteId) {
    return db.cypher().match(`(user:User {userId: {userId}}), (answer:Answer {answerId: {answerId}})`)
        .where(`NOT answer:CommitmentAnswer`)
        .create(`(note:Note {noteId: {noteId}, text: {text}, created: {created}})`)
        .merge(`(user)-[:IS_CREATOR]->(note)<-[:NOTE]-(answer)`)
        .return(`note, user`)
        .end({answerId, userId, text, created, noteId})
};

const createNote = async function (userId, answerId, text) {
    let response = {
        noteId: uuid.generateUUID(),
        created: time.getNowUtcTimestamp(),
        textHtml: linkifyHtml(text, {attributes: {rel: 'noopener'}})
    };
    let res = await notification.addCreatedNoteNotification(userId, response.noteId, response.created).send([
        createNoteCommand(answerId, userId, text, response.created, response.noteId).getCommand(),
        notification.addCreatedNoteForNoteCreatorsNotification(userId, response.noteId, response.created)
            .getCommand()]);
    logger.info(`User ${userId} has created a note ${answerId}`);
    if (res[0].length === 0) {
        throw new exceptions.InvalidOperation(`Note for answer ${answerId} not created`);
    }
    response.creator = {
        userId,
        name: res[0][0].user.name,
        slug: slug(res[0][0].user.name)
    };
    return response;
};


module.exports = {
    createNote
};