'use strict'

angular.module('app.router', [])
    .config(function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider
            .when('/app', {
                controller: 'swalkApp',
                templateUrl: 'app/views/home/home.html'
            })
            .when('/login', {
                controller: 'appLogin',
                templateUrl: 'app/views/login/login.tpl.html'
            })
            .when('/passage', {
                controller: 'appPassage',
                templateUrl: 'app/views/info/info.tpl.html'
            })
            .when('/detail/:from/:rootId/:id', {
                controller: 'passageDetail',
                templateUrl: 'app/views/info/info.detail.tpl.html'
            })
            .when('/video', {
                controller: 'videoList',
                templateUrl: 'app/views/video/video.tpl.html'
            })
            .when('/album/:from/:rootId/:id',{
                controller:'albumDetail',
                templateUrl:'app/views/info/album.detail.tpl.html'
            })
            .when('/mine', {
                controller: 'mine',
                templateUrl: 'app/views/mine/mine.tpl.html'
            })
            .otherwise({redirectTo: '/app'});
    })
