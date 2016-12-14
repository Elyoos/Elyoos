'use strict';

let app = require('../../../server');
let dbConfig = require('elyoos-server-lib').databaseConfig;
let elyoosTestUtil = require('elyoos-server-test-util');

elyoosTestUtil.init(require('elyoos-server-lib'), app);

elyoosTestUtil.stubEmailQueue();
elyoosTestUtil.stubLimitRate();

describe('Initialize Server for all integration tests', function () {

    before(function (done) {
        app.on('start', function () {
            dbConfig.connected.then(function () {
                done();
            });
        });
    });

    it('dummy Test', function () {
    });
});
