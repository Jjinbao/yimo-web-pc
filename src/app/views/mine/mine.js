angular.module('app.mine', [])
    .controller('mine', ['$rootScope', '$scope', '$window', '$http', '$modal', 'userService','config', function ($rootScope, $scope, $window, $http, $modal, userService,config) {
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

        $scope.modifyPortrait=function(){
            console.log(userService.userMsg);
            $rootScope.uploadAvatar=$modal.open({
                templateUrl: "app/views/mine/upload.avatar.tpl.html",
                backdrop: true,
                keyboard: false,
                size:'modify',
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
    }])
