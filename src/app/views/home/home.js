'use strict'
angular.module('app.home', [])
  .controller('swalkHome', ['$rootScope','$scope', '$http', '$interval', function ($rootScope,$scope, $http, $interval) {
    $scope.nowActive = 'ymy';
    $scope.changeItem = function (val) {
      if ($scope.nowActive == val) {
        return;
      }
      $scope.nowActive = val;
    };
    $scope.menuStyle={
      height:$rootScope.windowHeight-100+'px'
    }

  }])
