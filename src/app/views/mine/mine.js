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
                height: newVal.h - 100,
                width: newVal.w < 1366 ? 1116 : newVal.w - 250
            }
        })

        $rootScope.regOrLogin=function(){
            $scope.haveLoginuser = userService.userMsg;
        }

        //修改用户头像和姓名
        $scope.changeUserInfo = function () {
            $scope.haveLoginuser = userService.userMsg;
            $scope.$emit('user.nav.img', $scope.haveLoginuser);
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
                $scope.toOneFeedQuestion=function(val){
                    $scope.$emit('my.feed.question',val);
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
                    console.log(userService.userMsg);
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
                            console.log('----------------uploader---------------');
                            console.log($scope.uploader1.queue.length);
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
                                    console.log('数据格式不正确，只能上传')
                                }else if(filter.name == 'sizeFilter'){
                                    var mb = config.imageSize / 1048576;
                                    console.log("单张图片不能超过"+ mb +"M");
                                }
                            };
                            uploader.onAfterAddingFile = function (fileItem) {
                                console.log($scope.uploader1.queue);
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
                                console.log(item);
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
                                console.log('00000000000');
                                fileItem.isPro = '正在上传';
                            };
                            uploader.onSuccessItem = function (fileItem, response, status, headers) {
                                fileItem.isPro = '上传成功';
                                console.log('上传成功');
                                // scope.holdDoubleClick = false;
                                // scope.loadingModel();
                                // alertOrConfirm.successAlert("成功");
                                // $rootScope.modal.close();
                                // load();
                            };
                            uploader.onErrorItem = function (fileItem, response, status, headers) {
                                fileItem.isPro = '上传失败';
                                console.log('上传失败');
                                //scope.loadingModel();
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
    .filter('phoneHash', [function () {
        return function (value) {
            var input = value + '';
            input = input.replace(/(\s+)/g, "");
            var out = '';
            for(var i = 0; i < input.length; i++){
                if(i == 2){
                    out = out + input[i] + ' ';
                }else if(i>2 && i<=6){
                    out = out + '*';
                    if(i == 6){
                        out = out + ' '
                    }
                }else {
                    out = out + input[i]
                }
            }
            return out
        }
    }])
