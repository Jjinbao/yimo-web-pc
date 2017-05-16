'use strict'
angular.module('app.home', [])
    .controller('swalkApp', ['$rootScope', '$scope', '$http', '$interval', '$window', function ($rootScope, $scope, $http, $interval, $window) {
        $scope.nowActive = 'myApp';
        $scope.changeItem = function (val) {
            if ($scope.nowActive == val) {
                return;
            }
            $scope.nowActive = val;
        };

        var appWindow = angular.element($window);
        $scope.getWindowDimensions = function () {
            return {'h': appWindow.height(), 'w': appWindow.width()};
        };
        $scope.panelWidth = {}
        $scope.$watchCollection($scope.getWindowDimensions, function (newVal) {
            $scope.panelWidth = {
                height: newVal.h - 100,
                //width: newVal.w < 1366 ? 1116: newVal.w - 250
                width: newVal.w - 250
            }
        })

        $http({
            url:baseUrl+'ym/app/list.api',
            method:'POST'
        }).success(function(data){
            console.log(data);
        })


    }])
