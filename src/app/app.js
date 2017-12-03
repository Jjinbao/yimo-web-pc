'use strict'
//格式化日期函数
Date.prototype.format = function (format) {
    var o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(), //day
        "h+": this.getHours(), //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
        "S": this.getMilliseconds() //millisecond
    }
    if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
        (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)if (new RegExp("(" + k + ")").test(format))
        format = format.replace(RegExp.$1,
            RegExp.$1.length == 1 ? o[k] :
                ("00" + o[k]).substr(("" + o[k]).length));
    return format;
}
//删除数组元素
Array.prototype.remove = function (obj) {
    for (var i = 0; i < this.length; i++) {
        var temp = this[i];
        if (!isNaN(obj)) {
            temp = i;
        }
        if (temp == obj) {
            for (var j = i; j < this.length; j++) {
                this[j] = this[j + 1];
            }
            this.length = this.length - 1;
        }
    }
}

function giveLoginInfo(data) {
    var countSecond = function () {
    }
    try {
        var jsonStr = JSON.stringify(data);
        var pcBack = window.external.userLoginInfo(jsonStr);

        setTimeout('countSecond()', 3000);
    } catch (e) {

    }
}
// angular.module('swalk', ['ngRoute','ngAnimate', 'ui.bootstrap', 'app.router', 'app.login', 'app.home', 'app.info', 'app.teach', 'app.mine'])
angular.module('app', ['ngAnimate', 'ngRoute', 'ui.bootstrap', 'ngImgCrop', 'angularFileUpload', 'ympc.services', 'app.router', 'app.home', 'app.login', 'app.info', 'app.mine'])
    /*所有控制器的父控制器*/
    .controller('rootTabCtrl', ['$rootScope', '$scope', '$location', '$modal', 'userService', function ($rootScope, $scope, $location, $modal, userService) {
        $scope.activeTab = 'YY'
        $scope.size = 600;
        $rootScope.hisRe={
            type:''
        }
        $scope.clickTab = function (val) {
            if ($scope.activeTab == val) {
                return;
            }
            $scope.activeTab = val;
            if ($scope.activeTab == 'WD') {
                $location.path('/mine');
            }
        }
        if ($location.url().indexOf('mine') > -1) {
            $scope.activeTab = 'WD';//我的
        } else if ($location.url().indexOf('app') > -1) {
            $scope.activeTab = 'YY';//应用
        } else if ($location.url().indexOf('passage') > -1) {
            $scope.activeTab = 'ZX';//资讯
        } else if ($location.url().indexOf('teach') > -1) {
            $scope.activeTab = 'JX';//教学
        }

        $scope.openYmWeb=function(){
            try{
                //和原生交互,打开医模云官网
                window.external.openYMWebsite();
            }catch (e){

            }
        }
        //接受用户头像信息，子控制器会把头像信息通过data传递过来，这里会显示到顶部头像栏
        $scope.$on('user.nav.img', function (evt, data) {
            if (data) {
                $scope.userImg = data;
            } else {
                $scope.userImg = '';
            }

        })
        //获取用户登录信息
        try {
            //从原生端获取到用户的应用信息
            var pcUserInfo = window.external.getUserInfo();
            if (pcUserInfo) {
                userService.userMsg = JSON.parse(pcUserInfo);
                $scope.userImg = userService.userMsg.smallImg;
            }
        } catch (e) {
        }

        //登录窗口模态框
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
                    $scope.toRegisterId = function () {
                        $scope.closeModal();
                        $rootScope.register(backParams, callback);
                    }

                    $scope.toFindPassword = function () {
                        $scope.closeModal();
                        $rootScope.findBackPassword(backParams, callback);
                    }

                    $scope.messageTip = '';
                    $scope.doubleClick = false;
                    //登录函数，点击登录按钮，开始登录校验
                    $scope.toLogin = function () {
                        //拦截用户多次点击
                        if ($scope.doubleClick) {
                            return;
                        }
                        //如果手机号为空进行拦截
                        if(!$scope.loginUser.phone){
                            $scope.messageTip ='请输入手机号';
                            return;
                        }
                        //如果没有输入密码拦截
                        if(!$scope.loginUser.password){
                            $scope.messageTip ='请输入密码';
                            return;
                        }
                        $scope.doubleClick = true;
                        //发送ajax请求，获取登录结果
                        $http({
                            url: baseUrl + 'ym/account/login.api',
                            method: 'POST',
                            params: {
                                phone: $scope.loginUser.phone,
                                password: md5($scope.loginUser.password),
                                sign: md5('ymy' + md5($scope.loginUser.password) + $scope.loginUser.phone)
                            }
                        }).success(function (data) {
                            //登陆成功，进行头像替换
                            if (data.result == 1) {
                                $scope.$emit('user.nav.img', data.smallImg)
                                userService.userMsg = data;
                                if (callback) {
                                    callback(backParams)
                                }
                                try {
                                    var jsonStr = JSON.stringify(data);
                                    window.external.userLoginInfo(jsonStr);
                                } catch (e) {

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
                controller: function ($scope, $http, userService, $interval) {
                    $scope.registerUser = {
                        phone: '',//用户手机号
                        code: '',//验证码
                        imgcode: '',//图形验证码
                        identifier: '',//后台传递过来的标识码
                        password: '',//密码
                        rePassword: '',//重复面
                        name: '',//用户昵称
                        img: '',//图形验证码图片
                        mineCompany:'',
                        company:'',//公司
                        prov:'',//省份
                        province:'',
                        city:''//城市
                    }
                    //关闭注册模态框
                    $scope.closeRegisterModal = function () {
                        $rootScope.registerModal.close();
                        //$scope.modal.close();
                    };
                    //错误提示变量
                    $scope.registerTip = '';

                    //获取图形验码啊接口
                    $scope.userImgCode = {
                        code: ''
                    };
                    //重复点击变量
                    $scope.regImgDoubleClick = false;
                    //获取图形验证码的函数
                    $scope.getImgCode = function () {
                        if ($scope.regImgDoubleClick) {
                            return;
                        }
                        $scope.imgCode = '';
                        $scope.regImgDoubleClick = true;
                        $http({
                            url: baseUrl + 'ym/randCodeImage.api',
                            method: 'POST',
                        }).success(function (data) {
                            $scope.imgCode = data;
                            $scope.regImgDoubleClick = false;
                        }).error(function () {
                            $scope.regImgDoubleClick = false;
                        })
                    }
                    $scope.getImgCode();

                    //获取手机验证码接口
                    $scope.canGetCode = true;
                    $scope.timeLong = 60;
                    $scope.getCodeBtn = '获取验证码';
                    //获取手机验证码的函数
                    $scope.getPhoneCode = function () {
                        if (!$scope.canGetCode) {
                            return;
                        }

                        if (!$scope.registerUser.phone || $scope.registerUser.phone.length < 11) {
                            $scope.registerTip = '请填写正确的手机号';
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
                                    $scope.registerTip = '手机号不合法';
                                } else if (data.result == 103) {
                                    $scope.registerTip = '手机号已经注册';
                                } else if (data.result == 104) {
                                    $scope.registerTip = '手机号还没有注册';
                                }
                                $scope.canGetCode = true;
                            }

                        }).error(function () {
                            $scope.canGetCode = true;
                            $scope.registerTip = '网络异常,请检查网络!';
                        })
                    }

                    //注册接口
                    $scope.regDoubleClick = false;
                    //点击注册按钮，请求后台，开始校验
                    $scope.toRegister = function () {
                        //防止重复点击
                        if ($scope.regDoubleClick) {
                            return;
                        }
                        if (!$scope.registerUser.phone || $scope.registerUser.phone.length < 11) {
                            $scope.registerTip = '请填写正确的手机号';
                            return;
                        }
                        if (!$scope.registerUser.code) {
                            $scope.registerTip = '请填写验证码';
                            return;
                        }
                        if (!$scope.registerUser.imgcode) {
                            $scope.registerTip = '请填写图形验证码';
                            return;
                        }
                        if ($scope.registerUser.imgcode.toLowerCase() != $scope.imgCode.code.toLowerCase()) {
                            $scope.registerTip = '图形验证码不正确';
                            return;
                        }
                        // if (!$scope.registerUser.name) {
                        //     $scope.registerTip = '请填写用户名';
                        //     return;
                        // }
                        if (!$scope.registerUser.password) {
                            $scope.registerTip = '请填写密码';
                            return;
                        }
                        if ($scope.registerUser.password.length < 8) {
                            $scope.registerTip = '密码不应该少于8位';
                            return;
                        }
                        if (!$scope.registerUser.rePassword) {
                            $scope.registerTip = '请重复密码';
                            return;
                        }
                        if ($scope.registerUser.rePassword != $scope.registerUser.password) {
                            $scope.registerTip = '两次密码输入不一致';
                            return;
                        }
                        if (!$scope.registerUser.mineCompany) {
                            $scope.registerTip = '请输入单位名称';
                            return;
                        }
                        if (!$scope.registerUser.prov||!$scope.registerUser.city||$scope.registerUser.prov=='省份') {
                            $scope.registerTip = '请选择省份城市';
                            return;
                        }
                        $scope.registerUser.province=encodeURI($scope.registerUser.prov);
                        $scope.registerUser.city=encodeURI($scope.registerUser.city);
                        $scope.registerUser.company=encodeURI($scope.registerUser.mineCompany);
                        $scope.regDoubleClick = true;
                        $scope.registerTip = '';
                        console.log($scope.registerUser);
                        //发送ajax请求通知后台，开始注册
                        $http({
                            url: baseUrl + 'ym/account/registerWithCode.api',
                            method: 'POST',
                            params: {
                                phone: $scope.registerUser.phone,
                                identifier: $scope.registerUser.identifier,
                                randCode: $scope.registerUser.code,
                                userName: encodeURI($scope.registerUser.name),
                                password: md5($scope.registerUser.password),
                                province:$scope.registerUser.province,
                                city:$scope.registerUser.city,
                                company:$scope.registerUser.company,
                                sign: md5('ymy' + $scope.registerUser.identifier.toString() + md5($scope.registerUser.password) + $scope.registerUser.phone + $scope.registerUser.code.toString() + $scope.registerUser.name.toString())
                            }
                        }).success(function (data) {
                            //注册成功 自动登录
                            if (data.result == 1) {
                                $scope.$emit('user.nav.img', data.smallImg)
                                userService.userMsg = data;
                                if (callback) {
                                    callback(backParams)
                                }
                                try {
                                    var jsonStr = JSON.stringify(data);
                                    window.external.userLoginInfo(jsonStr);
                                } catch (e) {

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
                                if (data.checkFlag == 2) {
                                    $scope.registerTip = '验证码错误';
                                } else if (data.checkFlag == 3) {
                                    $scope.registerTip = '验证码已过期,请重新获取';
                                } else {

                                }
                            } else if (data.result == 106) {
                                $scope.registerTip = '系统错误，稍后重试';
                            }else{
                                $scope.registerTip = '缺少参数，您可能没有获取验证码';
                            }
                            $scope.regDoubleClick = false;
                        }).error(function () {
                            $scope.registerTip = '网络异常,请检查网络';
                            $scope.regDoubleClick = false;
                        })
                    }
                    //选择省份城市
                    $scope.$on('choice.city',function(e,data){
                        $scope.registerUser.prov=data.prov;
                        $scope.registerUser.city=data.city;

                    })
                }
            });
        }
        //找回密码
        $rootScope.findBackPassword = function (backParams, callback) {
            $rootScope.findPasswordModal = $modal.open({
                templateUrl: "app/views/mine/forgot.password.tpl.html",
                backdrop: true,
                keyboard: false,
                size: 'login',
                controller: function ($scope, $http, $interval, userService) {
                    $scope.findPasswordType = 1;
                    $scope.closeFindModal = function () {
                        $rootScope.findPasswordModal.close();
                    }

                    //获取图形验码啊接口
                    $scope.userImgCode = {
                        code: ''
                    };
                    $scope.holdImgDoubleCode = false;
                    $scope.getImgCode = function () {
                        if ($scope.holdImgDoubleCode) {
                            return;
                        }
                        $scope.holdImgDoubleCode = true;
                        $http({
                            url: baseUrl + 'ym/randCodeImage.api',
                            method: 'POST',
                        }).success(function (data) {

                            $scope.imgCode = data;
                            $scope.holdImgDoubleCode = false;
                        })
                    }
                    $scope.getImgCode();
                    $scope.findPasswordWord = {
                        phone: '',
                        code: '',
                        imgcode: '',
                        identify: '',
                        password: '',
                        rePassword: ''
                    }
                    //获取手机验证码接口
                    $scope.canGetCode = true;
                    $scope.timeLong = 60;
                    $scope.getCodeBtn = '获取验证码';
                    $scope.getPhoneCode = function () {
                        if (!$scope.canGetCode) {
                            return;
                        }

                        if ($scope.findPasswordWord.phone.length < 11) {
                            $scope.findPasswordTip = '请填写正确的手机号';
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
                                    $scope.findPasswordTip = '手机号不合法';
                                } else if (data.result == 103) {
                                    $scope.findPasswordTip = '手机号已经注册';
                                } else if (data.result == 104) {
                                    $scope.findPasswordTip = '手机号还没有注册';
                                }
                                $scope.canGetCode = true;
                            }
                        }).error(function () {
                            $scope.canGetCode = true;
                            $scope.findPasswordTip = '网络异常,请检查网络!';
                        })
                    }

                    var handleDoubleClick = false;
                    $scope.nextAndFinish = function () {
                        if ($scope.findPasswordType == 1) {
                            if (!$scope.findPasswordWord.phone) {
                                $scope.findPasswordTip = '请填写手机号';
                                return;
                            }
                            if (!$scope.findPasswordWord.code) {
                                $scope.findPasswordTip = '请填写手机验证码';
                                return;
                            }
                            if (handleDoubleClick) {
                                return;
                            }
                            if (!$scope.findPasswordWord.imgcode) {
                                $scope.findPasswordTip = '请填写图形验证码';
                                return;
                            }
                            if ($scope.findPasswordWord.imgcode.toLowerCase() != $scope.imgCode.code.toLowerCase()) {
                                $scope.findPasswordTip = '图形验证码不正确';
                                return;
                            }
                            handleDoubleClick = true;
                            $scope.findPasswordTip = '';
                            $http({
                                url: baseUrl + 'ym/phoneCode/checkCode.api',
                                method: 'POST',
                                params: {
                                    phone: $scope.findPasswordWord.phone,
                                    identifier: $scope.findPasswordWord.identify,
                                    randCode: $scope.findPasswordWord.code,
                                    sign: md5('ymy' + $scope.findPasswordWord.identify + $scope.findPasswordWord.phone + $scope.findPasswordWord.code)
                                }
                            }).success(function (data) {
                                if (data.result == 1) {
                                    if (data.checkFlag == 1) {
                                        $scope.findPasswordType++;
                                    } else if (data.checkFlag == 2) {
                                        $scope.findPasswordTip = '验证码错误';
                                    } else if (data.checkFlag == 3) {
                                        $scope.findPasswordTip = '验证码已过期';
                                    }
                                    handleDoubleClick = false;
                                } else {
                                    if (data.result == 102) {
                                        $scope.findPasswordTip = '手机号不合法';
                                    } else if (data.result == 103) {
                                        $scope.findPasswordTip = '系统错误';
                                    }
                                    handleDoubleClick = false;
                                }
                            }).error(function () {
                                handleDoubleClick = false;
                                $scope.findPasswordTip = '网络异常,请检查网络!';
                            })
                        } else {
                            if (handleDoubleClick) {
                                return;
                            }
                            if (!$scope.findPasswordWord.password) {
                                $scope.findPasswordTip = '请设置密码';
                                return;
                            }

                            if ($scope.findPasswordWord.password.length < 8) {
                                $scope.findPasswordTip = '密码不能少于8位';
                                return;
                            }

                            if (!$scope.findPasswordWord.rePassword) {
                                $scope.findPasswordTip = '请确认密码';
                                return;
                            }

                            if ($scope.findPasswordWord.password != $scope.findPasswordWord.rePassword) {
                                $scope.findPasswordTip = '两次输入密码不一致';
                                return;
                            }
                            handleDoubleClick = true;
                            //发送请求，开始修改密码
                            $http({
                                url: baseUrl + 'ym/account/findPassword.api',
                                method: 'POST',
                                params: {
                                    phone: $scope.findPasswordWord.phone,
                                    password: md5($scope.findPasswordWord.password),
                                    sign: md5('ymy' + md5($scope.findPasswordWord.password) + $scope.findPasswordWord.phone)
                                }
                            }).success(function (data) {
                                if (data.result == 1) {
                                    //密码修改成功
                                    $rootScope.findPasswordModal.close();
                                    if (callback) {
                                        $rootScope.login(backParams, callback);
                                    }
                                } else {

                                }
                                handleDoubleClick = false;
                            }).error(function () {
                                //网络异常
                                $scope.findPasswordTip = '网络异常,请检查网络!';
                            })

                        }


                    }

                }
            });
        }

        //退出登录模态确认框
        $rootScope.existLogin = function (callback) {
            $rootScope.alterSureModal = $modal.open({
                templateUrl: "app/views/mine/exist.login.tpl.html",
                backdrop: true,
                keyboard: false,
                size: 'exist',
                controller: function ($scope, $http, $interval, userService) {
                    $scope.cancleQuit = function () {
                        $rootScope.alterSureModal.close();
                    }
                    $scope.sureQuit = function () {
                        callback();
                        $rootScope.alterSureModal.close();
                    }
                }
            })
        }
        /**
         * 确认删除某一款应用
         * params:应用参数
         * callback:回调函数，删除成功后调用
         * */
        $rootScope.deleteAppModel = function (params, callback) {
            $rootScope.alterSureModal = $modal.open({
                templateUrl: "app/views/mine/delete.tpl.html",
                backdrop: true,
                keyboard: false,
                size: 'exist',
                controller: function ($scope, $http, $interval, userService) {
                    $scope.product = params;
                    $scope.cancleQuit = function () {
                        $rootScope.alterSureModal.close();
                    }
                    $scope.sureQuit = function () {
                        callback(params);
                        $rootScope.alterSureModal.close();
                    }
                }
            })
        }

        //$scope.$on('alter.confirm.window',function(evt,data){
        /*
        * 成功提示框
        * data:提示的内容 例如：删除成功
        * */
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
        //关闭成功，和c++端交互
        $scope.windwoClose = function () {
            try {
                window.external.OnbtnClose();
            } catch (e) {

            }

        }
        //最大化窗口 和原生交互
        $scope.windwoMax = function () {
            try {
                window.external.OnbtnMax();
            } catch (e) {

            }

        }
        //最小化窗口 和原生端交互
        $scope.windwoMin = function () {
            try {
                window.external.OnbtnMin();
            } catch (e) {

            }

        }
    }])
    //ng-repeat渲染完成界面后调用指令，需要在父控制器中注册名字为ngRepeatFinished的接收器
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
                        'height': (newValue.h - 60) + 'px'
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
    //帮助与反馈界面
    .directive('helpFeed', function ($http) {
        return {
            restrict: 'EA',
            link: function ($scope, element, attr) {
                $http({
                    url: baseUrl + 'ym/app/list.api',
                    method: 'POST'
                }).success(function (data) {
                    console.log(data);
                    $scope.appProList = data.list;
                }).error(function () {
                    $scope.$emit('my.net.break','');
                })

                $scope.appFeedRecord = function (val) {
                    $scope.$emit('help.feed.type', val);
                }
            },
            templateUrl: 'app/views/mine/help.feed.tpl.html'
        }
    })
    //帮助与反馈界面app界面
    .directive('helpFeedApp', function (userService, $http, $rootScope, $modal) {
        return {
            restrict: 'EA',
            link: function ($scope, element, attr) {
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

                        } else {

                        }
                    }).error(function () {
                        $scope.$emit('my.net.break','');
                        //$scope.alertTab('网络异常,请检查网络!', $scope.netBreakBack);
                    })
                }

                $scope.alterFeedWindow = function (val) {
                    $rootScope.modal = $modal.open({
                        templateUrl: "app/views/mine/feed.question.card.html",
                        backdrop: true,
                        keyboard: false,
                        size: 'feed',
                        controller: function ($scope, $http, userService) {

                            $scope.feedTarget = val;
                            $scope.closeModal = function () {
                                $scope.modal.close();
                            }
                            $scope.feedInfo = {
                                contact: '',
                                info: '',
                            }
                            $scope.doubleClick = false;
                            $scope.feedErroMsg = '';
                            $scope.startFeedQuestion = function () {
                                if ($scope.doubleClick) {
                                    return;
                                }
                                if (!$scope.feedInfo.contact) {
                                    $scope.feedErroMsg = '请填写反馈人联系方式';
                                    return;
                                }
                                if (!$scope.feedInfo.info) {
                                    $scope.feedErroMsg = '请填写反馈内容';
                                    return;
                                }
                                $scope.doubleClick = true;

                                $http({
                                    url: baseUrl + 'ym/question/add.api',
                                    method: 'POST',
                                    params: {
                                        publisher: userService.userMsg.accountId,
                                        appId: $scope.feedTarget.appId,
                                        extstr1: encodeURI($scope.feedInfo.contact),
                                        question: encodeURI($scope.feedInfo.info),
                                        sign: md5('ymy' + $scope.feedTarget.appId + $scope.feedInfo.contact + userService.userMsg.accountId + $scope.feedInfo.info)
                                    }
                                }).success(function (data) {
                                    if (data.result == 1) {
                                        $scope.closeModal();
                                        $rootScope.successAlter('反馈成功');
                                    } else {
                                        $scope.feedErroMsg = '反馈失败';
                                    }
                                    $scope.doubleClick = false;
                                }).error(function () {
                                    $scope.doubleClick = false;
                                    $scope.feedErroMsg = '网络异常,请检查网络!';
                                })

                            }
                        }
                    });
                }
                $scope.feedQuestion = function (val) {
                    if (userService.userMsg && userService.userMsg.accountId) {
                        $scope.alterFeedWindow(val);
                    } else {
                        $scope.login('', function (value) {
                            $scope.changeUserInfo();
                            //$scope.alterFeedWindow(val);
                        });
                    }
                }
            },
            templateUrl: 'app/views/mine/help.feed.questions.html'
        }
    })
    //历史记录界面
    .directive('historyRecord', function (userService, $http) {
        return {
            restrict: 'EA',
            link: function ($scope, element, attr) {
                //应用历史记录 val为参数标识，用来区分那一个历史记录
                $scope.appUseHistory = function (val) {
                    $scope.$emit('my.app.history', val);
                }
                //教学视频历史记录
                $scope.appVideoHistory = function (val) {
                    $scope.$emit('my.video.history', val);
                }
                //文章历史记录
                $scope.appPassageHistory = function (val) {
                    $scope.$emit('my.passage.history', val);
                }
            },
            templateUrl: 'app/views/mine/history.tpl.html'
        }
    })
    //应用的使用记录界面
    .directive('appUseRecord', function (userService, $http) {
        return {
            restrict: 'EA',
            link: function ($scope, element, attr) {
                $http({
                    url: baseUrl + 'ym/history/list.api',
                    method: 'POST',
                    params: {
                        accountId: userService.userMsg.accountId,
                        type: 'app',
                        sign: md5('ymy' + userService.userMsg.accountId + 'app')
                    }
                }).success(function (data) {

                    if (data.result == 1) {
                        $scope.appUseList = data.list;
                        $scope.appUseList.forEach(function (val) {
                            val.date = new Date(parseInt(val.readTime) * 1000).toLocaleString().replace(/:\d{1,2}$/, ' ');
                        })
                    }
                }).error(function () {
                    $scope.$emit('my.net.break','');
                    //$scope.alertTab('网络异常,请检查网络!',$scope.netBreakBack);
                })

                $scope.openOneApp=function(val){
                    try{
                        var historyAppInfo=JSON.stringify(val.app);
                        window.external.openApp(historyAppInfo);
                    }catch (e){

                    }
                }
            },
            templateUrl: 'app/views/mine/app.use.history.html'
        }
    })
    //视频历史记录界面
    .directive('videoUseRecord', function (userService, $http,$location) {
        return {
            restrict: 'EA',
            link: function ($scope, element, attr) {
                $http({
                    url: baseUrl + 'ym/history/list.api',
                    method: 'POST',
                    params: {
                        accountId: userService.userMsg.accountId,
                        type: 'album',
                        sign: md5('ymy' + userService.userMsg.accountId + 'album'),
                        categoryId:1
                    }
                }).success(function (data) {
                    console.log(data);
                    if (data.result == 1) {
                        $scope.videoUseList = data.list;
                        $scope.videoUseList.forEach(function (val) {
                            val.date = new Date(parseInt(val.readTime) * 1000).toLocaleString().replace(/:\d{1,2}$/, ' ');
                        })
                    }
                }).error(function () {
                    $scope.$emit('my.net.break','');
                    //$scope.alertTab('网络异常,请检查网络!',$scope.netBreakBack);
                })

                $scope.openAlbumDetail=function(val){
                    console.log(val);
                    $location.path('/album/history/1/'+val.album.id);
                }
            },
            templateUrl: 'app/views/mine/history.video.tpl.html'
        }
    })
    //文章历史记录界面
    .directive('passageUseRecord', function (userService, $http,$location) {
        return {
            restrict: 'EA',
            link: function ($scope, element, attr) {
                $http({
                    url: baseUrl + 'ym/history/list.api',
                    method: 'POST',
                    params: {
                        accountId: userService.userMsg.accountId,
                        type: 'news',
                        sign: md5('ymy' + userService.userMsg.accountId + 'news')
                    }
                }).success(function (data) {
                    console.log(data);
                    if (data.result == 1) {
                        $scope.passageUseList = data.list;
                        $scope.passageUseList.forEach(function (val) {
                            val.news.date = new Date(parseInt(val.readTime) * 1000).toLocaleString().replace(/:\d{1,2}$/, ' ');
                        })
                    }
                }).error(function () {
                    $scope.$emit('my.net.break','');
                    //$scope.alertTab('网络异常,请检查网络!',$scope.netBreakBack);
                })

                $scope.toDetailPage=function(val){
                    console.log(val);
                    $location.path('/detail/history/9/'+val.id);
                }
            },
            templateUrl: 'app/views/mine/history.passage.tpl.html'
        }
    })
    //帮助与反馈
    .directive('feedRecord', function (userService, $http) {
        return {
            restrict: 'EA',
            controller: function ($scope, userService) {

            },
            link: function ($scope, element, attr) {
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
                $scope.reqParams.publisher = userService.userMsg.accountId;
                $scope.reqParams.sign = md5('ymy' + userService.userMsg.accountId);
                $http({
                    url: baseUrl + 'ym/question/list.api',
                    method: 'POST',
                    params: $scope.reqParams
                }).success(function (data) {
                    if (data.result == 1) {
                        $scope.resData.list = $scope.resData.list.concat(data.categoryQuestionList);
                        $scope.resData.totalNum = data.totalPage;
                    }
                    if ($scope.resData.list && $scope.resData.list.length > 0) {
                        $scope.resData.list.forEach(function (val) {
                            val.useDate = new Date(parseInt(val.createTime) * 1000).toLocaleString().replace(/:\d{1,2}$/, ' ').substr(0, 10);
                            if (val.status == 1) {
                                val.statusWord = '待处理';
                            } else if (val.status == 2) {
                                val.statusWord = '已完成';
                            } else if (val.status == 3) {
                                val.statusWord = '处理中';
                            }
                        })
                    }
                }).error(function () {
                    $scope.$emit('my.net.break','');
                    //$scope.alertTab('网络异常,请检查网络!', $scope.netBreakBack);
                })

                $scope.showDealResult = '';
                $scope.toOneFeedQuestion = function (val) {
                    if ($scope.showDealResult == val) {
                        $scope.showDealResult = ''
                    } else {
                        $scope.showDealResult = val
                    }
                    //$scope.$emit('my.feed.question',val);
                }
                //})
            },
            templateUrl: 'app/views/mine/feed.record.html'
        }
    })
    //收藏列表-待开发
    .directive('collectList',function(userService, $http,$location){
        return {
            restrict: 'EA',
            link: function (scope, element, attr) {
                scope.collectType=1;
                scope.passageUseList=[];
                scope.collectPassage=function(){
                    $http({
                        url: baseUrl + 'ym/collection/list.api',
                        method: 'POST',
                        params: {
                            accountId: userService.userMsg.accountId,
                            type: 'news',
                            sign: md5('ymy' + userService.userMsg.accountId + 'news')
                        }
                    }).success(function (data) {
                        console.log(data);
                        if (data.result == 1) {
                            scope.passageUseList = data.list;
                            console.log(scope.passageUseList);
                            scope.passageUseList.forEach(function (val) {
                                val.news.formateDate=new Date(val.news.pubTime*1000).format('yyyy-MM-dd');
                                val.date = new Date(parseInt(val.readTime) * 1000).toLocaleString().replace(/:\d{1,2}$/, ' ');
                            })
                        }
                    }).error(function () {
                        scope.$emit('my.net.break','');
                        //$scope.alertTab('网络异常,请检查网络!',$scope.netBreakBack);
                    })
                }
                scope.collectAlbum=function(){
                    $http({
                        url: baseUrl + 'ym/collection/list.api',
                        method: 'POST',
                        params: {
                            accountId: userService.userMsg.accountId,
                            type: 'album',
                            sign: md5('ymy' + userService.userMsg.accountId + 'album')
                        }
                    }).success(function (data) {
                        console.log(data);
                        scope.videoUseList=data.list;
                        // if (data.result == 1) {
                        //     scope.videoUseList = data.list;
                        //     scope.videoUseList.forEach(function (val) {
                        //         val.date = new Date(parseInt(val.readTime) * 1000).toLocaleString().replace(/:\d{1,2}$/, ' ');
                        //     })
                        // }
                    }).error(function () {
                        scope.$emit('my.net.break','');
                        //$scope.alertTab('网络异常,请检查网络!',$scope.netBreakBack);
                    })
                }
                scope.collectAlbum();

                scope.choiceVideo=function(val){
                    if(scope.collectType==val){
                        return;
                    }
                    scope.collectType=val;
                    scope.collectAlbum();

                }
                scope.choicePassage=function(val){
                    if(scope.collectType==val){
                        return;
                    }
                    scope.collectType=val;
                    scope.collectPassage();

                }
                scope.openAlbumDetail=function(val){
                    $location.path('/album/collection/1/'+val.album.id);
                }
                scope.toDetailPage=function(val){
                    $location.path('/detail/collection/9/'+val.id);
                }
            },
            templateUrl: 'app/views/mine/collect.list.html'
        }
    })
    .directive('feedRecordDetail', function () {
        return {
            restrict: 'EA',
            link: function (scope, element, attr) {

            },
            templateUrl: 'app/views/mine/feed.record.detail.html'
        }
    })
    //用户信息界面
    .directive('userInfo', function (userService, $http, $modal, $rootScope, config) {
        return {
            restrict: 'EA',
            link: function ($scope, element, attr) {
                console.log(userService.userMsg);
                $scope.modifyPortrait = function () {
                    $rootScope.uploadAvatar = $modal.open({
                        templateUrl: "app/views/mine/upload.avatar.tpl.html",
                        backdrop: true,
                        keyboard: false,
                        size: 'feed',
                        controller: function ($scope, $http, userService, FileUploader) {
                            $scope.closeAvatarModal = function () {
                                $rootScope.uploadAvatar.close();
                            }
                            $scope.modifyNameCan = true;

                            var uploader = $scope.uploader1 = new FileUploader({
                                url: baseUrl + "ym/upload/uploadImage",
                                method: 'POST'
                            });
                            uploader.filters.push({
                                name: 'imageFilter',
                                fn: function (item /*{File|FileLikeObject}*/, options) {
                                    var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                                    return config.imageFilterType.indexOf(type) !== -1;
                                }
                            }, {
                                name: 'sizeFilter',
                                fn: function (item) {
                                    return item.size <= config.imageSize;
                                }
                            });

                            uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {
                                if (filter.name == 'imageFilter') {

                                } else if (filter.name == 'sizeFilter') {
                                    var mb = config.imageSize / 1048576;

                                }
                            };
                            uploader.onAfterAddingFile = function (fileItem) {

                                $scope.oldPicShow1 = false;
                                //var addedItems = [fileItem];
                                //var param = {
                                //    items: addedItems,
                                //    queue: scope.uploader1.queue,
                                //    imgWidth: 750,
                                //    imgHeight: 406
                                //};
                                //aspectRatio.query(param);
                                if ($scope.uploader1.queue.length > 1) {
                                    uploader.queue.splice(0, 1);
                                }
                                $scope.fileitem = '';
                                fileItem.isPro = '未上传';

                            };

                            uploader.onBeforeUploadItem = function (item) {
                                item.formData.push({
                                    accountId: userService.userMsg.accountId,
                                    sign: md5('ymy' + userService.userMsg.accountId)
                                })
                                // item.formData.push({
                                //     place: $scope.picObj.place,
                                //     linkedPath: $scope.picObj.linkedPath,
                                //     name: $scope.picObj.name,
                                //     openEnable: $scope.picObj.openEnable,
                                //     priority: $scope.picObj.priority,
                                //     firstPicId: $scope.picObj.firstPicId || null,
                                //     picId: $scope.picObj.picId || null
                                // });
                            };
                            uploader.onProgressItem = function (fileItem, progress) {

                                fileItem.isPro = '正在上传';
                            };
                            uploader.onSuccessItem = function (fileItem, response, status, headers) {

                                fileItem.isPro = '上传成功';


                            };
                            uploader.onErrorItem = function (fileItem, response, status, headers) {
                                fileItem.isPro = '上传失败';


                            };
                            uploader.onCancelItem = function (fileItem, response, status, headers) {
                            };
                            uploader.onCompleteItem = function (fileItem, response, status, headers) {
                            };
                            $scope.uploaderFile = function () {
                                if ($scope.uploader1.queue.length > 0) {
                                    $scope.uploader1.queue[0].upload();
                                }
                            }
                        }
                    })
                }
                $scope.modifyName = function () {
                    $rootScope.modal = $modal.open({
                        templateUrl: "app/views/mine/modify.name.card.html",
                        backdrop: true,
                        keyboard: false,
                        size: 'login',
                        controller: function ($scope, $http, userService) {
                            $scope.closeModal = function () {
                                $scope.modal.close();
                            }
                            $scope.modifyNameCan = true;
                            $scope.user = {
                                name: userService.userMsg.userName
                            }
                            $scope.modifyUserName = function () {
                                if (!$scope.modifyNameCan) {
                                    return;
                                }
                                if (!$scope.user.name) {
                                    $scope.modifyNameTip='用户名不能为空';
                                    return;
                                }
                                $scope.modifyNameCan = false;
                                $http({
                                    url: baseUrl + 'ym/account/updateInfo.api',
                                    method: 'POST',
                                    params: {
                                        accountId: userService.userMsg.accountId,
                                        userName: encodeURI($scope.user.name),
                                        sign: md5('ymy' + userService.userMsg.accountId + $scope.user.name)
                                    }
                                }).success(function (data) {
                                    if (data.result == 1) {
                                        $scope.closeModal();
                                        $rootScope.successAlter('修改成功');
                                        //$scope.$emit('alter.confirm.window','修改成功');
                                        userService.userMsg.userName = $scope.user.name;
                                        try {
                                            var jsonStr = JSON.stringify(userService.userMsg);
                                            window.external.userLoginInfo(jsonStr);
                                        } catch (e) {

                                        }
                                    } else {

                                    }

                                    $scope.modifyNameCan = true;
                                }).error(function () {
                                    $scope.modifyNameTip='网络请求错误，请检查网络!';
                                })

                            }


                        }
                    });
                }
                //修改支付密码函数 模态框
                $scope.modifyPassword = function () {
                    $rootScope.modal = $modal.open({
                        templateUrl: "app/views/mine/modify.password.card.html",
                        backdrop: true,
                        keyboard: false,
                        size: 'login',
                        controller: function ($scope, $http, userService) {
                            $scope.closeModal = function () {
                                $scope.modal.close();
                            }
                            $scope.passwordInfo = {
                                oldPassword: '',
                                newPassword: '',
                                reNewPassword: ''
                            }
                            $scope.doubleClick = false;
                            $scope.modifyPasswordTip = ''
                            $scope.modifyUserPassword = function () {
                                if ($scope.doubleClick) {
                                    return;
                                }
                                if (!$scope.passwordInfo.oldPassword) {
                                    $scope.modifyPasswordTip = '请输入旧密码';
                                    return;
                                }
                                if (!$scope.passwordInfo.newPassword) {
                                    $scope.modifyPasswordTip = '请输入新密码';
                                    return;
                                }
                                if ($scope.passwordInfo.newPassword.length < 8) {
                                    $scope.modifyPasswordTip = '新密码长度不应少于8位';
                                    return;
                                }
                                if ($scope.passwordInfo.newPassword != $scope.passwordInfo.reNewPassword) {
                                    $scope.modifyPasswordTip = '两次新密码输入不一致';
                                    return;
                                }
                                $scope.doubleClick = true;
                                $http({
                                    url: baseUrl + 'ym/account/updatePassword.api',
                                    method: 'POST',
                                    params: {
                                        phone: userService.userMsg.phone,
                                        oldPassword: md5($scope.passwordInfo.oldPassword),
                                        newPassword: md5($scope.passwordInfo.newPassword),
                                        sign: md5('ymy' + md5($scope.passwordInfo.newPassword) + md5($scope.passwordInfo.oldPassword) + userService.userMsg.phone)
                                    }
                                }).success(function (data) {
                                    if (data.result == 1) {
                                        $scope.closeModal();
                                        $rootScope.successAlter('修改成功');
                                    } else if (data.result == 103) {
                                        $scope.modifyPasswordTip = '旧密码输入不正确'
                                    }
                                    $scope.doubleClick = false;
                                }).error(function () {
                                    $scope.modifyPasswordTip = '网络故障，请检查您的网络!'
                                    $scope.doubleClick = false;
                                })
                            }
                        }
                    });
                }
            },
            templateUrl: 'app/views/mine/user.info.html'
        }
    })
    //没有登录，显示这个界面
    .directive('noLoginPanel', function () {
        return {
            restrict: 'EA',
            link: function (scope, element, attr) {

            },
            templateUrl: 'app/views/mine/nologin.panel.tpl.html'
        }
    })
    //网络不通畅，显示这个界面
    .directive('netBreakPanel', function ($http,userService) {
        return {
            restrict: 'EA',
            link: function (scope, element, attr) {
                scope.reRequestNet=function(){
                    $http({
                        url: baseUrl + 'ym/app/list.api',
                        method: 'POST'
                    }).success(function (data) {
                        if(data.result==1&&userService.userMsg.accountId){
                            scope.$emit('my.on.history','');
                        }else{
                            scope.$emit('no.login.panel','');
                        }
                        //$scope.appProList = data.list;
                    }).error(function () {
                        //$scope.$emit('my.net.break','');
                    })
                }
            },
            templateUrl: 'app/views/mine/net.break.tpl.html'
        }
    })
    //分页插件
    .directive('tmPagination',[function(){
        return {
            restrict: 'EA',
            template: '<div class="page-list" style="overflow: hidden">' +
            '<ul class="pagination" ng-show="conf.totalItems > 0">' +
            '<li ng-class="{disabled: conf.currentPage == 1}" ng-click="prevPage()"><span>&laquo;</span></li>' +
            '<li ng-repeat="item in pageList track by $index" ng-class="{active: item == conf.currentPage, separate: item == \'...\'}" ' +
            'ng-click="changeCurrentPage(item)">' +
            '<span>{{ item }}</span>' +
            '</li>' +
            '<li ng-class="{disabled: conf.currentPage == conf.numberOfPages}" ng-click="nextPage()"><span>&raquo;</span></li>' +
            '</ul>' +
            //'<div class="page-total form-inline" ng-show="conf.totalItems > 0">' +
            //'第<input type="text" ng-model="jumpPageNum"  ng-keyup="jumpToPage($event)" class="form-control" style="margin: 0 5px;"/>页 ' +
            //'每页<select ng-model="conf.itemsPerPage" ng-options="option for option in conf.perPageOptions " style="margin: 0 5px;border-radius: 4px;"></select>' +
            //'/共<strong>{{ conf.totalItems }}</strong>条' +
            //'</div>' +
            '<div class="no-items" ng-show="conf.totalItems <= 0" style="position: absolute;display: block;left: 47%;">{{dataText}}</div>' +
            '</div>',
            replace: true,
            scope: {
                conf: '='
            },
            link: function(scope, element, attrs){
                // 变更当前页
                scope.changeCurrentPage = function(item) {
                    console.log(item);
                    if(item == '...'){
                        return;
                    }else{
                        scope.conf.currentPage = item;
                    }
                };

                // 定义分页的长度必须为奇数 (default:9)
                scope.conf.pagesLength = parseInt(scope.conf.pagesLength) ? parseInt(scope.conf.pagesLength) : 9 ;
                if(scope.conf.pagesLength % 2 === 0){
                    // 如果不是奇数的时候处理一下
                    scope.conf.pagesLength = scope.conf.pagesLength -1;
                }

                // conf.erPageOptions
                if(!scope.conf.perPageOptions){
                    scope.conf.perPageOptions = [10, 15, 20, 30, 50];
                }

                // pageList数组
                function getPagination(newValue, oldValue) {
                    console.log('000');
                    if (scope.conf.totalItems < 0) {
                        scope.dataText = "数据加载中";
                    } else if(scope.conf.totalItems == 0){
                        scope.dataText = "暂无评论";
                        return false;
                    }
                    // conf.currentPage
                    scope.conf.currentPage = parseInt(scope.conf.currentPage) ? parseInt(scope.conf.currentPage) : 1;



                    // conf.totalItems
                    scope.conf.totalItems = parseInt(scope.conf.totalItems) ? parseInt(scope.conf.totalItems) : 0;

                    // conf.itemsPerPage (default:15)
                    scope.conf.itemsPerPage = parseInt(scope.conf.itemsPerPage) ? parseInt(scope.conf.itemsPerPage) : 15;


                    // numberOfPages
                    scope.conf.numberOfPages = Math.ceil(scope.conf.totalItems/scope.conf.itemsPerPage);

                    // judge currentPage > scope.numberOfPages
                    if(scope.conf.currentPage < 1){
                        scope.conf.currentPage = 1;
                    }

                    // 如果分页总数>0，并且当前页大于分页总数
                    if(scope.conf.numberOfPages > 0 && scope.conf.currentPage > scope.conf.numberOfPages){
                        scope.conf.currentPage = scope.conf.numberOfPages;
                    }

                    // jumpPageNum
                    scope.jumpPageNum = scope.conf.currentPage;

                    // 如果itemsPerPage在不在perPageOptions数组中，就把itemsPerPage加入这个数组中
                    var perPageOptionsLength = scope.conf.perPageOptions.length;
                    // 定义状态
                    var perPageOptionsStatus;
                    for(var i = 0; i < perPageOptionsLength; i++){
                        if(scope.conf.perPageOptions[i] == scope.conf.itemsPerPage){
                            perPageOptionsStatus = true;
                        }
                    }
                    // 如果itemsPerPage在不在perPageOptions数组中，就把itemsPerPage加入这个数组中
                    if(!perPageOptionsStatus){
                        scope.conf.perPageOptions.push(scope.conf.itemsPerPage);
                    }

                    // 对选项进行sort
                    scope.conf.perPageOptions.sort(function(a, b){return a-b});

                    scope.pageList = [];
                    if(scope.conf.numberOfPages <= scope.conf.pagesLength){
                        // 判断总页数如果小于等于分页的长度，若小于则直接显示
                        for(i =1; i <= scope.conf.numberOfPages; i++){
                            scope.pageList.push(i);
                        }
                    }else{
                        // 总页数大于分页长度（此时分为三种情况：1.左边没有...2.右边没有...3.左右都有...）
                        // 计算中心偏移量
                        var offset = (scope.conf.pagesLength - 1)/2;
                        if(scope.conf.currentPage <= offset){
                            // 左边没有...
                            for(i =1; i <= offset +1; i++){
                                scope.pageList.push(i);
                            }
                            scope.pageList.push('...');
                            scope.pageList.push(scope.conf.numberOfPages);
                        }else if(scope.conf.currentPage > scope.conf.numberOfPages - offset){
                            scope.pageList.push(1);
                            scope.pageList.push('...');
                            for(i = offset + 1; i >= 1; i--){
                                scope.pageList.push(scope.conf.numberOfPages - i);
                            }
                            scope.pageList.push(scope.conf.numberOfPages);
                        }else{
                            // 最后一种情况，两边都有...
                            scope.pageList.push(1);
                            scope.pageList.push('...');

                            for(i = Math.ceil(offset/2) ; i >= 1; i--){
                                scope.pageList.push(scope.conf.currentPage - i);
                            }
                            scope.pageList.push(scope.conf.currentPage);
                            for(i = 1; i <= offset/2; i++){
                                scope.pageList.push(scope.conf.currentPage + i);
                            }

                            scope.pageList.push('...');
                            scope.pageList.push(scope.conf.numberOfPages);
                        }
                    }

                    if(scope.conf.onChange){
                        // 防止初始化两次请求问题
                        if(!(oldValue != newValue && oldValue[0] == '-')) {
                            scope.conf.onChange();
                        }

                    }
                    scope.$parent.conf = scope.conf;
                    console.log(scope.conf.currentPage);
                }

                // prevPage
                scope.prevPage = function(){
                    if(scope.conf.currentPage > 1){
                        scope.conf.currentPage -= 1;
                    }
                };
                // nextPage
                scope.nextPage = function(){
                    if(scope.conf.currentPage < scope.conf.numberOfPages){
                        scope.conf.currentPage += 1;
                    }
                };

                // 跳转页
                scope.jumpToPage = function(){
                    scope.jumpPageNum = scope.jumpPageNum.replace(/[^0-9]/g,'');
                    if(scope.jumpPageNum !== ''){
                        scope.conf.currentPage = scope.jumpPageNum;
                    }
                };

                scope.$watch(function() {
                    if(scope.conf.totalItems == null) {
                        scope.conf.totalItems = 0;
                    }
                    if(!scope.conf.currentPage) {
                        scope.conf.currentPage = 1;
                    }
                    var newValue = scope.conf.totalItems + ' ' +  scope.conf.currentPage + ' ' + scope.conf.itemsPerPage;
                    return newValue;
                }, getPagination);

            }
        };
    }])
    //省市选择器，二级联动
    .directive('provCity',[function(){
        return {
            restrict:'EA',
            link:function($scope,ele,attr){
                $scope.provinceArr = provinceArr ; //省份数据

                $scope.cityArr = cityArr;    //城市数据
                $scope.getCityArr = $scope.cityArr[0]; //默认为省份
                $scope.getCityIndexArr = ['0','0'] ; //这个是索引数组，根据切换得出切换的索引就可以得到省份及城市

                //改变省份触发的事件 [根据索引更改城市数据]
                $scope.provinceChange = function(index)
                {
                    $scope.getCityArr = $scope.cityArr[index] ; //根据索引写入城市数据
                    $scope.getCityIndexArr[1] = '0' ; //清除残留的数据
                    $scope.getCityIndexArr[0] = index ;
                    //输出查看数据
                    console.log($scope.getCityIndexArr,provinceArr[$scope.getCityIndexArr[0]],cityArr[$scope.getCityIndexArr[0]][$scope.getCityIndexArr[1]]);
                    $scope.$emit('choice.city',{prov:provinceArr[$scope.getCityIndexArr[0]],city:cityArr[$scope.getCityIndexArr[0]][$scope.getCityIndexArr[1]]})
                }
                //改变城市触发的事件
                $scope.cityChange = function(index)
                {
                    $scope.getCityIndexArr[1] = index ;
                    //输出查看数据
                    console.log($scope.getCityIndexArr,provinceArr[$scope.getCityIndexArr[0]],cityArr[$scope.getCityIndexArr[0]][$scope.getCityIndexArr[1]]);
                    $scope.$emit('choice.city',{prov:provinceArr[$scope.getCityIndexArr[0]],city:cityArr[$scope.getCityIndexArr[0]][$scope.getCityIndexArr[1]]})
                }
            },
            templateUrl:'app/views/mine/prov.city.html'

        }
    }])
    .filter('formateDate', [function () {
        return function (val) {
            return new Date(parseInt(val) * 1000).toLocaleString().substr(0, 12);
        }

    }])


