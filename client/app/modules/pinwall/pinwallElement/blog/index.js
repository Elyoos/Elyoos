'use strict';

var app = angular.module('elyoosApp');
var directive = require('./directive.js');

app.directive(directive.name, directive.directive);

app.controller('HomePinwallBlogDetail', require('./detail/blogDetailCtrl'));