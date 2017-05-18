'use strict'
angular.module('app.info', [])
    .controller('appPassage', ['$scope', '$http', '$window','$location', function ($scope, $http, $window,$location) {
        $scope.panelPassageWidth = {
            height:document.body.clientHeight-100
        }
        window.onresize = function(){
            var realHeight=document.body.clientHeight;
            $scope.panelPassageWidth = {
                //left:((newValue.w < 1366 ? 1366:newValue.w)-1129)/2
                height:  realHeight- 100
            }
            $scope.$digest();
        }
        //获取轮播图
        $http({
            url: baseUrl + 'ym/show/list.api',
            method: 'POST'
        }).success(function (data) {
            if (data.result == 1) {
                //$scope.causeul=data;
                console.log(data);
            }
        }).error(function () {

        })

        //获取资讯列表
        $scope.passageList={
            list:[],
            count:0
        }
        $http({
            url: baseUrl + 'ym/news/list.api',
            method: 'POST',
            params: {
                pageNumber: 1,
                pageSize: 10
            }
        }).success(function (data) {
            if(data.result==1){
                $scope.passageList.list=$scope.passageList.list.concat(data.newsList);
                $scope.passageList.count=data.totalPage;
            }
        })

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
                $scope.passageRec.list=$scope.passageRec.list.concat(data.newsList);
                $scope.passageRec.count=data.totalPage;
            }
        })

        $scope.toDetailPage=function(val){
            $location.path('/detail/list/'+val.rootId+'/'+val.id);
        }
    }])
    .controller('passageDetail',['$rootScope','$scope','$location','$routeParams','$http','$sce','$window','userService',function($rootScope,$scope,$location,$routeParams,$http,$sce,$window,userService){

        $scope.passageId=$routeParams.id;

        $scope.PassageDetailWidth = {
            height:document.body.clientHeight-100
        }
        window.onresize = function(){
            var detailHeight=document.body.clientHeight;
            $scope.PassageDetailWidth = {
                //left:((newValue.w < 1366 ? 1366:newValue.w)-1129)/2
                height: detailHeight - 100
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
        $scope.getNewComments=function(){
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
            })
        }
        $scope.getNewComments();
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
                    $scope.getNewComments();
                }else{

                }
            })
        }
    }])
    .controller('videoList', ['$scope','$http', function ($scope,$http) {
        $scope.videoListWidth = {
            height:document.body.clientHeight-100,
            width:(document.body.clientWidth-480)<800?800:document.body.clientWidth-480
        }
        window.onresize = function(){
            var detailWidth=document.body.clientWidth;
            var detailHeight=document.body.clientHeight;
            $scope.videoListWidth = {
                height: detailHeight - 100,
                width:detailWidth-480<800?800:detailWidth-480
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
            if(data.result==1){
                $scope.categoryList=data.list;
                //初始化数据
                $scope.activeCategory.first=$scope.categoryList[0].id;
                $scope.secondCategoryList=$scope.categoryList[0].categoryList;

            }
        });

        //更改以及分类
        $scope.changeFirstCategory=function(value){
            $scope.activeCategory.first=value.id;
            $scope.secondCategoryList=value.categoryList;
        }

        //更改三级分类
        $scope.changeThirdCategory=function(val){
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
                console.log(res);
            })
        }

        function getVideoList(val){
            $http({
                url:baseUrl+'ym/album/list.api'
            })
        }

        //获取热门专辑推荐列表
        $scope.recVideoList=[];
        $http({
            url:baseUrl+'ym/album/list.api',
            method:'POST'
        }).success(function(res){
            console.log(res);
        })

    }])
