var myClient = angular.module('myClient', ['angle']);

myClient.run(["$rootScope", "$state", "$stateParams",  '$window', '$templateCache',"$log",'$resource',function ($rootScope, $state, $stateParams, $window, $templateCache,$log,$resource) {

    if (typeof($rootScope.$storage["token"])=="undefined"){
        $rootScope.isUserAuth = false; //是否鉴权成功
    }else{
        $rootScope.isUserAuth = true; //是否鉴权成功
    }
    $resource("server/db/db.json",{},{'query': {method: 'get', isArray: false}}).query(function(profile) {
        console.log(profile);
        $rootScope.tables = [];
        $rootScope.db_profile = profile;
        angular.forEach(profile, function(v) {
            $rootScope.tables.push(v["name"]);
        });
    });
}]);

myClient.config(['$stateProvider', '$locationProvider', '$urlRouterProvider', 'RouteHelpersProvider',
    function ($stateProvider, $locationProvider, $urlRouterProvider, helper) {
        /* specific routes here (see file config.js) */
        $locationProvider.html5Mode(false);
        // defaults to dashboard
        $urlRouterProvider.otherwise('/c/home');

        $stateProvider
            .state('client', {
                url: '/c',
                templateUrl: 'app/views/client/main.html',
                resolve: helper.resolveFor('modernizr', 'icons'),
                controller: ["$rootScope", function($rootScope) {
                    $rootScope.app.layout.isBoxed = false;
                }]
            })
            .state('client.home', {
                url: '/home',
                title: "home",
                templateUrl: 'app/views/client/home.html'
            })
            .state('client.cert', {
                url: '/cert',
                title: "cert",
                templateUrl: 'app/views/client/cert.html',
                resolve: helper.resolveFor('datatables','ui.select', 'taginput','inputmask','localytics.directives','ngDialog', 'filestyle','ngTable','ui-bootstrap'),
            })
            .state('client.apply', {
                url: '/apply',
                title: "apply",
                templateUrl: 'app/views/client/apply.html',
                resolve: helper.resolveFor('datatables','ui.select', 'taginput','inputmask','localytics.directives','ngDialog','angularFileUpload', 'filestyle','ngTable','ui-bootstrap'),
            })
            .state('client.about', {
                url: '/about',
                title: "about",
                templateUrl: 'app/views/client/about.html'
            })
    }]);

// 添加对应的 Interceptors
myClient.config(['$httpProvider', function($httpProvider){
    $httpProvider.interceptors.push(['$q', '$location','$localStorage',"$rootScope",function($q,$location,$localStorage,$rootScope){
        return{
            'request': function(config){
                config.headers=config.headers||{};
                if(typeof($rootScope.$storage["token"])!=="undefined"){
                    config.headers.Authorization='Bearer'+$rootScope.$storage["token"];
                }
                return config;
            },
            'responseError': function(response){
                if(response.status===401||response.status===403){
                    $rootScope.isUserAuth = false; //是否鉴权成功
                }
                return $q.reject(response);
            }
        };
    }
    ]);
}]);


myClient.controller('ClientController', ["$scope","$localStorage",'$state','$window',"$rootScope", function($scope,$localStorage,$state,$window,$rootScope) {
    /* controller code */
    console.log("ClientController");
    $scope.menuItems = [
        { name: "首页", url: "#/c/home" },
        { name: "认证查询", url: "#/c/cert" },
        { name: "考级报名", url: "#/c/apply" },
        { name: "关于协会", url: "#/c/about" }
    ];
    $scope.toggleCollapse = function (i) {
        $scope.active = i;
    }
}]);

myClient.controller('FileUploadController', ['$scope', 'FileUploader', function($scope, FileUploader) {
    var upload_state = "";
    $scope.upload_error = "";
    var uploader = $scope.uploader = new FileUploader({
        url: '/api/file/Apply' ,
        headers: {'authorization': 'emi', 'token': '123456'}
    });

    // FILTERS

    uploader.filters.push({
        name: 'customFilter',
        fn: function(item /*{File|FileLikeObject}*/, options) {
            return this.queue.length < 10;
        }
    });

    // CALLBACKS

    uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
        item["error"] = "";
        //console.info('onWhenAddingFileFailed', item, filter, options);
    };
    uploader.onAfterAddingFile = function(fileItem) {
        fileItem["error"] = "";
        //console.info('onAfterAddingFile', fileItem);
    };
    uploader.onAfterAddingAll = function(addedFileItems) {
        //console.info('onAfterAddingAll', addedFileItems);
    };
    uploader.onBeforeUploadItem = function(item) {
        item["error"] = "";
        //console.info('onBeforeUploadItem', item);
    };
    uploader.onProgressItem = function(fileItem, progress) {
        //console.info('onProgressItem', fileItem, progress);
    };
    uploader.onProgressAll = function(progress) {
        //console.info('onProgressAll', progress);
        upload_state = "正在上传..."
    };
    uploader.onSuccessItem = function(fileItem, response, status, headers) {
        //console.info('onSuccessItem', fileItem, response, status, headers);
        upload_state = "上传成功"
    };
    uploader.onErrorItem = function(fileItem, response, status, headers) {
        upload_state = fileItem.message;
        //console.info('onErrorItem', fileItem, response, status, headers);
    };
    uploader.onCancelItem = function(fileItem, response, status, headers) {
        //console.info('onCancelItem', fileItem, response, status, headers);
    };
    uploader.onCompleteItem = function(fileItem, response, status, headers) {
        //console.info('onCompleteItem', fileItem, response, status, headers);
    };
    uploader.onCompleteAll = function() {
        console.info('onCompleteAll');
    };

    //console.info('uploader', uploader);
}]);

