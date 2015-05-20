'use strict';

var detailContactCtrl = require('../../../app/modules/contact/detailContactCtrl')[8];
var moment = require('../../../app/lib/moment/moment');

describe('Tests of the detail contact controller', function () {
    var scope, state, stateParams, ContactUserActions, ContactDetail, CountryCodeConverter, ContactLeftNavElements;

    beforeEach(function (done) {
        inject(function ($rootScope) {

            ContactDetail = {};
            ContactDetail.get = function () {
            };

            ContactUserActions = {};
            ContactUserActions.setConnectionState = function () {
            };
            ContactUserActions.setPrivacySettings = function () {
            };

            ContactLeftNavElements = {};

            state = {};
            state.go = function () {
            };

            stateParams = {};

            CountryCodeConverter = {};
            CountryCodeConverter.countryCodes = [];

            CountryCodeConverter.getCountryCode = function () {
            };
            CountryCodeConverter.getCountry = function () {
            };

            scope = $rootScope.$new();
            done();
        });
    });

    it('Open the contact detail page', function () {

        var getContactDetail = sinon.stub(ContactDetail, 'get'),
            getCountry = sinon.stub(CountryCodeConverter, 'getCountry'),
            response = {
                contact: {
                    name: 'Hans Muster',
                    country: 'CH',
                    birthday: 385948800
                },
                statistic: 'statistic',
                privacySettings: 'privacySettings',
                numberOfContacts: 'numberOfContacts',
                numberOfSameContacts: 'numberOfSameContacts',
                contacts: 'contacts'
            };

        moment.locale('de');
        stateParams.userId = '2';

        getContactDetail.withArgs({
            userId: '2',
            skipContacts: 0,
            contactsPerPage: 7,
            mode: 'detailOfUser'
        }).returns(response);
        getCountry.withArgs('CH').returns('Schweiz');

        detailContactCtrl(scope, state, stateParams, ContactDetail, moment, CountryCodeConverter, ContactUserActions,ContactLeftNavElements);
        getContactDetail.callArg(1);

        expect(scope.contact.country).to.equals('Schweiz');
        expect(scope.contact.birthday).to.equals('Geb. 26.3.1982');
        expect(scope.contact.userId).to.equals('2');
        expect(scope.statistic).to.equals('statistic');
        expect(scope.privacySettings).to.equals('privacySettings');
        expect(scope.numberOfContacts).to.equals('numberOfContacts');
        expect(scope.numberOfSameContacts).to.equals('numberOfSameContacts');
        expect(scope.contacts).to.equals('contacts');
    });

    it('Open the contact detail page with missing country and birthday', function () {

        var getContactDetail = sinon.stub(ContactDetail, 'get'),
            getCountry = sinon.stub(CountryCodeConverter, 'getCountry'),
            response = {
                contact: {
                    name: 'Hans Muster'
                },
                statistic: 'statistic',
                privacySettings: 'privacySettings',
                numberOfContacts: 'numberOfContacts',
                numberOfSameContacts: 'numberOfSameContacts',
                contacts: 'contacts'
            };

        stateParams.userId = '2';

        getContactDetail.withArgs({
            userId: '2',
            skipContacts: 0,
            contactsPerPage: 7,
            mode: 'detailOfUser'
        }).returns(response);
        getCountry.withArgs('CH').returns('Schweiz');

        detailContactCtrl(scope, state, stateParams, ContactDetail, moment, CountryCodeConverter, ContactUserActions, ContactLeftNavElements);
        getContactDetail.callArg(1);

        expect(scope.contact.country).to.be.undefined;
        expect(scope.contact.birthday).to.be.undefined;
        expect(scope.contact.userId).to.equals('2');
        expect(scope.statistic).to.equals('statistic');
        expect(scope.privacySettings).to.equals('privacySettings');
        expect(scope.numberOfContacts).to.equals('numberOfContacts');
        expect(scope.numberOfSameContacts).to.equals('numberOfSameContacts');
        expect(scope.contacts).to.equals('contacts');
    });

    it('Append more contacts to the contact list', function () {

        var getContactDetail = sinon.stub(ContactDetail, 'get'),
            response = {
                contacts: ['3', '4', '5']
            };

        stateParams.userId = '2';
        scope.contacts = ['1', '2'];
        getContactDetail.withArgs({
            userId: '2',
            skipContacts: 7,
            contactsPerPage: 28,
            mode: 'onlyContacts'
        }).returns(response);

        detailContactCtrl(scope, state, stateParams, ContactDetail, moment, CountryCodeConverter, ContactUserActions, ContactLeftNavElements);
        scope.appendContacts();

        getContactDetail.getCall(1).callArg(1);

        expect(scope.contacts).to.eql(['1', '2', '3', '4', '5']);
    });

    it('Open the details of a user', function () {

        var mockStateGo = sinon.mock(state);

        detailContactCtrl(scope, state, stateParams, ContactDetail, moment, CountryCodeConverter, ContactUserActions, ContactLeftNavElements);

        mockStateGo.expects('go').withArgs('contact.detail', {userId: '2'});
        scope.openUserDetails('2');
        mockStateGo.verify();
    });
});
