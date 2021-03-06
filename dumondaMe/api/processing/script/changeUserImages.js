const sharp = require('sharp');
const db = require('dumonda-me-server-lib').neo4j;
const cdn = require('dumonda-me-server-lib').cdn;
const logger = require('dumonda-me-server-lib').logging.getLogger(__filename);

const addTitleImage = async function (users) {
    for (let user of users) {
        try {
            let titleImage = await cdn.getObject(`profileImage/${user.userId}/profile.jpg`, process.env.BUCKET_PRIVATE);
            let newTitle = await sharp(titleImage.Body).resize(400, 400).jpeg({quality: 80})
                .toBuffer();
            let newPreview = await sharp(titleImage.Body).resize(148, 148).jpeg({quality: 80})
                .toBuffer();
            let newThumbnail = await sharp(titleImage.Body).resize(40, 40).jpeg({quality: 90})
                .toBuffer();
            await cdn.uploadBuffer(newTitle, `profileImage/${user.userId}/profile.jpg`, process.env.BUCKET_PRIVATE);
            await cdn.uploadBuffer(newPreview, `profileImage/${user.userId}/profilePreview.jpg`, process.env.BUCKET_PRIVATE);
            await cdn.uploadBuffer(newThumbnail, `profileImage/${user.userId}/thumbnail.jpg`, process.env.BUCKET_PRIVATE);
            console.log(`Uploaded images for user ${user.userId}`)
        } catch (error) {
            logger.error(`Error resize title image for user ${user.userId}`);
        }
    }
};

const processUserImage = async function () {
    let pages = await db.cypher().match(`(user:User)`)
        .return(`user.userId AS userId`)
        .end().send();
    await addTitleImage(pages);
};

module.exports = {
    process: processUserImage
};
