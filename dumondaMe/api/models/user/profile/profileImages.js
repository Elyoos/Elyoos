/**
 * Generate the profile images for a user
 */
'use strict';

const image = require('dumonda-me-server-lib').image;

module.exports = {
    generateProfileImage: async function (originalFilePath, userId) {
        await image.uploadImage(148, 148, {
            quality: 80, originalImagePath: originalFilePath, cdnPath: `profileImage/${userId}/profilePreview.jpg`,
            bucket: process.env.BUCKET_PRIVATE
        });
        await image.uploadImage(40, 40, {
            quality: 90, originalImagePath: originalFilePath, cdnPath: `profileImage/${userId}/thumbnail.jpg`,
            bucket: process.env.BUCKET_PRIVATE
        });
        await image.uploadImage(400, 400, {
            quality: 80, originalImagePath: originalFilePath, cdnPath: `profileImage/${userId}/profile.jpg`,
            bucket: process.env.BUCKET_PRIVATE
        });
    }
};
