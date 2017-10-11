angular.module('ympc.services', [])
    .service('userService', function () {
        //存储用户信息的全局变量
        var result = {
            userMsg: ''
        }
        return result;
    })
    //基本配置，上传图片
    .constant('config', {
        //后端url，先写成常量
        urlBase: baseUrl,
        //urlBase: 'http://101.201.61.194:8090/sxtx',
        //urlBase: 'http://123.56.87.160:8090/sxtx',
        //session 存储时间调整需要跟后台配合
        sessionCheckTime: 2400000,
        //selectizeSize 数量
        selectizeSize: 1,
        //图片上传大小上限
        imageSize: 524288,
        imageCount: 100,
        imageFilterType: '|jpg|png|jpeg|'
    })
    //手机号处理过滤器，传入手机号，传出138****3333类型的手机号
    .filter('ellipsisPhone', [function () {
        return function (val) {
            if (val) {
                var result = val.toString().substr(0, 3) + ' **** ' + val.toString().substr(7);
                return result;
            }
        }
    }])
