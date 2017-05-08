'use strict'

// angular.module('swalk', ['ngRoute','ngAnimate', 'ui.bootstrap', 'app.router', 'app.login', 'app.home', 'app.info', 'app.teach', 'app.mine'])
angular.module('app', ['ngAnimate', 'ngRoute', 'ui.bootstrap', 'angularFileUpload', 'ympc.services', 'app.router', 'app.home', 'app.login', 'app.info', 'app.mine'])
/*所有控制器的父控制器*/
    .controller('rootTabCtrl', ['$rootScope', '$scope', '$location', '$modal', function ($rootScope, $scope, $location, $modal) {
        $scope.activeTab = 'YMY'
        $scope.size = 600;
        $scope.clickTab = function (val) {
            console.log(val);
            if ($scope.activeTab == val) {
                return;
            }
            $scope.activeTab = val;
            if ($scope.activeTab == 'WD') {
                $location.path('/mine');
            }
        }

        $scope.$on('user.nav.img', function (evt, data) {
            $scope.userImg = data;
            console.log(data);
        })

        $scope.login = function (backParams, callback) {
            $rootScope.loginModal = $modal.open({
                templateUrl: "app/views/mine/login.tpl.html",
                backdrop: true,
                keyboard: false,
                size: 'login',
                controller: function ($scope, $http, userService) {
                    $scope.loginUser = {
                        phone: '',
                        password: ''
                    }
                    $scope.closeModal = function () {
                        $rootScope.loginModal.close();
                        //$scope.modal.close();

                    };
                    $scope.messageTip = '';
                    $scope.doubleClick = false;
                    $scope.toLogin = function () {
                        if ($scope.doubleClick) {
                            return;
                        }
                        $scope.doubleClick = true;
                        $http({
                            url: baseUrl + 'ym/account/login.api',
                            method: 'POST',
                            params: {
                                phone: $scope.loginUser.phone,
                                password: md5($scope.loginUser.password),
                                sign: md5('ymy' + md5($scope.loginUser.password) + $scope.loginUser.phone)
                            }
                        }).success(function (data) {
                            console.log(data);
                            if (data.result == 1) {
                                $scope.$emit('user.nav.img', data)
                                userService.userMsg = data;
                                if (callback) {
                                    callback(backParams)
                                }
                                $scope.closeModal();
                                //$scope.back();
                            } else if (data.result == 102) {
                                $scope.messageTip = '手机号输入错误';
                            } else if (data.result == 103) {
                                $scope.messageTip = '手机号未注册';
                            } else if (data.result == 104) {
                                $scope.messageTip = '账号封停,1小时后重试';
                            } else if (data.result == 105) {
                                $scope.messageTip = '密码错误';
                            } else if (data.result == 106) {
                                $scope.messageTip = '系统错误，稍后重试';
                            }
                            $scope.doubleClick = false;
                        }).error(function () {
                            $scope.messageTip = '网络异常,请检查网络';
                            $scope.doubleClick = false;
                        })
                    }
                }
            });
        }

        //注册接口
        $scope.register = function () {
            $rootScope.registerModal = $modal.open({
                templateUrl: "app/views/mine/register.tpl.html",
                backdrop: true,
                keyboard: false,
                size: 'login',
                controller: function ($scope, $http, userService) {
                    $scope.registerUser = {
                        phone: '',
                        code: '',
                        imgcode: '',
                        password: '',
                        rePassword: '',
                        img: ''
                    }
                    $scope.closeRegisterModal = function () {
                        $rootScope.registerModal.close();
                        //$scope.modal.close();

                    };
                    $scope.registerTip = '';


                    //获取图形验码啊接口
                    $scope.userImgCode = {
                        code: ''
                    };
                    $scope.getImgCode = function () {
                        $http({
                            url: baseUrl + 'ym/randCodeImage.api',
                            method: 'POST',
                        }).success(function (data) {
                            console.log(data);
                            $scope.imgCode = data;
                        })
                    }
                    $scope.getImgCode();

                    //获取手机验证码接口
                    $scope.canGetCode = true;
                    $scope.timeLong = 60;
                    $scope.getCodeBtn = '获取验证码';
                    $scope.getPhoneCode = function () {
                        if(!$scope.canGetCode){
                            return;
                        }
                        if(!$scope.registerUser.phone||$scope.registerUser.phone.length<11){
                            $scope.registerTip='请填写正确的手机号';
                            return;
                        }
                        $scope.canGetCode = false;
                        $http({
                            url: baseUrl + 'ym/phoneCode/sendCode.api',
                            method: 'POST',
                            params: {
                                phone: $scope.registerUser.phone,
                                operation: 1,
                                sign: md5('ymy' + '1' + $scope.registerUser.phone)
                            }
                        }).success(function (data) {
                            console.log(data);
                            if (data.result == 1) {
                                $scope.registerUser.identify = data.identifier;
                                $scope.intervalId = $interval(function () {
                                    if ($scope.timeLong > 1) {
                                        $scope.timeLong--;
                                        $scope.getCodeBtn = $scope.timeLong + '秒后获取';
                                    } else {
                                        $scope.canGetCode = true;
                                        $scope.timeLong = 60;
                                        $scope.getCodeBtn = '获取验证码';
                                        $interval.cancel($scope.intervalId);
                                    }
                                }, 1000);
                            } else {
                                if (data.result == 102) {
                                    $scope.registerTip='手机号不合法';
                                } else if (data.result == 103) {
                                    $scope.registerTip='手机号已经注册';
                                } else if (data.result == 104) {
                                    $scope.registerTip='手机号还没有注册';
                                }
                                $scope.canGetCode = true;
                            }

                        }).error(function () {
                            $scope.canGetCode = true;
                            $scope.registerTip='网络异常,请检查网络!';
                        })
                    }

                    //注册接口
                    $scope.regDoubleClick = false;
                    $scope.toRegister = function () {
                        if ($scope.regDoubleClick) {
                            return;
                        }
                        $scope.regDoubleClick = true;
                        $http({
                            url: baseUrl + 'ym/account/login.api',
                            method: 'POST',
                            params: {
                                phone: $scope.loginUser.phone,
                                password: md5($scope.loginUser.password),
                                sign: md5('ymy' + md5($scope.loginUser.password) + $scope.loginUser.phone)
                            }
                        }).success(function (data) {
                            console.log(data);
                            if (data.result == 1) {
                                $scope.$emit('user.nav.img', data)
                                userService.userMsg = data;
                                if (callback) {
                                    callback(backParams)
                                }
                                $scope.closeModal();
                                //$scope.back();
                            } else if (data.result == 102) {
                                $scope.messageTip = '手机号输入错误';
                            } else if (data.result == 103) {
                                $scope.messageTip = '手机号未注册';
                            } else if (data.result == 104) {
                                $scope.messageTip = '账号封停,1小时后重试';
                            } else if (data.result == 105) {
                                $scope.messageTip = '密码错误';
                            } else if (data.result == 106) {
                                $scope.messageTip = '系统错误，稍后重试';
                            }
                            $scope.doubleClick = false;
                        }).error(function () {
                            $scope.messageTip = '网络异常,请检查网络';
                            $scope.doubleClick = false;
                        })
                    }
                }
            });
        }
        //找回密码
        $scope.findBackPassword=function(){
            $rootScope.findPasswordModal = $modal.open({
                templateUrl: "app/views/mine/forgot.password.tpl.html",
                backdrop: true,
                keyboard: false,
                size: 'login',
                controller: function ($scope, $http, $interval, userService) {
                    $scope.findPasswordType=1;
                    $scope.closeFindModal = function () {
                        $rootScope.findPasswordModal.close();
                    }

                    //获取图形验码啊接口
                    $scope.userImgCode = {
                        code: ''
                    };
                    $scope.getImgCode = function () {
                        $http({
                            url: baseUrl + 'ym/randCodeImage.api',
                            method: 'POST',
                        }).success(function (data) {
                            console.log(data);
                            $scope.imgCode = data;
                        })
                    }
                    $scope.getImgCode();

                    //获取手机验证码接口
                    $scope.canGetCode = true;
                    $scope.timeLong = 60;
                    $scope.getCodeBtn = '获取验证码';
                    $scope.getPhoneCode = function () {
                        if(!$scope.canGetCode){
                            return;
                        }
                        if(!$scope.registerUser.phone||$scope.registerUser.phone.length<11){
                            $scope.registerTip='请填写正确的手机号';
                            return;
                        }
                        $scope.canGetCode = false;
                        $http({
                            url: baseUrl + 'ym/phoneCode/sendCode.api',
                            method: 'POST',
                            params: {
                                phone: $scope.registerUser.phone,
                                operation: 1,
                                sign: md5('ymy' + '1' + $scope.registerUser.phone)
                            }
                        }).success(function (data) {
                            console.log(data);
                            if (data.result == 1) {
                                $scope.registerUser.identify = data.identifier;
                                $scope.intervalId = $interval(function () {
                                    if ($scope.timeLong > 1) {
                                        $scope.timeLong--;
                                        $scope.getCodeBtn = $scope.timeLong + '秒后获取';
                                    } else {
                                        $scope.canGetCode = true;
                                        $scope.timeLong = 60;
                                        $scope.getCodeBtn = '获取验证码';
                                        $interval.cancel($scope.intervalId);
                                    }
                                }, 1000);
                            } else {
                                if (data.result == 102) {
                                    $scope.registerTip='手机号不合法';
                                } else if (data.result == 103) {
                                    $scope.registerTip='手机号已经注册';
                                } else if (data.result == 104) {
                                    $scope.registerTip='手机号还没有注册';
                                }
                                $scope.canGetCode = true;
                            }

                        }).error(function () {
                            $scope.canGetCode = true;
                            $scope.registerTip='网络异常,请检查网络!';
                        })
                    }

                }
            });
        }

        //$scope.$on('alter.confirm.window',function(evt,data){
        $rootScope.successAlter = function (data) {
            $rootScope.alterModal = $modal.open({
                templateUrl: "app/views/confirm/tip.tpl.html",
                backdrop: 'static',
                keyboard: false,
                size: 'tip',
                controller: function ($scope, $http, $interval, userService) {
                    $scope.closeAlertModal = function () {
                        $rootScope.alterModal.close();
                    }
                    $scope.alterMsg = data;
                    $scope.showTime = 3;
                    var alterInterId = $interval(function () {
                        $scope.showTime--;
                        if ($scope.showTime <= 0) {
                            $interval.cancel(alterInterId);
                            $scope.closeAlertModal();
                        }
                    }, 1000);
                    $scope.closeModelTip = function () {
                        if (alterInterId) {
                            $interval.cancel(alterInterId);
                        }
                        $scope.closeAlertModal();
                    }
                }
            });
        }
        //})

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
        return function (scope, element, attr) {
            var w = angular.element($window);
            scope.getWindowDimensions = function () {
                return {'h': w.height(), 'w': w.width()};
            };
            scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
                scope.windowHeight = newValue.h;
                scope.windowWidth = newValue.w;
                var resultStyle = {};

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
    .filter('formateDate', [function () {
        return function (val) {
            return new Date(parseInt(val) * 1000).toLocaleString().substr(0, 12);
        }

    }])


