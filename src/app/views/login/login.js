angular.module('app.login', [])
    .controller('appLogin', ['$scope', '$http', '$location', function ($scope, $http, $location) {
        $scope.user = {
            name: '',
            password: ''
        }
        $scope.loginTip = ''
        $scope.login = function () {
            $http({
                method: 'post',
                url: 'http://192.168.101.4/users/login',
                data: {name: $scope.user.name, password: $scope.user.password}
            }).success(function (res) {
                if (res.code == 10000) {
                    $location.path('/home');
                } else {
                    $scope.loginTip = '用户名或密码错误'
                }
            }).error(function (err) {

            })
        }

        function keyUp(e) {
            var keycode = window.event ? e.keyCode : e.which;
            if (keycode == 13) {
                if ($scope.user.name && $scope.user.password) {
                    $scope.login();
                } else if (!$scope.name) {

                }
            }
        }
        document.onkeyup = keyUp;
    }])
    .controller('appRegister', ['$scope', function ($scope) {
        console.log('register');
    }])