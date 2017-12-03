angular.module('app.mine', [])
    //我的主界面，显示个人资料
    .controller('mine', ['$rootScope', '$scope', '$window', '$http', '$modal', 'userService','config', function ($rootScope, $scope, $window, $http, $modal, userService,config) {
        //随时监听界面大小变化，自动使用屏幕宽度的代码
        $scope.nowActivePanel = '';
        var w = angular.element($window);
        $scope.getWindowDimensions = function () {
            return {'h': w.height(), 'w': w.width()};
        };
        $scope.panelWidth = {}
        //随时监听界面窗口变化
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
        //判断当前用户是否登录
        $rootScope.regOrLogin=function(){
            $scope.haveLoginuser = userService.userMsg;
        }

        //修改用户头像和姓名
        $scope.changeUserInfo = function () {
            $scope.haveLoginuser = userService.userMsg;
            $scope.$emit('user.nav.img', $scope.haveLoginuser.smallImg);
            if(!$scope.haveLoginuser.accountId){
                $scope.nowActivePanel = 'noLogin'
            }
        }
        //判断是否登录，如果登录显示用户信息，如果没有登录，隐藏历史记录等相关选项
        if (userService.userMsg.accountId) {
            $scope.changeUserInfo();
            $scope.nowActivePanel ='history';
        }else{
            $scope.nowActivePanel = 'noLogin'
        }

        //如果用户没有登录，跳转去登录的函数
        $scope.mineLogin = function () {
            $scope.login('', function (value) {
                $scope.changeUserInfo();
                $scope.nowActivePanel ='history';
            });
        }
        //应用，函数中一直在判断有没有登录
        $scope.application = function (val) {
            if ($scope.nowActivePanel == val) {
                return;
            }
            if (userService.userMsg && userService.userMsg.accountId) {
                //登录，跳转到相应的显示界面
                $scope.nowActivePanel = val;
            } else {
                //没有登录，清空登录信息，需要重新登录
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
        //接受帮助与反馈的函数返回
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
        //网络中断
        $scope.$on('my.net.break',function(evt,data){
            $scope.nowActivePanel='netBreak';
        })
        //历史记录
        $scope.$on('my.on.history',function(evt,data){
            $scope.nowActivePanel='history';
        })
        //没有登录的界面
        $scope.$on('no.login.panel',function(evt,data){
            $scope.nowActivePanel='noLogin';
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
        //收藏列表
        $scope.collectList=function(val){
            console.log(val);
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
        $scope.callbackFun=function(){
            $scope.haveLoginuser = userService.userMsg = {};
            $scope.haveLoginuser = '';
            $scope.nowActivePanel = 'noLogin'
            $scope.$emit('user.nav.img', '');
            try{
                window.external.userLoginInfo("");
            }catch(e){

            }
        }
        $scope.quitLogin = function () {
            // $scope.haveLoginuser = userService.userMsg = {};
            // $scope.haveLoginuser = '';
            // $scope.nowActivePanel = 'noLogin'
            // $scope.$emit('user.nav.img', '');
            $rootScope.existLogin($scope.callbackFun);
        }


        //获取反馈的应用列表
        $scope.helpFeedApp = function () {
            $scope.nowActivePanel = 'feed';
        }
        //修改头像函数
        $scope.modifyImg=function(){
            $scope.modifyPortrait($scope.changeUserInfo);
        }

        //上传头像模板
        $scope.modifyPortrait=function(fatherScope){
            //打开弹窗，等待用户相应操作
            $rootScope.uploadAvatar=$modal.open({
                templateUrl: "app/views/mine/upload.avatar.tpl.html",
                backdrop: true,
                keyboard: false,
                size:'modify',
                controller: function ($scope,$http,userService,FileUploader) {
                    //关闭模态框
                    $scope.closeAvatarModal=function(){
                        $rootScope.uploadAvatar.close();
                    }
                    // $scope.modifyNameCan=true;
                    $scope.uploadImgTip='';
                    var uploader = $scope.uploader1 = new FileUploader({
                        url: baseUrl + "ym/upload/uploadImage",
                        method:'POST'
                    });
                    function base64ToBlob(base64Data, contentType) {
                        contentType = contentType || '';
                        var sliceSize = 1024;
                        var byteCharacters = atob(base64Data);
                        var bytesLength = byteCharacters.length;
                        var slicesCount = Math.ceil(bytesLength / sliceSize);
                        var byteArrays = new Array(slicesCount);

                        for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
                            var begin = sliceIndex * sliceSize;
                            var end = Math.min(begin + sliceSize, bytesLength);

                            var bytes = new Array(end - begin);
                            for (var offset = begin, i = 0 ; offset < end; ++i, ++offset) {
                                bytes[i] = byteCharacters[offset].charCodeAt(0);
                            }
                            byteArrays[sliceIndex] = new Uint8Array(bytes);
                        }
                        return new Blob(byteArrays, { type: contentType });
                    }
                    // uploader.filters.push({
                    //     name: 'imageFilter',
                    //     fn: function(item /*{File|FileLikeObject}*/, options) {
                    //         var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                    //         return config.imageFilterType.indexOf(type) !== -1;
                    //     }
                    // },{
                    //     name: 'sizeFilter',
                    //     fn: function(item){
                    //         return item.size <= config.imageSize;
                    //     }
                    // });
                    //
                    // uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {
                    //     if(filter.name == 'imageFilter'){
                    //         $scope.uploadImgTip='数据格式不正确，只能上传jpg,png,jpeg格式的图片';
                    //     }else if(filter.name == 'sizeFilter'){
                    //         var mb = config.imageSize / 1048576;
                    //         $scope.uploadImgTip="单张图片不能超过"+ mb +"M";
                    //     }
                    // };
                    // uploader.onAfterAddingFile = function (fileItem) {
                    //     $scope.uploadImgTip='';
                    //     $scope.oldPicShow1 = false;
                    //     //var addedItems = [fileItem];
                    //     //var param = {
                    //     //    items: addedItems,
                    //     //    queue: scope.uploader1.queue,
                    //     //    imgWidth: 750,
                    //     //    imgHeight: 406
                    //     //};
                    //     //aspectRatio.query(param);
                    //     if($scope.uploader1.queue.length > 1){
                    //         uploader.queue.splice(0, 1);
                    //     }
                    //     $scope.fileitem = '';
                    //     fileItem.isPro = '未上传';
                    //
                    // };
                    //
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
                    // uploader.onProgressItem = function (fileItem, progress) {
                    //     console.log('00000000000');
                    //     fileItem.isPro = '正在上传';
                    // };
                    uploader.onSuccessItem = function (fileItem, response, status, headers) {
                        fileItem.isPro = '上传成功';
                        userService.userMsg.smallImg=response.imgsrc;
                        fatherScope();
                        try{
                            var jsonStr=JSON.stringify(userService.userMsg);
                            window.external.userLoginInfo(jsonStr);
                        }catch(e){

                        }
                        $rootScope.uploadAvatar.close();
                        // scope.holdDoubleClick = false;
                        // scope.loadingModel();
                        // alertOrConfirm.successAlert("成功");
                        // $rootScope.modal.close();
                        // load();
                    };
                    uploader.onErrorItem = function (fileItem, response, status, headers) {
                        fileItem.isPro = '上传失败';
                        $scope.uploadImgTip='上传失败';
                        //scope.loadingModel();
                    };
                    // uploader.onCancelItem = function (fileItem, response, status, headers) {
                    // };
                    // uploader.onCompleteItem = function (fileItem, response, status, headers) {
                    // };
                    // $scope.uploaderFile=function(){
                    //     if($scope.uploader1.queue.length>0){
                    //         $scope.uploader1.queue[0].upload();
                    //     }else{
                    //         $scope.uploadImgTip='请选择要上传的图片!'
                    //     }
                    // }
                    $scope.myImage='';
                    $scope.myCroppedImage='';
                    $scope.uplpadsuccess=function(){
                        console.log('上传成功')
                    }
                    $scope.randerFinish=function(){

                        var handleFileSelect=function(evt) {
                            var file=evt.currentTarget.files[0];
                            var reader = new FileReader();
                            reader.onload = function (evt) {
                                $scope.$apply(function($scope){
                                    $scope.myImage=evt.target.result;
                                });
                            };
                            reader.readAsDataURL(file);
                        };
                        angular.element($('#fileInput')).on('change',handleFileSelect);
                    }

                    $scope.uploaderFile = function () {
                        if(!$scope.myImage){
                            $scope.uploadImgTip='请选择要上传的图片!'
                            return;
                        }
                        var file = base64ToBlob($scope.myCroppedImage.replace('data:image/png;base64,',''), 'image/jpeg');
                        uploader.addToQueue(file);
                        uploader.uploadAll();
                    };

                }
            })
        }

        if($rootScope.hisRe.type=='passageRecord'){
            $scope.nowActivePanel='passageRecord';
            $rootScope.hisRe.type='';
        }

        if($rootScope.hisRe.type=='videoRecord'){
            $scope.nowActivePanel='videoRecord';
            $rootScope.hisRe.type='';
        }

        if($rootScope.hisRe.type=='collect'){
            $scope.nowActivePanel='collect';
            $rootScope.hisRe.type='';
        }
    }])
