'use strict'

angular.module('app.router', [])
    .config(function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider
            //首页界面，包括我的应用和应用选择
            .when('/app', {
                controller: 'swalkApp',
                templateUrl: 'app/views/home/home.html'
            })
            //登录界面
            .when('/login', {
                controller: 'appLogin',
                templateUrl: 'app/views/login/login.tpl.html'
            })
            //文章列表界面
            .when('/passage', {
                controller: 'appPassage',
                templateUrl: 'app/views/info/info.tpl.html'
            })
            //文章详情界面
            .when('/detail/:from/:rootId/:id', {
                controller: 'passageDetail',
                templateUrl: 'app/views/info/info.detail.tpl.html'
            })
            //视频列表界面
            .when('/video', {
                controller: 'videoList',
                templateUrl: 'app/views/video/video.tpl.html'
            })
            //视频专辑详情界面
            .when('/album/:from/:rootId/:id',{
                controller:'albumDetail',
                templateUrl:'app/views/info/album.detail.tpl.html'
            })
            //我的界面
            .when('/mine', {
                controller: 'mine',
                templateUrl: 'app/views/mine/mine.tpl.html'
            })
            //如果地址错误，重定向到首页，我的应用界面
            .otherwise({redirectTo: '/app'});
    })
