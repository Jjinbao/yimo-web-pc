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
                height: newVal.h - 60,
                //width: newVal.w < 1366 ? 1116: newVal.w - 250
                width: newVal.w - 200
            }
        })

        $scope.myAppList=[];
        $http({
            url:baseUrl+'ym/app/list.api',
            method:'POST'
        }).success(function(data){
            $scope.myAppList=data.list;
            console.log($scope.myAppList);
        })

        //获取用户已经添加的应用
        $scope.myAddAppList=[];
        try{
            var appList=window.external.addedApp();
            if(appList){
                $scope.myAddAppList=[];
            }else{
                $scope.myAddAppList=JSON.parse(appList);
            }

        }catch (e){
            console.log('返回错误')
        }
        $scope.addApps=function(val){

            for(var i=0;i<$scope.myAddAppList.length;i++){
                if($scope.myAddAppList[i].appId==val.appId){
                    return;
                }
            }
            $scope.myAddAppList.push(val);
            $rootScope.successAlter('添加成功');
            var appStr=JSON.stringify($scope.myAddAppList);
            console.log(appStr);
            try{
                window.external.addApp(appStr);
            }catch (e){

            }
        }

        $scope.openOneApp=function(val){
            try{
                var appInfo=JSON.stringify(val);
                console.log(appInfo);
                window.external.openApp(appInfo);
            }catch (e){
                console.log('--------');
            }
        }

    }])
