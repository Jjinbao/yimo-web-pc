angular.module('app.mine',[])
  .controller('mine',['$rootScope','$scope','$window','$http','$modal','userService',function($rootScope,$scope,$window,$http,$modal,userService){
    $scope.nowActivePanel='feed';
    var w = angular.element($window);
      $scope.getWindowDimensions = function () {
        return {'h': w.height(), 'w': w.width()};
      };
      $scope.panelWidth={}
      $scope.$watchCollection($scope.getWindowDimensions,function(newVal){
        $scope.panelWidth={
          height:newVal.h-100,
          width:newVal.w<1280?1030:newVal.w-250
        }
      })
    //修改用户头像和姓名
    $scope.changeUserInfo=function(){

    }
    //应用
    $scope.application=function(val){
        if(userService.userMsg&&userService.userMsg.accountId){
          $scope.nowActivePanel=val;
        }else{
          $scope.login(val,function(value){
            $scope.nowActivePanel=value;
          });
        }
    }
    //反馈记录
    $scope.feedRecord=function(val){
      if(userService.userMsg&&userService.userMsg.accountId){
        $scope.nowActivePanel=val;
      }else{
        $scope.login(val,function(value){
          $scope.nowActivePanel=value;
        });
      }
    }

    //用户信息
    $scope.userInfo=function(){
      $scope.nowActivePanel='user';
    }
    //退出登录
    $scope.quitLogin=function(){

    }
    //获取反馈的应用列表
    $scope.helpFeedApp=function(){
      $scope.nowActivePanel='feed';
    }

    $scope.appFeedRecord=function(val){
      console.log(val)
    }
  }])
  .directive('helpFeed',function($http){
    return {
      restrict: 'EA',
      link: function ($scope, element, attr) {
        $http({
          url: baseUrl + 'ym/app/list.api',
          method: 'POST'
        }).success(function (data) {
          $scope.appProList = data.list;
        }).error(function () {

        })
      },
      templateUrl:'app/views/mine/help.feed.tpl.html'
    }
  })
  .directive('application',function(userService,$http){
    return {
      restrict: 'EA',
      link: function ($scope, element, attr) {
        $http({
          url:baseUrl+'ym/history/list.api',
          method:'POST',
          params:{
            accountId:userService.userMsg.accountId,
            type:'app',
            sign:md5('ymy'+userService.userMsg.accountId+'app')
          }
        }).success(function(data){
          console.log(data);
          if(data.result==1){
            $scope.appList=data.list;
            $scope.appList.forEach(function(val){
              val.date=new Date(parseInt(val.readTime) * 1000).toLocaleString().replace(/:\d{1,2}$/,' ');
            })
          }
        }).error(function(){
          //$scope.alertTab('网络异常,请检查网络!',$scope.netBreakBack);
        })
      },
      templateUrl:'app/views/mine/application.tpl.html'
    }
  })
  .directive('feedRecord',function(userService,$http){
    return {
      restrict: 'EA',
      controller:function($scope,userService){

      },
      link: function ($scope, element, attr) {
        console.log('-------333----');
        $scope.reqParams = {
          publisher: userService.userMsg.accountId,
          sign: md5('ymy' + userService.userMsg.accountId),
          pageNumber: 1,
          pageSize: 10
        }
        $scope.resData = {
          list: [],
          totalNum: 0
        };
        //$scope.$on('user.feedback.record',function(evt,data){
          console.log('-------------222-------------');
          $scope.reqParams.publisher=userService.userMsg.accountId;
          $scope.reqParams.sign=md5('ymy' + userService.userMsg.accountId);
          $http({
            url: baseUrl + 'ym/question/list.api',
            method: 'POST',
            params: $scope.reqParams
          }).success(function (data) {
            console.log(data);
            if (data.result == 1) {
              $scope.resData.list = $scope.resData.list.concat(data.categoryQuestionList);
              $scope.resData.totalNum = data.totalPage;
            }
            if($scope.resData.list&&$scope.resData.list.length>0){
              $scope.resData.list.forEach(function(val){
                val.useDate=new Date(parseInt(val.createTime) * 1000).toLocaleString().replace(/:\d{1,2}$/,' ').substr(0,10);
                if(val.status==1){
                  val.statusWord='待处理';
                }else if(val.status==2){
                  val.statusWord='已完成';
                }else if(val.status==3){
                  val.statusWord='处理中';
                }
              })
            }
          }).error(function () {
            //$scope.alertTab('网络异常,请检查网络!', $scope.netBreakBack);
          })
        //})
      },
      templateUrl:'app/views/mine/feed.record.html'
    }
  })
  .directive('userInfo',function(){
    return {
      restrict: 'EA',
      link: function (scope, element, attr) {

      },
      templateUrl:'app/views/mine/user.info.html'
    }
  })
