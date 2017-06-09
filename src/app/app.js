'use strict'

Date.prototype.format =function(format)
{
    var o = {
        "M+" : this.getMonth()+1, //month
        "d+" : this.getDate(), //day
        "h+" : this.getHours(), //hour
        "m+" : this.getMinutes(), //minute
        "s+" : this.getSeconds(), //second
        "q+" : Math.floor((this.getMonth()+3)/3), //quarter
        "S" : this.getMilliseconds() //millisecond
    }
    if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
        (this.getFullYear()+"").substr(4- RegExp.$1.length));
    for(var k in o)if(new RegExp("("+ k +")").test(format))
        format = format.replace(RegExp.$1,
            RegExp.$1.length==1? o[k] :
                ("00"+ o[k]).substr((""+ o[k]).length));
    return format;
}

function giveLoginInfo(data){
    var countSecond=function(){
    }
    try{
        var jsonStr=JSON.stringify(data);
        var pcBack=window.external.userLoginInfo(jsonStr);

        setTimeout('countSecond()',3000);
    }catch(e){

    }
}
// angular.module('swalk', ['ngRoute','ngAnimate', 'ui.bootstrap', 'app.router', 'app.login', 'app.home', 'app.info', 'app.teach', 'app.mine'])
angular.module('app', ['ngAnimate', 'ngRoute', 'ui.bootstrap','ngImgCrop','angularFileUpload', 'ympc.services', 'app.router', 'app.home', 'app.login', 'app.info','app.mine'])
/*所有控制器的父控制器*/
    .controller('rootTabCtrl', ['$rootScope', '$scope', '$location', '$modal','userService', function ($rootScope, $scope, $location, $modal,userService) {
        $scope.activeTab = 'YY'
        $scope.size = 600;
        $scope.clickTab = function (val) {
            if ($scope.activeTab == val) {
                return;
            }
            $scope.activeTab = val;
            if ($scope.activeTab == 'WD') {
                $location.path('/mine');
            }
        }
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
            if(data){
                $scope.userImg = data;
            }else{
                $scope.userImg='';
            }

        })
        //获取用户登录信息
        try{
            var pcUserInfo=window.external.getUserInfo();
            if(pcUserInfo){
                userService.userMsg=JSON.parse(pcUserInfo);
                $scope.userImg=userService.userMsg.smallImg;
            }
        }catch (e){
        }


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
                                try{
                                    var jsonStr=JSON.stringify(data);
                                    window.external.userLoginInfo(jsonStr);
                                }catch(e){

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
                        $scope.imgCode='';
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
                                try{
                                    var jsonStr=JSON.stringify(data);
                                    window.external.userLoginInfo(jsonStr);
                                }catch(e){

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
                            $scope.findPasswordTip='';
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

        $rootScope.existLogin=function(callback){
            $rootScope.alterSureModal=$modal.open({
                templateUrl: "app/views/mine/exist.login.tpl.html",
                backdrop: true,
                keyboard: false,
                size: 'exist',
                controller: function ($scope, $http, $interval, userService) {
                    $scope.cancleQuit=function(){
                        $rootScope.alterSureModal.close();
                    }
                    $scope.sureQuit=function(){
                        callback();
                        $rootScope.alterSureModal.close();
                    }
                }
            })
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

        $scope.windwoClose=function(){
            try{
                window.external.OnbtnClose();
            }catch (e){

            }

        }
        $scope.windwoMax=function(){
            try{
                window.external.OnbtnMax();
            }catch (e){

            }

        }
        $scope.windwoMin=function(){
            try{
                window.external.OnbtnMin();
            }catch (e){

            }

        }
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
    .directive('helpFeed', function ($http) {
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

                $scope.appFeedRecord = function (val) {
                    $scope.$emit('help.feed.type', val);
                }
            },
            templateUrl: 'app/views/mine/help.feed.tpl.html'
        }
    })
    .directive('helpFeedApp', function (userService, $http,$rootScope,$modal) {
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
                        //$scope.alertTab('网络异常,请检查网络!', $scope.netBreakBack);
                    })
                }
                $scope.alterFeedWindow=function(val){
                    $rootScope.modal = $modal.open({
                        templateUrl: "app/views/mine/feed.question.card.html",
                        backdrop: true,
                        keyboard: false,
                        size:'feed',
                        controller: function ($scope,$http,userService) {

                            $scope.feedTarget=val;
                            $scope.closeModal=function(){
                                $scope.modal.close();
                            }
                            $scope.feedInfo={
                                contact:'',
                                info:'',
                            }
                            $scope.doubleClick=false;
                            $scope.feedErroMsg='';
                            $scope.startFeedQuestion=function(){
                                if($scope.doubleClick){
                                    return;
                                }
                                if(!$scope.feedInfo.contact){
                                    $scope.feedErroMsg='请填写反馈人联系方式';
                                    return;
                                }
                                if(!$scope.feedInfo.info){
                                    $scope.feedErroMsg='请填写反馈内容';
                                    return;
                                }
                                $scope.doubleClick=true;

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
                                        $scope.feedErroMsg='反馈失败';
                                    }
                                    $scope.doubleClick=false;
                                }).error(function () {
                                    $scope.doubleClick=false;
                                    $scope.feedErroMsg='网络异常,请检查网络!';
                                })

                            }
                        }
                    });
                }
                $scope.feedQuestion=function(val){
                    if(userService.userMsg&&userService.userMsg.accountId){
                        $scope.alterFeedWindow(val);
                    }else{
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
    .directive('historyRecord', function (userService, $http) {
        return {
            restrict: 'EA',
            link: function ($scope, element, attr) {


                $scope.appUseHistory=function(val){
                    $scope.$emit('my.app.history',val);
                }
                $scope.appVideoHistory=function(val){
                    $scope.$emit('my.video.history',val);
                }
                $scope.appPassageHistory=function(val){
                    $scope.$emit('my.passage.history',val);
                }
            },
            templateUrl: 'app/views/mine/history.tpl.html'
        }
    })
    //应用的使用记录
    .directive('appUseRecord',function(userService,$http){
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
                    //$scope.alertTab('网络异常,请检查网络!',$scope.netBreakBack);
                })
            },
            templateUrl: 'app/views/mine/app.use.history.html'
        }
    })
    .directive('videoUseRecord',function(userService,$http){
        return {
            restrict: 'EA',
            link: function ($scope, element, attr) {
                //$http({
                //    url: baseUrl + 'ym/history/list.api',
                //    method: 'POST',
                //    params: {
                //        accountId: userService.userMsg.accountId,
                //        type: 'app',
                //        sign: md5('ymy' + userService.userMsg.accountId + 'app')
                //    }
                //}).success(function (data) {
                //
                //    if (data.result == 1) {
                //        $scope.appUseList = data.list;
                //        $scope.appUseList.forEach(function (val) {
                //            val.date = new Date(parseInt(val.readTime) * 1000).toLocaleString().replace(/:\d{1,2}$/, ' ');
                //        })
                //    }
                //}).error(function () {
                //    //$scope.alertTab('网络异常,请检查网络!',$scope.netBreakBack);
                //})
            },
            templateUrl: 'app/views/mine/history.video.tpl.html'
        }
    })
    .directive('passageUseRecord',function(userService,$http){
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

                    if (data.result == 1) {
                        $scope.appUseList = data.list;
                        $scope.appUseList.forEach(function (val) {
                            val.date = new Date(parseInt(val.readTime) * 1000).toLocaleString().replace(/:\d{1,2}$/, ' ');
                        })
                    }
                }).error(function () {
                    //$scope.alertTab('网络异常,请检查网络!',$scope.netBreakBack);
                })
            },
            templateUrl: 'app/views/mine/history.passage.tpl.html'
        }
    })
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
                    //$scope.alertTab('网络异常,请检查网络!', $scope.netBreakBack);
                })

                $scope.showDealResult='';
                $scope.toOneFeedQuestion=function(val){
                    if($scope.showDealResult==val){
                        $scope.showDealResult=''
                    }else{
                        $scope.showDealResult=val
                    }
                    //$scope.$emit('my.feed.question',val);
                }
                //})
            },
            templateUrl: 'app/views/mine/feed.record.html'
        }
    })
    .directive('feedRecordDetail',function(){
        return {
            restrict: 'EA',
            link: function (scope, element, attr) {

            },
            templateUrl: 'app/views/mine/feed.record.detail.html'
        }
    })
    .directive('userInfo', function (userService, $http,$modal,$rootScope,config) {
        return {
            restrict: 'EA',
            link: function ($scope, element, attr) {
                $scope.modifyPortrait=function(){
                    $rootScope.uploadAvatar=$modal.open({
                        templateUrl: "app/views/mine/upload.avatar.tpl.html",
                        backdrop: true,
                        keyboard: false,
                        size:'feed',
                        controller: function ($scope,$http,userService,FileUploader) {
                            $scope.closeAvatarModal=function(){
                                $rootScope.uploadAvatar.close();
                            }
                            $scope.modifyNameCan=true;

                            var uploader = $scope.uploader1 = new FileUploader({
                                url: baseUrl + "ym/upload/uploadImage",
                                method:'POST'
                            });
                            uploader.filters.push({
                                name: 'imageFilter',
                                fn: function(item /*{File|FileLikeObject}*/, options) {
                                    var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                                    return config.imageFilterType.indexOf(type) !== -1;
                                }
                            },{
                                name: 'sizeFilter',
                                fn: function(item){
                                    return item.size <= config.imageSize;
                                }
                            });

                            uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {
                                if(filter.name == 'imageFilter'){

                                }else if(filter.name == 'sizeFilter'){
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
                                if($scope.uploader1.queue.length > 1){
                                    uploader.queue.splice(0, 1);
                                }
                                $scope.fileitem = '';
                                fileItem.isPro = '未上传';

                            };

                            uploader.onBeforeUploadItem = function (item) {
                                item.formData.push({
                                    accountId:userService.userMsg.accountId,
                                    sign:md5('ymy'+userService.userMsg.accountId)
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
                            $scope.uploaderFile=function(){
                                if($scope.uploader1.queue.length>0){
                                    $scope.uploader1.queue[0].upload();
                                }
                            }
                        }
                    })
                }
                $scope.modifyName=function(){
                    $rootScope.modal = $modal.open({
                        templateUrl: "app/views/mine/modify.name.card.html",
                        backdrop: true,
                        keyboard: false,
                        size:'login',
                        controller: function ($scope,$http,userService) {
                            $scope.closeModal=function(){
                                $scope.modal.close();
                            }
                            $scope.modifyNameCan=true;
                            $scope.user={
                                name:userService.userMsg.userName
                            }
                            $scope.modifyUserName=function(){
                                if(!$scope.modifyNameCan){
                                    return;
                                }
                                if(!$scope.user.name){
                                    return;
                                }
                                $scope.modifyNameCan=false;
                                $http({
                                    url:baseUrl+'ym/account/updateInfo.api',
                                    method:'POST',
                                    params:{
                                        accountId:userService.userMsg.accountId,
                                        userName:encodeURI($scope.user.name),
                                        sign:md5('ymy'+userService.userMsg.accountId+$scope.user.name)
                                    }
                                }).success(function(data){
                                    if(data.result==1){
                                        $scope.closeModal();
                                        $rootScope.successAlter('修改成功');
                                        //$scope.$emit('alter.confirm.window','修改成功');
                                        userService.userMsg.userName=$scope.user.name;
                                        try{
                                            var jsonStr=JSON.stringify(userService.userMsg);
                                            window.external.userLoginInfo(jsonStr);
                                        }catch(e){

                                        }
                                    }else{

                                    }

                                    $scope.modifyNameCan=true;
                                }).error(function(){

                                })

                            }


                        }
                    });
                }
                $scope.modifyPassword=function(){
                    $rootScope.modal = $modal.open({
                        templateUrl: "app/views/mine/modify.password.card.html",
                        backdrop: true,
                        keyboard: false,
                        size:'login',
                        controller: function ($scope,$http,userService) {
                            $scope.closeModal=function(){
                                $scope.modal.close();
                            }
                            $scope.passwordInfo={
                                oldPassword:'',
                                newPassword:'',
                                reNewPassword:''
                            }
                            $scope.doubleClick=false;
                            $scope.modifyPasswordTip=''
                            $scope.modifyUserPassword=function(){
                                if($scope.doubleClick){
                                    return;
                                }
                                if(!$scope.passwordInfo.oldPassword){
                                    $scope.modifyPasswordTip='请输入旧密码';
                                    return;
                                }
                                if(!$scope.passwordInfo.newPassword){
                                    $scope.modifyPasswordTip='请输入新密码';
                                    return;
                                }
                                if($scope.passwordInfo.newPassword.length<8){
                                    $scope.modifyPasswordTip='新密码长度不应少于8位';
                                    return;
                                }
                                if($scope.passwordInfo.newPassword!=$scope.passwordInfo.reNewPassword){
                                    $scope.modifyPasswordTip='两次新密码输入不一致';
                                    return;
                                }
                                $scope.doubleClick=true;
                                $http({
                                    url:baseUrl+'ym/account/updatePassword.api',
                                    method:'POST',
                                    params:{
                                        phone:userService.userMsg.phone,
                                        oldPassword:md5($scope.passwordInfo.oldPassword),
                                        newPassword:md5($scope.passwordInfo.newPassword),
                                        sign:md5('ymy'+md5($scope.passwordInfo.newPassword)+md5($scope.passwordInfo.oldPassword)+userService.userMsg.phone)
                                    }
                                }).success(function(data){
                                    if(data.result==1){
                                        $scope.closeModal();
                                        $rootScope.successAlter('修改成功');
                                    }else if(data.result==103){
                                        $scope.modifyPasswordTip='旧密码输入不正确'
                                    }
                                    $scope.doubleClick=false;
                                }).error(function(){
                                    $scope.modifyPasswordTip='网络故障，请稍候再试'
                                    $scope.doubleClick=false;
                                })
                            }
                        }
                    });
                }
            },
            templateUrl: 'app/views/mine/user.info.html'
        }
    })
    .directive('noLoginPanel', function () {
        return {
            restrict: 'EA',
            link: function (scope, element, attr) {

            },
            templateUrl: 'app/views/mine/nologin.panel.tpl.html'
        }
    })
    //.directive('ngRightClick', function($parse) {
    //    return function(scope, element, attrs) {
    //        var fn = $parse(attrs.ngRightClick);
    //        element.bind('contextmenu', function(event) {
    //            scope.$apply(function() {
    //                event.preventDefault();
    //                fn(scope, {$event:event});
    //            });
    //        });
    //    };
    //})
    .filter('formateDate', [function () {
        return function (val) {
            return new Date(parseInt(val) * 1000).toLocaleString().substr(0, 12);
        }

    }])
    .directive('contextMenu', ['$window', function($window) {
        return {
            restrict: 'A',
            //require:'^?ngModel',
            link: function($scope, element, attrs) {
                var opened = false;
                var menuElement = angular.element(document.getElementById(attrs.target));
                function open(event, element) {
                    $scope.opened = true;
                    menuElement.css('top', event.clientY + 'px');
                    menuElement.css('left', event.clientX + 'px');
                };
                function close(element) {
                    $scope.opened = false;
                };

                $scope.opened = false;

//每个项点击的事件
                $scope.fns = {
                    "查看":function($event){
                        alert('LOOK');
                    },
                    "刷新":function($event){
                        alert('刷新')
                    }
                    ,
                    "点击":function($event){
                        alert('点击')
                    }
                }
//模拟数据填充菜单   数据可通以点击元素过属性传递过来
//菜单的html 结构
//<ul id='a'><li ng-repeat='m in ms'>{{m.name}}</li></ul>
                $scope.ms = [{name:'删除'}];
                $scope.fn = function($event,sName){
                    /*
                     * 根据sName 来判断使用什么函数
                     */

                    $scope.fns[sName]($event);
                }
//显示右键菜单
                element.bind('contextmenu', function(event) {
                    $scope.$apply(function() {
                        event.preventDefault();
                        open(event, menuElement);
                    });
                });

//窗口绑定点击事件 隐藏右键菜单
                angular.element($window).bind('click', function(event) {
                    console.log('-12-');
                    if (opened) {
                        $scope.$apply(function() {
                            event.preventDefault();
                            close(menuElement);
                        });
                    }
                });
            }
        };
    }]);


