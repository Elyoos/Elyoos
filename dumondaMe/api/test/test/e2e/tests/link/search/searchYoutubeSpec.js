'use strict';

const users = require('dumonda-me-server-test-util').user;
const dbDsl = require('dumonda-me-server-test-util').dbDSL;
const requestHandler = require('dumonda-me-server-test-util').requestHandler;
const rp = require('request-promise');
const sinon = require('sinon');

describe('Search a youtube link', function () {

    let sandbox;

    beforeEach(async function () {
        await dbDsl.init(3);
        sandbox = sinon.sandbox.create();

        dbDsl.createQuestion('1', {
            creatorId: '2', question: 'Das ist eine Frage', description: 'description',
            topics: ['Spiritual', 'Education'], language: 'de', modified: 700
        });

        dbDsl.createQuestion('2', {
            creatorId: '2', question: 'Das ist eine Frage2', description: 'description2',
            topics: ['Spiritual', 'Education'], language: 'en', modified: 701
        });
    });

    afterEach(function () {
        sandbox.restore();
        return requestHandler.logout();
    });

    it('Search for a youtube video which has not yet been posted on dumondaMe (with og:title)', async function () {
        let stubGetRequest = sandbox.stub(rp, 'get');
        stubGetRequest.resolves(
            `<head>
                <title>titleWebsite - YouTube</title>
                <meta name="description" content="contentWebsite">
                <meta property="og:title" content="ogTitle">
            </head>
            <body></body>`
        );
        await dbDsl.sendToDb();
        await requestHandler.login(users.validUser);
        let res = await requestHandler.get('/api/link/search/1', {link: 'https://www.youtube.com/watch?v=00zxopGPYW4'});
        res.status.should.equal(200);
        res.body.title.should.equals('ogTitle');
        res.body.linkEmbed.should.equals('https://www.youtube.com/embed/00zxopGPYW4');
        res.body.type.should.equals('Youtube');
    });

    it('Search for a youtube video which has not yet been posted on dumondaMe (with og:description)', async function () {
        let stubGetRequest = sandbox.stub(rp, 'get');
        stubGetRequest.resolves(
            `<head>
                <title>titleWebsite - YouTube</title>
                <meta name="description" content="contentWebsite">
                <meta property="og:description" content="ogDescription">
            </head>
            <body></body>`
        );
        await dbDsl.sendToDb();
        await requestHandler.login(users.validUser);
        let res = await requestHandler.get('/api/link/search/1', {link: 'https://www.youtube.com/watch?v=00zxopGPYW4'});
        res.status.should.equal(200);
        res.body.title.should.equals('titleWebsite');
        res.body.linkEmbed.should.equals('https://www.youtube.com/embed/00zxopGPYW4');
        res.body.type.should.equals('Youtube');
    });

    it('Search for a youtube video which has not yet been posted on dumondaMe', async function () {
        let stubGetRequest = sandbox.stub(rp, 'get');
        stubGetRequest.resolves(
            `<head>
                <title>titleWebsite - YouTube</title>
                <meta name="description" content="contentWebsite">
            </head>
            <body></body>`
        );
        await dbDsl.sendToDb();
        await requestHandler.login(users.validUser);
        let res = await requestHandler.get('/api/link/search/1', {link: 'https://www.youtube.com/watch?v=00zxopGPYW4'});
        res.status.should.equal(200);
        res.body.title.should.equals('titleWebsite');
        res.body.linkEmbed.should.equals('https://www.youtube.com/embed/00zxopGPYW4');
        res.body.type.should.equals('Youtube');
    });

    it('Search for a youtube video which has not yet been posted on dumondaMe (youtu.be url)', async function () {
        let stubGetRequest = sandbox.stub(rp, 'get');
        stubGetRequest.resolves(
            `<head>
                <title>titleWebsite - YouTube</title>
                <meta name="description" content="contentWebsite">
            </head>
            <body></body>`
        );
        await dbDsl.sendToDb();
        await requestHandler.login(users.validUser);
        let res = await requestHandler.get('/api/link/search/1', {link: 'https://youtu.be/00zxopGPYW4'});
        res.status.should.equal(200);
        res.body.title.should.equals('titleWebsite');
        res.body.linkEmbed.should.equals('https://www.youtube.com/embed/00zxopGPYW4');
        res.body.type.should.equals('Youtube');
    });

    it('Search for a youtube video which has not yet been posted on dumondaMe (without title)', async function () {
        let stubGetRequest = sandbox.stub(rp, 'get');
        stubGetRequest.resolves(
            `<head>
                <meta name="description" content="  contentWebsite ">
            </head>
            <body></body>`
        );
        await dbDsl.sendToDb();
        await requestHandler.login(users.validUser);
        let res = await requestHandler.get('/api/link/search/1', {link: 'https://www.youtube.com/watch?v=00zxopGPYW4'});
        res.status.should.equal(200);
        res.body.title.should.equals('');
        res.body.linkEmbed.should.equals('https://www.youtube.com/embed/00zxopGPYW4');
        res.body.type.should.equals('Youtube');
    });

    it('Search for a youtube video which has not yet been posted on dumondaMe (without description)', async function () {
        let stubGetRequest = sandbox.stub(rp, 'get');
        stubGetRequest.resolves(
            `<head>
                <title>  titleWebsite  </title>
            </head>
            <body></body>`
        );
        await dbDsl.sendToDb();
        await requestHandler.login(users.validUser);
        let res = await requestHandler.get('/api/link/search/1', {link: 'https://www.youtube.com/watch?v=00zxopGPYW4'});
        res.status.should.equal(200);
        res.body.title.should.equals('titleWebsite');
        res.body.linkEmbed.should.equals('https://www.youtube.com/embed/00zxopGPYW4');
        res.body.type.should.equals('Youtube');
    });

    it('Search for a youtube video which has been posted on dumondaMe', async function () {
        dbDsl.createYoutubeAnswer('10', {creator: '2', questionId: '2', created: 500, idOnYoutube: '00zxopGPYW4',
            link: 'https://www.youtube.com/watch?v=00zxopGPYW4', linkEmbed: 'https://www.youtube.com/embed/00zxopGPYW4'});

        let stubGetRequest = sandbox.stub(rp, 'get');
        stubGetRequest.resolves();
        await dbDsl.sendToDb();
        await requestHandler.login(users.validUser);
        let res = await requestHandler.get('/api/link/search/1', {link: 'https://www.youtube.com/watch?v=00zxopGPYW4'});
        res.status.should.equal(200);
        res.body.title.should.equals('youtube10Title');
        res.body.linkEmbed.should.equals('https://www.youtube.com/embed/00zxopGPYW4');
        res.body.type.should.equals('Youtube');
    });

    it('Search for a youtube video with missing id', async function () {
        let stubGetRequest = sandbox.stub(rp, 'get');
        stubGetRequest.resolves();
        await dbDsl.sendToDb();
        await requestHandler.login(users.validUser);
        let res = await requestHandler.get('/api/link/search/1', {link: 'https://www.youtube.com'});
        res.status.should.equal(400);
        res.body.errorCode.should.equal(1);
    });

    it('Youtube link exists already for question', async function () {
        dbDsl.createYoutubeAnswer('10', {creator: '2', questionId: '1', created: 500, idOnYoutube: '00zxopGPYW4',
            link: 'https://www.youtube.com/watch?v=00zxopGPYW4', linkEmbed: 'https://www.youtube.com/embed/00zxopGPYW4'});

        let stubGetRequest = sandbox.stub(rp, 'get');
        stubGetRequest.resolves();
        await dbDsl.sendToDb();
        await requestHandler.login(users.validUser);
        let res = await requestHandler.get('/api/link/search/1', {link: 'https://www.youtube.com/watch?v=00zxopGPYW4'});
        res.status.should.equal(400);
        res.body.errorCode.should.equal(2);
    });
});
