'use strict'

// angular.module('swalk', ['ngRoute','ngAnimate', 'ui.bootstrap', 'app.router', 'app.login', 'app.home', 'app.info', 'app.teach', 'app.mine'])
angular.module('app', ['ngAnimate','ngRoute','ui.bootstrap','ympc.services','app.router','app.home','app.login','app.info', 'app.mine'])
/*所有控制器的父控制器*/
  .controller('rootTabCtrl', ['$rootScope', '$scope', '$location','$modal', function ($rootScope, $scope, $location,$modal) {
    $scope.activeTab = 'YMY'
    $scope.clickTab = function (val) {
      console.log(val);
      if ($scope.activeTab == val) {
        return;
      }
      $scope.activeTab = val;
      if($scope.activeTab =='WD'){
        $location.path('/mine');
      }
    }

      $scope.$on('user.nav.img',function(evt,data){
        $scope.userImg=data;
        console.log(data);
      })

    $scope.login=function(backParams,callback){
      $rootScope.modal = $modal.open({
        templateUrl: "app/views/mine/login.tpl.html",
        backdrop: true,
        keyboard: false,
        controller: function ($scope,$http,userService) {
          $scope.loginUser={
            phone:'',
            password:''
          }
          $scope.closeModal = function () {
            $scope.modal.close();
          };
          $scope.toLogin=function(){
            $http({
              url:baseUrl+'ym/account/login.api',
              method:'POST',
              params:{
                phone:$scope.loginUser.phone,
                password:md5($scope.loginUser.password),
                sign:md5('ymy'+md5($scope.loginUser.password)+$scope.loginUser.phone)
              }
            }).success(function(data){
              console.log(data);
              if(data.result==1){
                $scope.$emit('user.nav.img',data)
                userService.userMsg=data;
                if(callback){
                  callback(backParams)
                }
                $scope.closeModal();
                //$scope.back();
              }else if(data.result==102){
                //$scope.alertTab('手机号输入错误');
              }else if(data.result==103){
                //$scope.alertTab('手机号未注册');
              }else if(data.result==104){
                //$scope.alertTab('账号封停,1小时后重试');
              }else if(data.result==105){
                //$scope.alertTab('密码错误');
              }else if(data.result==106){
                //$scope.alertTab('系统错误，稍后重试');
              }

            }).error(function(){
              //$scope.alertTab('网络异常,请检查网络');
            })
          }
        }
      });
    }

      $scope.$on('alter.confirm.window',function(evt,data){
        console.log(data);
        $rootScope.modal = $modal.open({
          templateUrl: "app/views/confirm/tip.tpl.html",
          backdrop: true,
          keyboard: false,
          controller: function ($scope,$http,userService) {
            $scope.alterMsg=data;
          }
        });
      })

  }])
  .directive('renderFinish', function ($timeout) {//监听dom渲染完毕
    return {
      restrict: 'EA',
      link: function (scope, element, attr) {
        if (scope.$last === true) {
          $timeout(function () {
            scope.$emit('ngRepeatFinished');
          });
        }
      }
    };
  })
  .directive('resize', function ($window) {//监听屏幕宽度和高度
    return function (scope, element,attr) {
      var w = angular.element($window);
      scope.getWindowDimensions = function () {
        return {'h': w.height(), 'w': w.width()};
      };
      scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
        scope.windowHeight = newValue.h;
        scope.windowWidth = newValue.w;
        var resultStyle={};

        scope.style = function () {
            return {
              'height': (newValue.h - 100) + 'px'
            };
        };
      }, true);
      w.bind('resize', function () {
        scope.$apply();
      });
    }
  })
  .filter('formateDate',[function(){
    return function(val){
      return new Date(parseInt(val) * 1000).toLocaleString().substr(0,12);
    }

  }])


