'use strict'
angular.module('app.info',[])
  .controller('appPassage',['$scope','$http','$window',function($scope,$http,$window){
      var infoWindow = angular.element($window);
      $scope.getWindowDimensions = function () {
          return {'h': infoWindow.height(), 'w': infoWindow.width()};
      };
      $scope.panelPassageWidth = {}
      $scope.$watchCollection($scope.getWindowDimensions, function (newValue) {
          $scope.panelPassageWidth = {
              height: newValue.h - 100
          }
      })
    //获取轮播图
    $http({
      url: baseUrl + 'ym/show/list.api',
      method: 'POST'
    }).success(function (data) {
      if(data.result==1){
        //$scope.causeul=data;
        console.log(data);
      }
    }).error(function () {

    })

    //获取资讯列表
     $http({
       url: baseUrl + 'ym/news/list.api',
       method: 'POST',
       params:{
         pageNumber:1,
         pageSize:10
       }
     }).success(function(data){
       console.log(data);
     })
  }])
    .controller('videoList',['$scope',function(){
        console.log('视频列表');
    }])
