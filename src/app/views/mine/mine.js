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
          width:newVal.w<1366?1116:newVal.w-250
        }
      })

    //修改用户头像和姓名
    $scope.changeUserInfo=function(){
      $scope.haveLoginuser=userService.userMsg;
      $scope.$emit('user.nav.img',$scope.haveLoginuser.smallImg);
    }
      if(userService.userMsg.accountId){
        $scope.changeUserInfo();
      }

      $scope.mineLogin=function(){
        $scope.login('',function(value){
          $scope.changeUserInfo();
        });
      }
    //应用
    $scope.application=function(val){
      if($scope.nowActivePanel==val){
        return;
      }
        if(userService.userMsg&&userService.userMsg.accountId){
          $scope.nowActivePanel=val;
        }else{
          $scope.login(val,function(value){
            $scope.changeUserInfo();
            $scope.nowActivePanel=value;
          });
        }
    }
      $scope.historySubtitle='';
      $scope.$on('history.type',function(evt,data){
        $scope.historySubtitle=data;
        $scope.nowActivePanel=''
      })

      $scope.$on('help.feed.type',function(evt,data){
        console.log(data);
        $scope.helpFeedData=data;
        $scope.nowActivePanel='helpFeedApp'
      })
    //反馈记录
    $scope.feedRecord=function(val){
      if($scope.nowActivePanel==val){
        return;
      }
      if(userService.userMsg&&userService.userMsg.accountId){
        $scope.nowActivePanel=val;
      }else{
        $scope.login(val,function(value){
          $scope.changeUserInfo();
          $scope.nowActivePanel=value;
        });
      }
    }

    //用户信息
    $scope.userInfo=function(){
      if($scope.nowActivePanel=='user'){
        return;
      }
      if(userService.userMsg&&userService.userMsg.accountId){
        $scope.nowActivePanel='user';
      }else{
        $scope.login('',function(value){
          $scope.changeUserInfo();
          $scope.nowActivePanel='user';
        });
      }
    }
    //退出登录
    $scope.quitLogin=function(){
      $scope.haveLoginuser=userService.userMsg={};
      $scope.haveLoginuser='';
      $scope.$emit('user.nav.img','');
    }
    //获取反馈的应用列表
    $scope.helpFeedApp=function(){
      $scope.nowActivePanel='feed';
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

        $scope.appFeedRecord=function(val){
          $scope.$emit('help.feed.type',val);
        }
      },
      templateUrl:'app/views/mine/help.feed.tpl.html'
    }
  })
    .directive('helpFeedApp',function(userService,$http){
      return {
        restrict: 'EA',
        link: function ($scope, element, attr) {
          console.log($scope.helpFeedData);
          $scope.reqDate = {
            appId: $scope.helpFeedData.appId,
            sign: md5('ymy' + $scope.helpFeedData.appId),
            pageNumber: 1,
            pageSize: 10
          }
          $scope.resData = {
            totalPage: 0,
            list: []
          }
          requestDate();
          function requestDate() {
            $http({
              url: baseUrl + 'ym/question2/list.api',
              method: 'POST',
              params: $scope.reqDate
            }).success(function (data) {
              if (data.result == 1) {
                $scope.resData.totalPage = data.totalPage;
                $scope.resData.list = data.categoryQuestionList;
                console.log($scope.resData);
              } else {

              }
            }).error(function () {
              //$scope.alertTab('网络异常,请检查网络!', $scope.netBreakBack);
            })
          }
        },
        templateUrl:'app/views/mine/help.feed.questions.html'
      }
    })
  .directive('historyRecord',function(userService,$http){
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
      templateUrl:'app/views/mine/history.tpl.html'
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
  .directive('userInfo',function(userService,$http){
    return {
      restrict: 'EA',
      link: function (scope, element, attr) {

      },
      templateUrl:'app/views/mine/user.info.html'
    }
  })
