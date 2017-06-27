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
        $scope.myAppList=staticAppList;
        console.log($scope.myAppList);
        // $http({
        //     url:baseUrl+'ym/app/list.api',
        //     method:'POST'
        // }).success(function(data){
        //     console.log(data);
        //     $scope.myAppList=data.list;
        // })
        //获取用户已经添加的应用
        $scope.myAddAppList=[];
        try{
            //var appList=window.external.addedApp();
            var appList=window.localStorage.getItem('addApps');
            if(appList){
                $scope.myAddAppList=JSON.parse(appList);
                for(var m=0;m<$scope.myAddAppList.length;m++){
                    for(var k=0;k<$scope.myAppList.length;k++){
                        if($scope.myAddAppList[m].id==$scope.myAppList[k].id){
                            $scope.myAppList[k].status='已添加';
                            $scope.myAppList[k].enabled=false;
                        }
                    }
                }
            }else{
                $scope.myAddAppList=[];
            }

        }catch (e){

        }
        $scope.addApps=function(val){
            if(!val.enabled){
                return;
            }
            for(var i=0;i<$scope.myAddAppList.length;i++){
                if($scope.myAddAppList[i].id==val.id){
                    return;
                }
            }
            val.enabled=false;
            val.status='已添加'
            $scope.myAddAppList.push(val);
            $rootScope.successAlter('添加成功');
            var appStr=JSON.stringify($scope.myAddAppList);
            try{
                window.localStorage.setItem('addApps',appStr);
                //window.external.addApp(appStr);
            }catch (e){

            }
        }

        //删除应用
        $scope.deleteApp=function(val){
            val.delete=false;
            $rootScope.deleteAppModel(val,$scope.deleteOneApp);
        }

        $scope.deleteOneApp=function(val){
            val.enabled=true;
            val.status='添加'
            var index=0;
            for(var i=0;i<$scope.myAddAppList.length;++i){
                if(val.id==$scope.myAddAppList[i].id){
                    index=i;
                    break;
                }
            }

            for(var k=0;k<$scope.myAppList.length;k++){
                if($scope.myAppList[k].id==val.id){
                    $scope.myAppList[k].enabled=true;
                    $scope.myAppList[k].status='添加';
                    break;
                }
            }
            console.log($scope.myAppList);
            $scope.myAddAppList.remove(index);
            var apps=JSON.stringify($scope.myAddAppList);
            try{
                $scope.$digest();
            }catch (e){
                console.log('222222222222');
            }

            try{
                window.localStorage.setItem('addApps',apps);
                //window.external.addApp(apps);
            }catch (e){

            }
        }

        $scope.openOneApp=function(val){
            console.log(val);
            try{
                var appInfo=JSON.stringify(val);
                window.external.openApp(appInfo);
            }catch (e){

            }
        }

        $scope.mouseRightClick=function(val){
            console.log(val)
        }

    }])

