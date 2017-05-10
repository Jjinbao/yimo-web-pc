'use strict'

angular.module('app.router',[])
  .config(function($routeProvider,$locationProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider
      .when('/app',{
        controller:'swalkApp',
        templateUrl:'app/views/home/home.html'
      })
      .when('/login',{
        controller:'appLogin',
        templateUrl:'app/views/login/login.tpl.html'
      })
      .when('/passage',{
        controller:'appPassage',
        templateUrl:'app/views/info/info.tpl.html'
      })
      .when('/teach',{
        controller:'teach',
        templateUrl:'app/views/teach/teach.tpl.html'
      })
      .when('/mine',{
        controller:'mine',
        templateUrl:'app/views/mine/mine.tpl.html',
          cache:false
      })
      .otherwise({redirectTo:'/app'});
  })
