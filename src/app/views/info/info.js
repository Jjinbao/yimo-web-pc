'use strict'
angular.module('app.info', [])
    .controller('appPassage', ['$rootScope','$scope', '$http', '$window','$location', function ($rootScope,$scope, $http, $window,$location) {
        $rootScope.hisRe.type='';
        $scope.panelPassageWidth = {
            width:document.body.clientWidth-279
        }
        $scope.panelPassageHeight = {
            height:document.body.clientHeight-60
        }
        window.onresize = function(){
            var realWidth=document.body.clientWidth;
            var realHeight=document.body.clientHeight;
            $scope.panelPassageWidth = {
                //left:((newValue.w < 1366 ? 1366:newValue.w)-1129)/2
                width:realWidth- 279
            }
            $scope.panelPassageHeight = {
                height:realHeight-60
            }
            $scope.$digest();
        }
        //获取轮播图
        //$http({
        //    url: baseUrl + 'ym/show/list.api',
        //    method: 'POST'
        //}).success(function (data) {
        //    if (data.result == 1) {
        //        //$scope.causeul=data;
        //        console.log(data);
        //    }
        //}).error(function () {
        //
        //})

        //获取资讯列表
        $scope.passageList={
            list:[],
            count:0
        }
        $scope.isNetConnect=false;
        $scope.holdListDoubleClick=false;
        $scope.getNewsList=function(){
            if($scope.holdListDoubleClick){
                return;
            }
            $scope.holdListDoubleClick=true;
            $http({
                url: baseUrl + 'ym/news/list.api',
                method: 'POST',
                params: {
                    pageNumber: 1,
                    pageSize: 10
                }
            }).success(function (data) {
                console.log(data);
                $scope.holdListDoubleClick=false;
                $scope.isNetConnect=false;
                if(data.result==1){
                    $scope.passageList.list=$scope.passageList.list.concat(data.newsList);
                    $scope.passageList.count=data.totalPage;
                }
                $scope.passageList.list.forEach(function(val){
                    val.formateDate=new Date(val.pubTime*1000).format('yyyy-MM-dd');
                })
            }).error(function(data){
                $scope.holdListDoubleClick=false;
                $scope.isNetConnect=true;
            })
        }
        $scope.getNewsList();

        //获取文章推荐列表
        $scope.passageRec={
            list:[],
            count:0
        }

        $scope.holdNewRecDouble=false;
        $scope.getRecNews=function(){
            if($scope.holdNewRecDouble){
                return;
            }
            $scope.holdNewRecDouble=true;
            $http({
                url: baseUrl + 'ym/news/list.api',
                method: 'POST',
                params: {
                    pageNumber: 1,
                    pageSize: 10,
                    extstr2:1
                }
            }).success(function (data) {
                $scope.isNetConnect=false;
                $scope.holdNewRecDouble=false;
                console.log(data);
                if(data.result==1){
                    $scope.passageRec.list=$scope.passageRec.list.concat(data.newsList);
                    $scope.passageRec.count=data.totalPage;
                }

            }).error(function(){
                $scope.holdNewRecDouble=false;
            })
        }

        $scope.getRecNews();

        $scope.reGetData=function(){
            $scope.getNewsList();
            $scope.getRecNews();
        }

        $scope.toDetailPage=function(val){
            $location.path('/detail/list/'+val.rootId+'/'+val.id);
        }
    }])
    .controller('passageDetail',['$rootScope','$scope','$location','$routeParams','$http','$sce','$window','userService',function($rootScope,$scope,$location,$routeParams,$http,$sce,$window,userService){
        $rootScope.hisRe.type='';
        $scope.passageId=$routeParams.id;

        if(userService.userMsg.accountId){
            console.log('ymy' + userService.userMsg.accountId + 'news'+$scope.passageId);
            $http({
                url:baseUrl+'ym/history/add.api',
                method:'POST',
                params:{
                    accountId:userService.userMsg.accountId,
                    type:'news',
                    typeId:$scope.passageId,
                    sign:md5('ymy' + userService.userMsg.accountId + 'news'+$scope.passageId)
                }
            }).success(function(data){
                console.log(data);
            })
        }


        $scope.PassageDetailWidth = {
            width:document.body.clientWidth-279
        }
        $scope.PassageDetailHeight = {
            height:document.body.clientHeight-60
        }
        window.onresize = function(){
            var detailWidth=document.body.clientWidth;
            var detailHeight=document.body.clientHeight;
            $scope.PassageDetailWidth = {
                //left:((newValue.w < 1366 ? 1366:newValue.w)-1129)/2
                width: detailWidth - 279
            }
            $scope.PassageDetailHeight = {
                height:detailHeight-60
            }
            $scope.$digest();
        }
        $http({
            url:baseUrl+'ym/news/field.api',
            method:'POST',
            params:{
                id:$routeParams.id
            }
        }).success(function(res){
            if(res.result==1){
                $scope.detailMsg=res;
                $scope.detailMsg.detail=$sce.trustAsHtml(res.text);
                $scope.detailMsg.formateDate=new Date(res.pubTime*1000).format('yyyy-MM-dd');
            }
        })

        //获取评论列表
        $scope.userComment={
            list:[],
            total:0
        }
        //获取评论参数
        var getCommentParams={
            categoryRootId:$routeParams.rootId,
            categoryItemId:$routeParams.id,
            pageNumber:1,
            pageSize:10
        }
        $scope.getNewComments=function(){
            getCommentParams.pageNumber=$scope.paginationConf.currentPage;
            $http({
                url:baseUrl+'ym/comment/list.api',
                method:'POST',
                params:getCommentParams
            }).success(function(res){
                //console.log(res);
                if(res.result==1){
                    $scope.paginationConf.totalItems=res.totalPage*10;
                    //$scope.paginationConf.currentPage=1;
                    if(res.comments.length>0){
                        res.comments.forEach(function(val){
                            val.pushTime=new Date(val.createTime*1000).format('yyyy-MM-dd');
                        })
                    }
                    $scope.userComment.list=res.comments;
                    $scope.userComment.total=res.totalPage;
                }
            })
        }
        //分页配置
        $scope.paginationConf = {
            itemsPerPage: 10,
            totalItems: -1, //设置一个初始总条数，判断加载状态
            onChange: function () {
                // console.log($scope.paginationConf.currentPage);
                // getCommentParams.pageNumber=$scope.paginationConf.currentPage;
                $scope.getNewComments();
            }
        };
        //$scope.getNewComments();
        //获取文章推荐列表
        $scope.passageRec={
            list:[],
            count:0
        }
        $http({
            url: baseUrl + 'ym/news/list.api',
            method: 'POST',
            params: {
                pageNumber: 1,
                pageSize: 10,
                extstr2:1
            }
        }).success(function (data) {

            if(data.result==1){
                $scope.passageRec.list=data.newsList;
                $scope.passageRec.count=data.totalPage;
            }
        })

        $scope.backToPre=function(){
            window.history.back();
        }
        $scope.submitComment=function(){
            if(userService.userMsg&&userService.userMsg.accountId){
                $scope.toSubmitComment();
            }else{
                $rootScope.login('comment',function(){
                    $scope.$emit('user.nav.img', userService.userMsg.smallImg);
                    $scope.toSubmitComment();
                });
            }
        }
        //去提交评论
        $scope.commentContent='';
        $scope.toSubmitComment=function(){
            if(!$scope.commentContent){
                $rootScope.successAlter('请填写评论！');
                return;
            }
            $http({
                url:baseUrl+'ym/comment/add.api',
                method:'POST',
                params:{
                    uid:userService.userMsg.accountId,
                    categoryRootId:9,
                    categoryItemId:$routeParams.id,
                    content:encodeURI($scope.commentContent),
                    device:'pc'
                }
            }).success(function(data){
                if(data.result==1){
                    $scope.commentContent='';
                    $rootScope.successAlter('评论成功！');
                    $scope.paginationConf.currentPage=getCommentParams.pageNumber=1;
                    $scope.getNewComments();
                }else{

                }
            })
        }

        $scope.toInfoDetail=function(val){
            $location.path('/detail/list/'+val.rootId+'/'+val.id);
            console.log(val);
        }

        $scope.backToList=function(){
            if($routeParams.from=='history'){
                $rootScope.hisRe.type='passageRecord';
            };
            window.history.back();
        }


    }])
    .controller('videoList', ['$rootScope','$scope','$http','$location', function ($rootScope,$scope,$http,$location) {
        $rootScope.hisRe.type='';
        $scope.videoListWidth = {
            height:document.body.clientHeight-60,
            width:(document.body.clientWidth-545)<800?800:document.body.clientWidth-545
        }
        window.onresize = function(){
            var detailWidth=document.body.clientWidth;
            var detailHeight=document.body.clientHeight;
            $scope.videoListWidth = {
                height: detailHeight - 60,
                width:detailWidth-545<800?800:detailWidth-545
            }
            $scope.$digest();
        }

        //获取视频分类列表
        $scope.categoryList=[];
        //二级分类和三级分类
        $scope.secondCategoryList='';
        $scope.activeCategory={
            first:'',
            second:'',
            third:''
        }

        $http({
            url:baseUrl+'ym/category/list.api',
            method:'POST'
        }).success(function(data){
            console.log(data);
            if(data.result==1){
                window.localStorage.setItem('category',JSON.stringify(data.list));
                $scope.categoryList=data.list;
                //初始化数据
                $scope.activeCategory.first=$scope.categoryList[0].id;
                $scope.secondCategoryList=$scope.categoryList[0].categoryList;

            }
        }).error(function(){
            $scope.categoryList=JSON.parse(window.localStorage.getItem('category'));
            //初始化数据
            $scope.activeCategory.first=$scope.categoryList[0].id;
            $scope.secondCategoryList=$scope.categoryList[0].categoryList;
            //console.log(window.localStorage.getItem('category'));
        });



        //更改以及分类
        $scope.changeFirstCategory=function(value){
            $scope.activeCategory.first=value.id;
            $scope.secondCategoryList=value.categoryList;
        }

        //更改三级分类
        $scope.thirdCategoryId='';
        $scope.changeThirdCategory=function(val){
            $scope.thirdCategoryId=val.categoryId;
            console.log(val);
            $http({
                url:baseUrl+'ym/album/list.api',
                method:'POST',
                params:{
                    rootId:val.rootId,
                    catIdLev2:val.parentId,
                    catIdLev3:val.categoryId
                }
            }).success(function(res){
                $scope.albumList=res.albumList;
            })
        }

        function getVideoList(val){
            $http({
                url:baseUrl+'ym/album/list.api'
            })
        }

        //获取热门专辑推荐列表
        $scope.albumList=[];
        $scope.recVideoList=[];

        $scope.isNetBreak=false;
        $scope.holdDoubleClick=false;
        $scope.getAllAlbum=function(){
            if($scope.holdDoubleClick){
                return;
            }
            $scope.thirdCategoryId='';
            $scope.holdDoubleClick=true;
            $http({
                url:baseUrl+'ym/album/list.api',
                method:'POST'
            }).success(function(res){
                $scope.holdDoubleClick=false;
                $scope.isNetBreak=false;
                console.log(res);
                if(res.result==1){
                    $scope.albumList=res.albumList;
                }


            }).error(function(){
                $scope.holdDoubleClick=false;
                $scope.isNetBreak=true;
            })
        }
        $scope.getAllAlbum();

        $scope.toAlbumDetail=function(val){
            $location.path('/album/list/1/'+val.id);
        }

        //搜索框
        $scope.searchInfo='';
        $scope.doubleHold=false;
        $scope.searchVideo=function(){
            if(!$scope.searchInfo){
                return;
            }
            if($scope.doubleHold){
                return;
            }
            $scope.thirdCategoryId='a';
            $scope.doubleHold=true;
            $http({
                url: baseUrl + 'ym/album/list.api',
                method: 'POST',
                params:{
                    albumTitle:encodeURI($scope.searchInfo)
                }
            }).success(function (res) {
                console.log(res);
                if (res.result == 1) {
                    $scope.albumList = res.albumList;
                }
                $scope.doubleHold=false;
            })
        }

    }])
    .controller('albumDetail',['$rootScope','$scope','$routeParams','$http','userService','$sce',function($rootScope,$scope,$routeParams,$http,userService,$sce){
        $rootScope.hisRe.type='';
        $scope.albumListHeight = {
            height:document.body.clientHeight-60
        }
        $scope.albumDetailHeight={

        }
        $scope.albumVideoContainer = {
            height: document.body.clientHeight - 60,
            width:document.body.clientWidth - 537
        }
        window.onresize = function(){
            var detailWidth=document.body.clientWidth;
            var detailHeight=document.body.clientHeight;
            $scope.albumListHeight = {
                height: detailHeight - 60
            }
            $scope.albumVideoContainer = {
                height: detailHeight - 60,
                width:detailWidth - 537
            }
            $scope.$digest();
        }

        var myVideo=document.getElementById('detailVideo');
        //记录历史记录
        if(userService.userMsg.accountId){
            $http({
                url:baseUrl+'ym/history/add.api',
                method:'POST',
                params:{
                    accountId:userService.userMsg.accountId,
                    type:'album',
                    typeId:$routeParams.id,
                    sign:md5('ymy' + userService.userMsg.accountId + 'album'+$routeParams.id)
                }
            }).success(function(data){
                console.log(data);
            })
        }
        $scope.albumDetail;
        $http({
            url:baseUrl+'ym/album/field.api',
            method:'POST',
            params:{
                id:$routeParams.id
            }
        }).success(function(res){
            $scope.albumDetail=res;
            getAlbumList(res.id);

        })
        $scope.videoList={
            nowActiveVideo:'',
            nowActiveVideoId:'',
            list:[]
        };
        function getAlbumList(val){
            $http({
                url:baseUrl+'ym/teach/list.api',
                method:'POST',
                params:{
                    albumId:val,
                    categoryId:1,
                    pageNumber:1,
                    pageSize:10
                }
            }).success(function(res){
                if(res.result==1){
                    $scope.videoList.list=res.teachList;
                    if(res.teachList[0]&&res.teachList[0].videoSrc){
                        $scope.videoList.nowActiveVideo=res.teachList[0].videoSrc;
                        $scope.videoList.nowActiveVideoId=res.teachList[0].id;
                    }

                }
            })
        }
        $scope.changeActiveVideo=function(val){
            $scope.videoList.nowActiveVideo=val.videoSrc;
            $scope.videoList.nowActiveVideoId=val.id;
        }
        $scope.trustUrl=function(value){
            return $sce.trustAsResourceUrl(value);
        }
        $scope.$on('$ionicView.beforeEnter', function(){

        });
        myVideo.addEventListener('ended',function(){
            for(var i=0;i<$scope.videoList.list.length;i++){
                if($scope.videoList.nowActiveVideoId==$scope.videoList.list[i].id){
                    break;
                }
            }
            console.log(i);
            if($scope.videoList.list.length>(i+1)){
                console.log('345');
                $scope.changeActiveVideo($scope.videoList.list[i+1]);
                $scope.$digest();
                //$scope.videoList.nowActiveVideoId=$scope.videoList.list[i+1].id;
                //$scope.videoList.nowActiveVideo=$scope.videoList.list[i+1].videoSrc;
            }
        })

        /*myVideo.addEventListener('play',function(){
            console.log('开始播放');
            //screen.orientation.lock('landscape');
        })
        document.addEventListener('webkitfullscreenchange',function(e){
            screen.orientation.lock('landscape');
            console.log('1full screen');
        })
        document.addEventListener('mozfullscreenchange ',function(e){
            screen.orientation.lock('landscape');
            console.log('2full screen');
        })
        document.addEventListener('fullscreenchange',function(e){
            screen.orientation.lock('landscape');
            console.log('3full screen');
        })*/
        $scope.goBackToList=function(){
            if($routeParams.from=='history'){
                $rootScope.hisRe.type='videoRecord';
            };
            window.history.back();
        }

        $scope.toSubmitComment=function(){

        }
        //获取评论列表
        $scope.userComment={
            list:[],
            total:0
        }
        $scope.getVideoComents=function(){
            $http({
                url:baseUrl+'ym/comment/list.api',
                method:'POST',
                params:{
                    categoryRootId:$routeParams.rootId,
                    categoryItemId:$routeParams.id
                }
            }).success(function(res){

                if(res.result==1){
                    if(res.comments.length>0){
                        res.comments.forEach(function(val){
                            val.pushTime=new Date(val.createTime*1000).format('yyyy-MM-dd');
                        })
                    }
                    $scope.userComment.list=res.comments;
                    $scope.userComment.total=res.totalPage;
                }
            }).error(function(){

            })
        }
        $scope.getVideoComents();


        $scope.submitComment=function(){
            if(userService.userMsg&&userService.userMsg.accountId){
                $scope.toSubmitComment();
            }else{
                $rootScope.login('comment',function(){
                    $scope.$emit('user.nav.img', userService.userMsg.smallImg);
                    $scope.toSubmitComment();
                });
            }
        }
        //去提交评论
        $scope.commentContent='';
        $scope.holdDoubleClick=false;
        $scope.toSubmitComment=function(){
            if($scope.holdDoubleClick){
                return;
            }
            if(!$scope.commentContent){
                $rootScope.successAlter('请填写评论！');
                return;
            }
            $scope.holdDoubleClick=true;
            $http({
                url:baseUrl+'ym/comment/add.api',
                method:'POST',
                params:{
                    uid:userService.userMsg.accountId,
                    categoryRootId:1,
                    categoryItemId:$routeParams.id,
                    content:encodeURI($scope.commentContent),
                    device:'pc'
                }
            }).success(function(data){
                if(data.result==1){
                    $scope.commentContent='';
                    $rootScope.successAlter('评论成功！');
                    $scope.getVideoComents();
                }else{

                }
                $scope.holdDoubleClick=false;
            }).error(function(data){
                $scope.holdDoubleClick=false;
            })
        }
    }])
