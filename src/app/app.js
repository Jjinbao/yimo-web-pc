'use strict'

angular.module('swalk', ['ngRoute','ngTouch','app.router','app.login','app.home','app.info','app.teach','app.mine'])
    /*所有控制器的父控制器*/
    .controller('rootTabCtrl', ['$scope','$location',function($scope,$location) {
        $scope.activeTab='ZX'
        $scope.clickTab=function(val){
            if($scope.activeTab==val){
                return;
            }
          $scope.activeTab=val;
        }
    }])

    //隐藏底部导航栏
    .directive('hideTabs', function($rootScope) {
        return {
            restrict: 'A',
            link: function(scope, element, attributes) {
                scope.$on('$ionicView.beforeEnter', function() {
                    scope.$watch(attributes.hideTabs, function(value) {
                        $rootScope.hideTabs = value;
                    });
                });
                scope.$on('$ionicView.beforeLeave', function() {
                    $rootScope.hideTabs = false;
                });
            }
        };
    });



