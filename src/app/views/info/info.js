angular.module('app.info',['angular-carousel'])
  .controller('appInformation',['$scope','$http',function($scope,$http){
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
