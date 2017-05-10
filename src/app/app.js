'use strict'

// angular.module('swalk', ['ngRoute','ngAnimate', 'ui.bootstrap', 'app.router', 'app.login', 'app.home', 'app.info', 'app.teach', 'app.mine'])
angular.module('app', ['ngAnimate', 'ngRoute', 'ui.bootstrap', 'angularFileUpload', 'ympc.services', 'app.router', 'app.home', 'app.login', 'app.info', 'app.mine','ymy.teach'])
/*所有控制器的父控制器*/
    .controller('rootTabCtrl', ['$rootScope', '$scope', '$location', '$modal', function ($rootScope, $scope, $location, $modal) {
        $scope.activeTab = 'YY'
        $scope.size = 600;
        console.log($location.url());
        $scope.clickTab = function (val) {

            if ($scope.activeTab == val) {
                return;
            }
            $scope.activeTab = val;
            if ($scope.activeTab == 'WD') {
                $location.path('/mine');
            }
        }
        console.log($location.url());
        if($location.url().indexOf('mine')>-1){
            $scope.activeTab = 'WD';
        }else if($location.url().indexOf('app')>-1){
            $scope.activeTab = 'YY';
        }else if($location.url().indexOf('passage')>-1){
            $scope.activeTab = 'ZX';
        }else if($location.url().indexOf('teach')>-1){
            $scope.activeTab='JX';
        }

        $scope.$on('user.nav.img', function (evt, data) {
            $scope.userImg = data.smallImg;
        })

        $rootScope.login = function (backParams, callback) {
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
                    $scope.toRegisterId=function(){
                        $scope.closeModal();
                        $rootScope.register(backParams, callback);
                    }

                    $scope.toFindPassword=function(){
                        $scope.closeModal();
                        $rootScope.findBackPassword(backParams, callback);
                    }

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

                            if (data.result == 1) {
                                $scope.$emit('user.nav.img', data.smallImg)
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
        $rootScope.register = function (backParams, callback) {
            $rootScope.registerModal = $modal.open({
                templateUrl: "app/views/mine/register.tpl.html",
                backdrop: true,
                keyboard: false,
                size: 'login',
                controller: function ($scope, $http, userService,$interval) {
                    $scope.registerUser = {
                        phone: '',
                        code: '',
                        imgcode: '',
                        identifier:'',
                        password: '',
                        rePassword: '',
                        name:'',
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
                    $scope.regImgDoubleClick=false;
                    $scope.getImgCode = function () {
                        if($scope.regImgDoubleClick){
                            return;
                        }
                        $scope.regImgDoubleClick=true;
                        $http({
                            url: baseUrl + 'ym/randCodeImage.api',
                            method: 'POST',
                        }).success(function (data) {
                            $scope.imgCode = data;
                            $scope.regImgDoubleClick=false;
                        }).error(function(){
                            $scope.regImgDoubleClick=false;
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

                            if (data.result == 1) {
                                $scope.registerUser.identifier = data.identifier;
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
                        if(!$scope.registerUser.phone||$scope.registerUser.phone.length<11){
                            $scope.registerTip='请填写正确的手机号';
                            return;
                        }
                        if(!$scope.registerUser.code){
                            $scope.registerTip='请填写验证码';
                            return;
                        }
                        if(!$scope.registerUser.imgcode){
                            $scope.registerTip='请填写图形验证码';
                            return;
                        }
                        if($scope.registerUser.imgcode.toLowerCase()!=$scope.imgCode.code.toLowerCase()){
                            $scope.registerTip='图形验证码不正确';
                            return;
                        }
                        if(!$scope.registerUser.name){
                            $scope.registerTip='请填写用户名';
                            return;
                        }
                        if(!$scope.registerUser.password){
                            $scope.registerTip='请填写密码';
                            return;
                        }
                        if($scope.registerUser.password.length<8){
                            $scope.registerTip='密码不应该少于8位';
                            return;
                        }
                        if(!$scope.registerUser.rePassword){
                            $scope.registerTip='请重复密码';
                            return;
                        }
                        if($scope.registerUser.rePassword!=$scope.registerUser.password){
                            $scope.registerTip='两次密码输入不一致';
                            return;
                        }
                        $scope.regDoubleClick = true;
                        $scope.registerTip='';
                        $http({
                            url: baseUrl + 'ym/account/registerWithCode.api',
                            method: 'POST',
                            params: {
                                phone: $scope.registerUser.phone,
                                identifier:$scope.registerUser.identifier,
                                randCode:$scope.registerUser.code,
                                userName:encodeURI($scope.registerUser.name),
                                password: md5($scope.registerUser.password),
                                sign: md5('ymy' + $scope.registerUser.identifier.toString()+md5($scope.registerUser.password) + $scope.registerUser.phone+$scope.registerUser.code.toString()+$scope.registerUser.name.toString())
                            }
                        }).success(function (data) {

                            if (data.result == 1) {
                                $scope.$emit('user.nav.img', data.smallImg)
                                userService.userMsg = data;
                                if (callback) {
                                    callback(backParams)
                                }
                                $rootScope.registerModal.close();
                                //$scope.back();
                            } else if (data.result == 102) {
                                $scope.registerTip = '手机号输入错误';
                            } else if (data.result == 103) {
                                $scope.registerTip = '手机号未注册';
                            } else if (data.result == 104) {
                                $scope.registerTip = '账号封停,1小时后重试';
                            } else if (data.result == 105) {
                                if(data.checkFlag==2){
                                    $scope.registerTip='验证码错误';
                                }else if(data.checkFlag==3){
                                    $scope.registerTip='验证码已过期,请重新获取';
                                }else{

                                }
                            } else if (data.result == 106) {
                                $scope.registerTip = '系统错误，稍后重试';
                            }
                            $scope.regDoubleClick = false;
                        }).error(function () {
                            $scope.registerTip = '网络异常,请检查网络';
                            $scope.regDoubleClick = false;
                        })
                    }
                }
            });
        }
        //找回密码
        $rootScope.findBackPassword=function(backParams, callback){
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
                    $scope.holdImgDoubleCode=false;
                    $scope.getImgCode = function () {
                        if($scope.holdImgDoubleCode){
                            return;
                        }
                        $scope.holdImgDoubleCode=true;
                        $http({
                            url: baseUrl + 'ym/randCodeImage.api',
                            method: 'POST',
                        }).success(function (data) {

                            $scope.imgCode = data;
                            $scope.holdImgDoubleCode=false;
                        })
                    }
                    $scope.getImgCode();
                    $scope.findPasswordWord={
                        phone:'',
                        code:'',
                        imgcode:'',
                        identify:'',
                        password:'',
                        rePassword:''
                    }
                    //获取手机验证码接口
                    $scope.canGetCode = true;
                    $scope.timeLong = 60;
                    $scope.getCodeBtn = '获取验证码';
                    $scope.getPhoneCode = function () {
                        if(!$scope.canGetCode){
                            return;
                        }

                        if($scope.findPasswordWord.phone.length<11){
                            $scope.findPasswordTip='请填写正确的手机号';
                            return;
                        }
                        $scope.canGetCode = false;
                        $http({
                            url: baseUrl + 'ym/phoneCode/sendCode.api',
                            method: 'POST',
                            params: {
                                phone: $scope.findPasswordWord.phone,
                                operation: 2,
                                sign: md5('ymy' + '2' + $scope.findPasswordWord.phone)
                            }
                        }).success(function (data) {

                            if (data.result == 1) {
                                $scope.findPasswordWord.identify = data.identifier;
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
                                    $scope.findPasswordTip='手机号不合法';
                                } else if (data.result == 103) {
                                    $scope.findPasswordTip='手机号已经注册';
                                } else if (data.result == 104) {
                                    $scope.findPasswordTip='手机号还没有注册';
                                }
                                $scope.canGetCode = true;
                            }
                        }).error(function () {
                            $scope.canGetCode = true;
                            $scope.findPasswordTip='网络异常,请检查网络!';
                        })
                    }

                    var handleDoubleClick=false;
                    $scope.nextAndFinish=function(){
                        if($scope.findPasswordType==1){
                            if(!$scope.findPasswordWord.phone){
                                $scope.findPasswordTip='请填写手机号';
                                return;
                            }
                            if(!$scope.findPasswordWord.code){
                                $scope.findPasswordTip='请填写手机验证码';
                                return;
                            }
                            if(handleDoubleClick){
                                return;
                            }
                            if(!$scope.findPasswordWord.imgcode){
                                $scope.findPasswordTip='请填写图形验证码';
                                return;
                            }
                            if($scope.findPasswordWord.imgcode.toLowerCase()!=$scope.imgCode.code.toLowerCase()){
                                $scope.findPasswordTip='图形验证码不正确';
                                return;
                            }
                            handleDoubleClick=true;
                            $http({
                                url:baseUrl+'ym/phoneCode/checkCode.api',
                                method:'POST',
                                params:{
                                    phone:$scope.findPasswordWord.phone,
                                    identifier:$scope.findPasswordWord.identify,
                                    randCode:$scope.findPasswordWord.code,
                                    sign:md5('ymy'+$scope.findPasswordWord.identify+$scope.findPasswordWord.phone+$scope.findPasswordWord.code)
                                }
                            }).success(function(data){

                                if(data.result==1){
                                    if(data.checkFlag==1){
                                        $scope.findPasswordType++;
                                    }else if(data.checkFlag==2){
                                        $scope.findPasswordTip='验证码错误';
                                    }else if(data.checkFlag==3){
                                        $scope.findPasswordTip='验证码已过期';
                                    }
                                    handleDoubleClick=false;
                                }else{
                                    if(data.result==102){
                                        $scope.findPasswordTip='手机号不合法';
                                    }else if(data.result==103){
                                        $scope.findPasswordTip='系统错误';
                                    }
                                    handleDoubleClick=false;
                                }
                            }).error(function(){
                                handleDoubleClick=false;
                                $scope.findPasswordTip='网络异常,请检查网络!';
                            })
                        }else{
                            if(handleDoubleClick){
                                return;
                            }
                            if(!$scope.findPasswordWord.password){
                                $scope.findPasswordTip='请设置密码';
                                return;
                            }

                            if($scope.findPasswordWord.password.length<8){
                                $scope.findPasswordTip='密码不能少于8位';
                                return;
                            }

                            if(!$scope.findPasswordWord.rePassword){
                                $scope.findPasswordTip='请确认密码';
                                return;
                            }

                            if($scope.findPasswordWord.password!=$scope.findPasswordWord.rePassword){
                                $scope.findPasswordTip='两次输入密码不一致';
                                return;
                            }
                            handleDoubleClick=true;
                            $http({
                                url:baseUrl+'ym/account/findPassword.api',
                                method:'POST',
                                params:{
                                    phone:$scope.findPasswordWord.phone,
                                    password:md5($scope.findPasswordWord.password),
                                    sign:md5('ymy'+md5($scope.findPasswordWord.password)+$scope.findPasswordWord.phone)
                                }
                            }).success(function(data){
                                if(data.result==1){
                                    $rootScope.findPasswordModal.close();
                                    if (callback) {
                                        $rootScope.login(backParams,callback);
                                    }
                                }else{

                                }
                                handleDoubleClick=false;
                            }).error(function(){
                                $scope.findPasswordTip='网络异常,请检查网络!';
                            })

                        }


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
    .directive('ngThumb', ['$window', function ($window) {
        var helper = {
            support: !!($window.FileReader && $window.CanvasRenderingContext2D),
            isFile: function (item) {
                return angular.isObject(item) && item instanceof $window.File;
            },
            isImage: function (file) {
                var type = '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            }
        };

        return {
            restrict: 'A',
            template: '<canvas/>',
            link: function (scope, element, attributes) {
                if (!helper.support) return;

                var params = scope.$eval(attributes.ngThumb);

                if (!helper.isFile(params.file)) return;
                if (!helper.isImage(params.file)) return;

                var canvas = element.find('canvas');
                var reader = new FileReader();

                reader.onload = onLoadFile;
                reader.readAsDataURL(params.file);

                function onLoadFile(event) {
                    var img = new Image();
                    img.onload = onLoadImage;
                    img.src = event.target.result;
                }

                function onLoadImage() {
                    var width = params.width || this.width / this.height * params.height;
                    var height = params.height || this.height / this.width * params.width;
                    canvas.attr({width: width, height: height});
                    canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
                }
            }
        };
    }])
    .filter('formateDate', [function () {
        return function (val) {
            return new Date(parseInt(val) * 1000).toLocaleString().substr(0, 12);
        }

    }])