myClient.controller('CreateValidationController', ["$scope",'$stateParams','$state','$resource','$http','ngDialog', function ($scope,$stateParams,$state,$resource,$http,ngDialog) {
    'use strict';
    $scope.submitted = false;
    $scope.disable_create_btn = false;
    var db_url = "/api/db/Apply";
    var table_url = "/server/db/Apply.json";
    $scope.table_profile = {
        db_url:db_url,
        attrs_map:{},//列表映射关系
        attrs:[], //记录列名
        cols: [], //列名
        fileters:[], //过滤
        fieldset:[], //编辑
        source: {}
    };
    $resource(table_url,{},{'query': {method: 'get', isArray: false}}).query(function(profile) {
        $scope.table_profile["source"] = profile;
        //表格列
        angular.forEach(profile["db_cols"], function(item) {
            //列名
            $scope.table_profile["attrs"].push(item["field"]);
            $scope.table_profile["attrs_map"][item["field"]] = $scope.table_profile["attrs"].length-1;
            //表格列
            if(item["show"]){
                $scope.table_profile["cols"].push({"field": item["field"],"title": item["title"],"sortable": item["field"],"show": true});
            }
            //表格列
            if(item["filter"]!="no"){
                $scope.table_profile["fileters"].push({"title":item["title"],"field":item["field"],"op":item["filter"]});
            }
            //编辑项
            $scope.table_profile["fieldset"].push(item);
        });
        var attrs = $scope.table_profile["attrs"];
        $scope.data = [];
        for(var i in attrs){
            $scope.data.push(null);
        }
        console.log($scope.table_profile["fieldset"]);
    });

    $scope.notBlackListed = function(value) {
        var blacklist = ['some@mail.com','another@email.com'];
        return blacklist.indexOf(value) === -1;
    };

    $scope.words = function(value) {
        return value && value.split(' ').length;
    };

    $scope.validateInput = function(name, type) {
        var input = $scope.formValidate[name];
        return (input.$dirty || $scope.submitted) && input.$error[type];
    };

    // Submit form
    $scope.submitForm = function() {
        $scope.submitted = true;
        $scope.disable_create_btn = true;
        var attrs = $scope.table_profile["attrs"];
        var submit_data = {};
        for(var i in attrs){
            console.log(attrs[i]);
            if(attrs[i]!="id"){
                submit_data[attrs[i]] = $scope.data[i];
            }
        }
        console.log(submit_data);
        if ($scope.formValidate.$valid) {
            console.log('Submitted!!');
            $http({
                method:'put',
                url:$scope.table_profile["db_url"],
                data:[submit_data]
            }).success(function(req){
                ngDialog.openConfirm({
                    template: 'confirmDialogId',
                    className: 'ngdialog-theme-default',
                    scope: $scope
                }).then(function (value) {
                    //ok
                    $state.go('client.apply');
                }, function (reason) {
                    //cancel
                    $state.go('client.apply');
                });
            }).error(function(req){
                ngDialog.openConfirm({
                    template: 'errorDialogId',
                    className: 'ngdialog-theme-default',
                    scope: $scope
                }).then(function (value) {
                    //ok
                    $scope.disable_create_btn = false;
                }, function (reason) {
                    //cancel
                    $scope.disable_create_btn = false;
                });
            });
        } else {
            console.log('Not valid!!');
            $scope.disable_create_btn = false;
            return false;
        }
    };

}]);

myClient.controller('queryCertController', ["$scope",'$stateParams','$state','$resource','$http','ngDialog', function ($scope,$stateParams,$state,$resource,$http,ngDialog) {
    'use strict';
    $scope.image_url = "";
    $scope.submitted = false;
    $scope.disable_create_btn = false;

    $scope.notBlackListed = function(value) {
        var blacklist = ['some@mail.com','another@email.com'];
        return blacklist.indexOf(value) === -1;
    };

    $scope.words = function(value) {
        return value && value.split(' ').length;
    };

    $scope.validateInput = function(name, type) {
        var input = $scope.formValidate[name];
        return (input.$dirty || $scope.submitted) && input.$error[type];
    };

// Submit form
    $scope.submitForm = function() {
        $scope.image_url = "";
        var conditions = {
            player_name:$scope.user_name,
            idcard:$scope.user_idcard
        }
        $scope.submitted = true;
        $scope.disable_create_btn = true;
        if ($scope.formValidate.$valid) {
            console.log('Submitted!!');
            $http({
                method:'post',
                url:"/cert",
                data:{
                    conditions:conditions
                }
            }).success(function(res){
                console.log(res);
                if(res.datas==null){
                    ngDialog.openConfirm({
                        template: 'confirmDialogId',
                        className: 'ngdialog-theme-default',
                        scope: $scope
                    }).then(function (value) {
                        //ok
                    }, function (reason) {
                        //cancel
                    });
                }else{
                    $scope.image_url = res.datas["cert_image"];
                }
            }).error(function(req){
                ngDialog.openConfirm({
                    template: 'errorDialogId',
                    className: 'ngdialog-theme-default',
                    scope: $scope
                }).then(function (value) {
                    //ok
                    $scope.disable_create_btn = false;
                }, function (reason) {
                    //cancel
                    $scope.disable_create_btn = false;
                });
            });
        } else {
            console.log('Not valid!!');
            $scope.disable_create_btn = false;
            return false;
        }
    };
}]);