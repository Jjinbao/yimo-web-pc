'use strict'

angular.module('app.router',[])
  .config(function($routeProvider,$locationProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider
      .when('/cloud',{
        controller:'swalkHome',
        templateUrl:'app/views/home/home.html'
      })
      .when('/login',{
        controller:'appLogin',
        templateUrl:'app/views/login/login.tpl.html'
      })
      .when('/info',{
        controller:'appInformation',
        templateUrl:'app/views/info/info.tpl.html'
      })
      // .when('/teach',{
      //   controller:'teach',
      //   templateUrl:'app/views/teach/teach.tpl.html'
      // })
      .when('/mine',{
        controller:'mine',
        templateUrl:'app/views/mine/mine.tpl.html'
      })
      .otherwise({redirectTo:'/cloud'});
  })
