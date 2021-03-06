'use strict';

const users = require('dumonda-me-server-test-util').user;
const db = require('dumonda-me-server-test-util').db;
const dbDsl = require('dumonda-me-server-test-util').dbDSL;
const requestHandler = require('dumonda-me-server-test-util').requestHandler;

describe('Change regions of a commitment', function () {

    beforeEach(async function () {
        await dbDsl.init(3);

        dbDsl.createRegion('international', {de: 'InternationalDe', en: 'InternationalEn'});
        dbDsl.createRegion('region-1', {parentRegionId: 'international', de: 'Region1De', en: 'Region1En'});
        dbDsl.createRegion('region-2', {parentRegionId: 'international', de: 'Region2De', en: 'Region2En'});
        dbDsl.createRegion('region-3', {parentRegionId: 'international', de: 'Region3De', en: 'Region3En'});

        dbDsl.createCommitment('1', {
            adminId: '1', topics: ['Spiritual', 'Meditation'], language: 'de', created: 700,
            website: 'https://www.example.org/', regions: ['region-1']
        });

        dbDsl.createCommitment('2', {
            adminId: '2', topics: ['Spiritual'], language: 'de', created: 701,
            website: 'https://www.example2.org/', regions: ['region-2']
        });

        await dbDsl.sendToDb();
    });

    afterEach(function () {
        return requestHandler.logout();
    });

    it('Change regions of a commitment', async function () {
        await requestHandler.login(users.validUser);
        let res = await requestHandler.put('/api/user/commitment/region/1', {
            regions: ['region-2', 'region-3'],
        });
        res.status.should.equal(200);

        let resp = await db.cypher().match("(commitment:Commitment {commitmentId: '1'})")
            .optionalMatch("(commitment)-[:BELONGS_TO_REGION]->(region:Region)")
            .return(`DISTINCT region.regionId AS region`).orderBy(`region`).end().send();
        resp.length.should.equals(2);
        resp[0].region.should.equals('region-2');
        resp[1].region.should.equals('region-3');
    });

    it('Change region of a commitment to international', async function () {
        await requestHandler.login(users.validUser);
        let res = await requestHandler.put('/api/user/commitment/region/1', {
            regions: ['international'],
        });
        res.status.should.equal(200);

        let resp = await db.cypher().match("(commitment:Commitment {commitmentId: '1'})")
            .optionalMatch("(commitment)-[:BELONGS_TO_REGION]->(region:Region)")
            .return(`DISTINCT region.regionId AS region`).orderBy(`region`).end().send();
        resp.length.should.equals(1);
        resp[0].region.should.equals('international');
    });

    it('If international is set, not other region is allowed', async function () {
        await requestHandler.login(users.validUser);
        let res = await requestHandler.put('/api/user/commitment/region/1', {
            regions: ['international', 'region-3'],
        });
        res.status.should.equal(401);
    });

    it('Region does not exist', async function () {
        await requestHandler.login(users.validUser);
        let res = await requestHandler.put('/api/user/commitment/region/1', {
            regions: ['region-4'],
        });
        res.status.should.equal(401);
    });

    it('Not allowed to change region of a commitment where user is not admin', async function () {
        await requestHandler.login(users.validUser);
        let res = await requestHandler.put('/api/user/commitment/region/2', {
            regions: ['Test3'],
        });
        res.status.should.equal(400);
    });

    it('Only allowed change regions as not logged in user', async function () {
        let res = await requestHandler.put('/api/user/commitment/region/1', {
            topics: ['test1', 'Test3'],
        });
        res.status.should.equal(401);
    });
});
