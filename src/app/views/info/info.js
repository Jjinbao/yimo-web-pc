'use strict'
angular.module('app.info', [])
    .controller('appPassage', ['$scope', '$http', '$window','$location', function ($scope, $http, $window,$location) {
        var infoWindow = angular.element($window);
        $scope.getWindowDimensions = function () {
            return {'h': infoWindow.height(), 'w': infoWindow.width()};
        };
        $scope.panelPassageWidth = {}
        $scope.$watchCollection($scope.getWindowDimensions, function (newValue) {
            $scope.panelPassageWidth = {
                //left:((newValue.w < 1366 ? 1366:newValue.w)-1129)/2
                height: newValue.h - 100
            }
        })
        //获取轮播图
        $http({
            url: baseUrl + 'ym/show/list.api',
            method: 'POST'
        }).success(function (data) {
            if (data.result == 1) {
                //$scope.causeul=data;
                console.log(data);
            }
        }).error(function () {

        })

        //获取资讯列表
        $scope.passageList={
            list:[],
            count:0
        }
        $http({
            url: baseUrl + 'ym/news/list.api',
            method: 'POST',
            params: {
                pageNumber: 1,
                pageSize: 10
            }
        }).success(function (data) {
            console.log(data);
            if(data.result==1){
                $scope.passageList.list=$scope.passageList.list.concat(data.newsList);
                $scope.passageList.count=data.totalPage;
            }
        })

        $scope.toDetailPage=function(val){
            $location.path('/detail/list/'+val.rootId+'/'+val.id);
        }

        $('#contain').on('scroll',function(){
            // console.log('滚动了滚动了------');
            // console.log($('#contain').scrollTop());
            // console.log($scope.getWindowDimensions().h-100);
            // console.log($('#passagelist').height());
            // console.log($('#passagelist').height()-$scope.getWindowDimensions().h+100);
            // if ($('#contain').scrollTop() >= $('#passagelist').height()-$scope.getWindowDimensions().h+50) {
                // 滚动到底部了
                // alert('滚动到底部了');
            // }
        });
    }])
    .controller('passageDetail',['$scope','$location','$routeParams','$http','$sce','$window',function($scope,$location,$routeParams,$http,$sce,$window){
        console.log($routeParams.rootId);
        console.log($routeParams.id);
        var infoWindow = angular.element($window);
        $scope.getWindowDimensions = function () {
            return {'h': infoWindow.height(), 'w': infoWindow.width()};
        };
        $scope.PassageDetailWidth = {}
        $scope.$watchCollection($scope.getWindowDimensions, function (newValue) {
            $scope.PassageDetailWidth = {
                //left:((newValue.w < 1366 ? 1366:newValue.w)-1129)/2
                height: newValue.h - 100
            }
        })
        $http({
            url:baseUrl+'ym/news/field.api',
            method:'POST',
            params:{
                id:$routeParams.id
            }
        }).success(function(res){
            console.log(res);
            if(res.result==1){
                $scope.detailMsg=res;
                $scope.detailMsg.detail=$sce.trustAsHtml(res.text);
                $scope.detailMsg.formateDate=new Date(res.pubTime*1000).format('yyyy-MM-dd');
            }
        })

        $scope.backToPre=function(){
            window.history.back();
        }
    }])
    .controller('videoList', ['$scope', function ($scope) {
        console.log('视频列表');
    }])
