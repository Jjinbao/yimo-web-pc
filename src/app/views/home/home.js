angular.module('app.home',[])
    .controller('swalkHome',['$scope','$http','$interval',function($scope,$http,$interval){
        $scope.nowActive='ymy';
        $scope.changeItem=function(val){
            if($scope.nowActive==val){
                return;
            }
            $scope.nowActive=val;
        }
    }])