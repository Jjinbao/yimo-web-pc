'use strict'
angular.module('app.info', [])
    .controller('appPassage', ['$scope', '$http', '$window','$location', function ($scope, $http, $window,$location) {
        $scope.panelPassageWidth = {
            height:document.body.clientHeight-100
        }
        window.onresize = function(){
            var realHeight=document.body.clientHeight;
            console.log(realHeight);
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
            console.log(data);
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
            console.log(data);
            if(data.result==1){
                $scope.passageRec.list=$scope.passageRec.list.concat(data.newsList);
                $scope.passageRec.count=data.totalPage;
            }
        })

        $scope.toDetailPage=function(val){
            $location.path('/detail/list/'+val.rootId+'/'+val.id);
        }

        $('#contain').on('scroll',function(){
            // console.log('滚动了滚动了------');
            // console.log($('#contain').scrollTop());
            // console.log($scope.getWindowDimensions().h-100);
            // console.log($('#passagelist').height());
            // console.log($('#passagelist').height()-$scope.getWindowDimensions().h+100);
            // if ($('#contain').scrollTop() >= $('#passagelist').height()-$scope.getWindowDimensions().h+50) {
                // 滚动到底部了
                // alert('滚动到底部了');
            // }
        });
    }])
    .controller('passageDetail',['$rootScope','$scope','$location','$routeParams','$http','$sce','$window','userService',function($rootScope,$scope,$location,$routeParams,$http,$sce,$window,userService){
        console.log($routeParams.rootId);
        console.log($routeParams.id);
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
            console.log(res);
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
        $http({
            url:baseUrl+'ym/comment/list.api',
            method:'POST',
            params:{
                categoryRootId:$routeParams.rootId,
                categoryItemId:$routeParams.id
            }
        }).success(function(res){
            console.log(res);
            if(res.result==1){
                if(res.comments.length>0){
                    res.comments.forEach(function(val){
                        val.pushTime=new Date(val.createTime*1000).format('yyyy-MM-dd');
                    })
                }
                $scope.userComment.list=$scope.userComment.list.concat(res.comments);
                $scope.userComment.total=res.totalPage;
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
            console.log(data);
            if(data.result==1){
                $scope.passageRec.list=$scope.passageRec.list.concat(data.newsList);
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
        $scope.toSubmitComment=function(){

        }
    }])
    .controller('videoList', ['$scope', function ($scope) {
        console.log('视频列表');
    }])
