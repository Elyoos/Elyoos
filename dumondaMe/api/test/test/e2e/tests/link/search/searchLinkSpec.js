'use strict';

const users = require('dumonda-me-server-test-util').user;
const dbDsl = require('dumonda-me-server-test-util').dbDSL;
const requestHandler = require('dumonda-me-server-test-util').requestHandler;
const rp = require('request-promise');
const sinon = require('sinon');
const should = require('chai').should();

describe('Search a website link', function () {

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
            topics: ['Spiritual', 'Education'], language: 'en', modified: 700
        });
    });

    afterEach(function () {
        sandbox.restore();
        return requestHandler.logout();
    });

    it('Search for a website which has not yet been posted on dumondaMe', async function () {
        let stubGetRequest = sandbox.stub(rp, 'get');
        stubGetRequest.resolves(
            `<head>
                <title>titleWebsite</title>
                <meta property="og:title" content="ogTitle">
                <meta property="og:description" content="ogDescription">
                <meta property="og:image" content="https://www.example.org/image.jpg">
                <meta property="og:image" content="https://www.example.org/image2.jpg">
                <meta property="og:type" content="article">
            </head>
            <body></body>`
        );
        await dbDsl.sendToDb();
        await requestHandler.login(users.validUser);
        let res = await requestHandler.get('/api/link/search/1', {link: 'https://www.example.org/blog/1224'});
        res.status.should.equal(200);
        res.body.title.should.equals('ogTitle');
        res.body.pageType.should.equals('article');
        res.body.imageUrl.should.equals('https://www.example.org/image.jpg');
        should.not.exist(res.body.linkEmbed);
        should.not.exist(res.body.description);
        res.body.type.should.equals('Link');
    });

    it('Search for a website which has been posted on dumondaMe', async function () {

        dbDsl.createLinkAnswer('10', {creator: '2', questionId: '2', created: 500, pageType: 'article',
            link: 'https://www.example.org/blog/1224'});

        let stubGetRequest = sandbox.stub(rp, 'get');
        stubGetRequest.rejects('error');
        await dbDsl.sendToDb();
        await requestHandler.login(users.validUser);
        let res = await requestHandler.get('/api/link/search/1', {link: 'https://www.example.org/blog/1224'});
        res.status.should.equal(200);
        res.body.title.should.equals('link10Title');
        res.body.pageType.should.equals('article');
        res.body.imageUrl.should.equals(`${process.env.PUBLIC_IMAGE_BASE_URL}/link/10/preview.jpg`);
        res.body.type.should.equals('Link');
        should.not.exist(res.body.description);
    });

    it('Link answer which already exists for question', async function () {
        dbDsl.createLinkAnswer('10', {creator: '2', questionId: '1', created: 500, pageType: 'article',
            link: 'https://www.example.org/blog/1224'});

        let stubGetRequest = sandbox.stub(rp, 'get');
        stubGetRequest.resolves();
        await dbDsl.sendToDb();
        await requestHandler.login(users.validUser);
        let res = await requestHandler.get('/api/link/search/1', {link: 'https://www.example.org/blog/1224'});
        res.status.should.equal(400);
        res.body.errorCode.should.equal(2);
    });

    it('Link to image with relative path', async function () {
        let stubGetRequest = sandbox.stub(rp, 'get');
        stubGetRequest.resolves(
            `<head>
                <title>titleWebsite</title>
                <meta property="og:title" content="ogTitle">
                <meta property="og:description" content="ogDescription">
                <meta property="og:image" content="img/image.jpg">
                <meta property="og:type" content="article">
            </head>
            <body></body>`
        );
        await dbDsl.sendToDb();
        await requestHandler.login(users.validUser);
        let res = await requestHandler.get('/api/link/search/1', {link: 'https://www.example.org/blog/1224'});
        res.status.should.equal(200);
        res.body.title.should.equals('ogTitle');
        res.body.pageType.should.equals('article');
        res.body.imageUrl.should.equals('https://www.example.org/img/image.jpg');
        should.not.exist(res.body.linkEmbed);
        should.not.exist(res.body.description);
        res.body.type.should.equals('Link');
    });

    it('Only logged in user can search for a link', async function () {
        let stubGetRequest = sandbox.stub(rp, 'get');
        stubGetRequest.resolves(
            `<head>
                <title>titleWebsite</title>
                <meta property="og:title" content="ogTitle">
                <meta property="og:description" content="ogDescription">
                <meta property="og:image" content="https://www.example.org/image.jpg">
                <meta property="og:image" content="https://www.example.org/image2.jpg">
                <meta property="og:type" content="article">
            </head>
            <body></body>`
        );
        await dbDsl.sendToDb();
        let res = await requestHandler.get('/api/link/search/1', {link: 'https://www.example.org/blog/1224'});
        res.status.should.equal(401);
    });
});
