'use strict'

angular.module('swalk', ['ngRoute', 'ui.bootstrap', 'ngTouch', 'app.router', 'app.login', 'app.home', 'app.info', 'app.teach', 'app.mine'])
/*所有控制器的父控制器*/
  .controller('rootTabCtrl', ['$rootScope', '$scope', '$location', function ($rootScope, $scope, $location) {
    $scope.activeTab = 'YMY'
    $scope.clickTab = function (val) {
      if ($scope.activeTab == val) {
        return;
      }
      $scope.activeTab = val;
      if($scope.activeTab=='WD'){
        $location.path('/mine')
      }
    }
    $rootScope.windowHeight = window.document.body.clientHeight;
  }])

  //隐藏底部导航栏
  .directive('hideTabs', function ($rootScope) {
    return {
      restrict: 'A',
      link: function (scope, element, attributes) {
        scope.$on('$ionicView.beforeEnter', function () {
          scope.$watch(attributes.hideTabs, function (value) {
            $rootScope.hideTabs = value;
          });
        });
        scope.$on('$ionicView.beforeLeave', function () {
          $rootScope.hideTabs = false;
        });
      }
    };
  })
  //监听dom渲染完毕
  .directive('renderFinish', function ($timeout) {
    return {
      restrict: 'A',
      link: function (scope, element, attr) {
        if (scope.$last === true) {
          $timeout(function () {
            scope.$emit('ngRepeatFinished');
          });
        }
      }
    };
  })
  //监听屏幕宽度和高度
  .directive('resize', function ($window) {
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
    .directive('resizePanel', function ($window) {
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
                'height': (newValue.h - 100) + 'px',
                'width':((newValue.w<1366?1366:newValue.w)-attr.menuWidth)+'px'
              }
          };

        }, true);

        w.bind('resizePanel', function () {
          scope.$apply();
        });
      }
    })


