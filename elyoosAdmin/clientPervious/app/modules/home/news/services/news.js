'use strict';

module.exports = ['$resource', function ($resource) {
    return $resource('/api/admin/news', null, {
        'modifiy': {method: 'PUT'}
    });
}];