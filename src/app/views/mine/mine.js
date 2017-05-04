angular.module('app.mine',[])
  .controller('mine',['$scope','$window',function($scope,$window){
      var w = angular.element($window);
      $scope.getWindowDimensions = function () {
        return {'h': w.height(), 'w': w.width()};
      };
      $scope.panelWidth={}
      $scope.$watchCollection($scope.getWindowDimensions,function(newVal){
        $scope.panelWidth={
          height:newVal.h-100,
          width:newVal.w>1280?newVal.w:1280-250
        }
      })
  }])
