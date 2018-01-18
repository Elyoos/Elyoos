'use strict';

let users = require('elyoos-server-test-util').user;
let db = require('elyoos-server-test-util').db;
let requestHandler = require('elyoos-server-test-util').requestHandler;
let should = require('chai').should();

describe('Integration Tests for getting link page detail', function () {

    beforeEach(function () {

        let commands = [];
        return db.clearDatabase().then(function () {
            commands.push(db.cypher().create("(:User {email: 'user@irgendwo.ch', emailNormalized: 'user@irgendwo.ch', password: '$2a$10$JlKlyw9RSpt3.nt78L6VCe0Kw5KW4SPRaCGSPMmpW821opXpMgKAm', name: 'user Meier', surname: 'Meier', forename:'user', userId: '1'})").end().getCommand());
            commands.push(db.cypher().create("(:User {name: 'user Meier2', userId: '2'})").end().getCommand());
            commands.push(db.cypher().create("(:User {name: 'user Meier3', userId: '3'})").end().getCommand());
            commands.push(db.cypher().create("(:Page {title: 'pageTitle', label: 'Link', description: 'page', link: 'www.link.com/test', hostname: 'www.link.com', heightPreviewImage: 100," +
                "created: 500, modified: 501, pageId: '0', topic: {topic}, language: {language}})").end({topic: ['environmental', 'spiritual'], language: ['en', 'de']}).getCommand());
            return db.cypher().create("(:Page {title: 'pageTitle2', label: 'Link', description: 'page2', link: 'www.link2.com/test', hostname: 'www.link2.com'," +
                "created: 502, modified: 503, pageId: '1', topic: {topic}, language: {language}})").end({topic: ['environmental', 'spiritual'], language: ['en', 'de']}).send(commands);

        });
    });

    afterEach(function () {
        return requestHandler.logout();
    });


    it('Getting the detail of a link page', function () {

        let commands = [];

        commands.push(db.cypher().match("(u:User {userId: '1'})")
            .create("(u)-[:HAS_PRIVACY_NO_CONTACT]->(:Privacy {profile: false, image: false, profileData: true, contacts: true}), " +
            "(u)-[:HAS_PRIVACY {type: 'Freund'}]->(:Privacy {profile: true, image: true}), " +
            "(u)-[:HAS_PRIVACY {type: 'Bekannter'}]->(:Privacy {profile: false, image: false})")
            .end().getCommand());
        commands.push(db.cypher().match("(a:User {userId: '3'}), (b:User {userId: '1'})")
            .create("(b)-[:IS_CONTACT {type: 'Freund'}]->(a)")
            .end().getCommand());
        commands.push(db.cypher().match("(a:User {userId: '1'}), (b:User {userId: '3'})")
            .create("(b)-[:IS_CONTACT {type: 'Freund'}]->(a)")
            .end().getCommand());
        commands.push(db.cypher().match("(a:User {userId: '2'}), (b:User {userId: '1'})")
            .create("(b)-[:IS_CONTACT {type: 'Bekannter'}]->(a)")
            .end().getCommand());
        commands.push(db.cypher().match("(u:User {userId: '2'})")
            .create("(u)-[:HAS_PRIVACY_NO_CONTACT]->(:Privacy {profile: false, image: true, profileData: true, contacts: true}), " +
            "(u)-[:HAS_PRIVACY {type: 'Freund'}]->(:Privacy {profile: true, image: true}), " +
            "(u)-[:HAS_PRIVACY {type: 'Bekannter'}]->(:Privacy {profile: true, image: true})")
            .end().getCommand());
        commands.push(db.cypher().match("(a:Page {pageId: '0'}), (b:User {userId: '1'})")
            .create("(b)-[:IS_AUTHOR]->(a)")
            .end().getCommand());
        commands.push(db.cypher().match("(a:Page {pageId: '0'}), (b:User {userId: '2'})")
            .create("(b)-[:IS_AUTHOR]->(a)")
            .end().getCommand());
        commands.push(db.cypher().match("(a:Page {pageId: '0'}), (b:User {userId: '1'})")
            .create("(b)-[:IS_ADMIN]->(a)")
            .end().getCommand());
        commands.push(db.cypher().match("(a:Page {pageId: '0'}), (b:User {userId: '1'})")
            .create("(b)-[:RECOMMENDS]->(:Recommendation {created: 500, recommendationId: '0'})-[:RECOMMENDS]->(a)")
            .end().getCommand());
        commands.push(db.cypher().match("(a:Page {pageId: '0'}), (b:User {userId: '2'})")
            .create("(b)-[:RECOMMENDS]->(:Recommendation {created: 500, recommendationId: '1'})-[:RECOMMENDS]->(a)")
            .end().getCommand());
        commands.push(db.cypher().match("(a:Page {pageId: '0'}), (b:User {userId: '3'})")
            .create("(b)-[:RECOMMENDS]->(:Recommendation {created: 501, recommendationId: '2'})-[:RECOMMENDS]->(a)")
            .end().getCommand());

        return db.cypher().match("(a:Page {pageId: '0'}), (b:User {userId: '2'})")
            .create("(b)-[:IS_ADMIN]->(a)")
            .end().send(commands)
            .then(function () {
                return requestHandler.login(users.validUser);
            }).
            then(function () {
                return requestHandler.get('/api/page/detail', {
                    pageId: '0',
                    label: 'Link'
                });
            }).then(function (res) {
                res.status.should.equal(200);
                res.body.page.pageId.should.equals('0');
                res.body.page.title.should.equals('pageTitle');
                res.body.page.description.should.equals('page');
                res.body.page.created.should.equals(500);
                res.body.page.modified.should.equals(501);
                res.body.page.link.should.equals('www.link.com/test');
                res.body.page.hostname.should.equals('www.link.com');
                res.body.page.label.should.equals('Link');
                res.body.page.imageUrl.should.equals('pages/0/normal.jpg');

                res.body.page.topic.length.should.equals(2);
                res.body.page.topic[0].should.equals('environmental');
                res.body.page.topic[1].should.equals('spiritual');
                res.body.page.language.length.should.equals(2);
                res.body.page.language[0].should.equals('en');
                res.body.page.language[1].should.equals('de');

                res.body.administrators.list.length.should.equals(2);
                res.body.administrators.list[0].name.should.equals('user Meier');
                res.body.administrators.list[0].userId.should.equals('1');
                res.body.administrators.list[0].profileUrl.should.equals('profileImage/1/profilePreview.jpg');
                res.body.administrators.list[1].name.should.equals('user Meier2');
                res.body.administrators.list[1].userId.should.equals('2');
                res.body.administrators.list[1].profileUrl.should.equals('profileImage/default/profilePreview.jpg');
                res.body.administrators.isAdmin.should.be.true;

                res.body.recommendation.user.profileUrl.should.equals('profileImage/1/thumbnail.jpg');
                res.body.recommendation.user.recommendationId.should.equals('0');
                
                res.body.recommendation.summary.contact.numberOfRecommendations.should.equals(2);
                res.body.recommendation.summary.all.numberOfRecommendations.should.equals(3);
            });
    });

    it('Getting the detail of a link page without image', function () {


        return requestHandler.login(users.validUser).then(function () {
                return requestHandler.get('/api/page/detail', {
                    pageId: '1',
                    label: 'Link'
                });
            }).then(function (res) {
                res.status.should.equal(200);
                res.body.page.pageId.should.equals('1');
  
                should.not.exist(res.body.page.imageUrl);
            });
    });
});