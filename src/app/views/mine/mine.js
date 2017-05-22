angular.module('app.mine', [])
    .controller('mine', ['$rootScope', '$scope', '$window', '$http', '$modal', 'userService', function ($rootScope, $scope, $window, $http, $modal, userService) {
        $scope.nowActivePanel = '';
        var w = angular.element($window);
        $scope.getWindowDimensions = function () {
            return {'h': w.height(), 'w': w.width()};
        };
        $scope.panelWidth = {}
        $scope.$watchCollection($scope.getWindowDimensions, function (newVal) {
            $scope.panelWidth = {
                height: newVal.h - 60,
                width: newVal.w - 200
                //width: newVal.w < 1366 ? 1116 : newVal.w - 250
            }
            //$scope.answerWidth={
            //    width: newVal.w - 200
            //}
        })

        $rootScope.regOrLogin=function(){
            $scope.haveLoginuser = userService.userMsg;
        }

        //修改用户头像和姓名
        $scope.changeUserInfo = function () {
            console.log(userService.userMsg);
            $scope.haveLoginuser = userService.userMsg;
            $scope.$emit('user.nav.img', $scope.haveLoginuser.smallImg);
            if(!$scope.haveLoginuser.accountId){
                $scope.nowActivePanel = 'noLogin'
            }
        }

        if (userService.userMsg.accountId) {
            $scope.changeUserInfo();
            $scope.nowActivePanel ='history';
        }else{
            $scope.nowActivePanel = 'noLogin'
        }

        $scope.mineLogin = function () {
            $scope.login('', function (value) {
                $scope.changeUserInfo();
                $scope.nowActivePanel ='history';
            });
        }
        //应用
        $scope.application = function (val) {
            if ($scope.nowActivePanel == val) {
                return;
            }
            if (userService.userMsg && userService.userMsg.accountId) {
                $scope.nowActivePanel = val;
            } else {
                $scope.login(val, function (value) {
                    $scope.changeUserInfo();
                    $scope.nowActivePanel = value;
                });
            }
        }
        $scope.historySubtitle = '';
        $scope.$on('history.type', function (evt, data) {
            $scope.historySubtitle = data;
            $scope.nowActivePanel = ''
        })

        $scope.$on('help.feed.type', function (evt, data) {
            $scope.helpFeedData = data;
            $scope.nowActivePanel = 'helpFeedApp'
        })
        //查看我的反馈问题处理情况
        $scope.$on('my.feed.question',function(evt,data){
            $scope.feedDetailData=data;
            $scope.nowActivePanel = 'feedDetail'
        })
        //查看应用的使用记录
        $scope.$on('my.app.history',function(evt,data){
            $scope.nowActivePanel='appRecord';

        })
        //产看视频观看记录
        $scope.$on('my.video.history',function(evt,data){
            $scope.nowActivePanel='videoRecord';

        })
        //产看文章观看记录
        $scope.$on('my.passage.history',function(evt,data){
            $scope.nowActivePanel='passageRecord';

        })
        //反馈记录
        $scope.feedRecord = function (val) {
            if ($scope.nowActivePanel == val) {
                return;
            }
            if (userService.userMsg && userService.userMsg.accountId) {
                $scope.nowActivePanel = val;
            } else {
                $scope.login(val, function (value) {
                    $scope.changeUserInfo();
                    $scope.nowActivePanel = value;
                });
            }
        }

        //用户信息
        $scope.userInfo = function () {
            if ($scope.nowActivePanel == 'user') {
                return;
            }
            if (userService.userMsg && userService.userMsg.accountId) {
                $scope.nowActivePanel = 'user';
            } else {
                $scope.login('', function (value) {
                    $scope.changeUserInfo();
                    $scope.nowActivePanel = 'user';
                });
            }
        }
        //退出登录
        $scope.quitLogin = function () {
            $scope.haveLoginuser = userService.userMsg = {};
            $scope.haveLoginuser = '';
            $scope.nowActivePanel = 'noLogin'
            $scope.$emit('user.nav.img', '');
        }
        //获取反馈的应用列表
        $scope.helpFeedApp = function () {
            $scope.nowActivePanel = 'feed';
        }
    }])
