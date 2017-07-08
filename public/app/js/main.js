/**
 * Created by chenqianfeng on 2017/6/17.
 */
// To run this code, edit file
// index.html or index.jade and change
// html data-ng-app attribute from
// angle to myAppName
// -----------------------------------

var myApp = angular.module('myAppName', ['angle']);

myApp.run(["$rootScope", "$state", "$stateParams",  '$window', '$templateCache',"$log", function ($rootScope, $state, $stateParams, $window, $templateCache,$log) {

    if (typeof($rootScope.$storage["token"])=="undefined"){
        $rootScope.isUserAuth = false; //是否鉴权成功
    }else{
        $rootScope.isUserAuth = true; //是否鉴权成功
    }
}]);

// 添加对应的 Interceptors
myApp.config(['$httpProvider', function($httpProvider){
    $httpProvider.interceptors.push(['$q', '$location','$localStorage',"$rootScope",function($q,$location,$localStorage,$rootScope){
        console.log('$httpProvider.interceptors')
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

myApp.config(["RouteHelpersProvider", function(RouteHelpersProvider) {

    // Custom Route definition

}]);

myApp.controller('oneOfMyOwnController', ["$scope", function($scope) {
    /* controller code */
}]);

myApp.directive('oneOfMyOwnDirectives', function() {
    /*directive code*/
});

myApp.controller('myDataTableController', ['$scope',"$rootScope", '$resource','ngDialog', 'DTOptionsBuilder', 'DTColumnDefBuilder','$stateParams','$state','$http',
    function($scope, $rootScope, $resource, ngDialog,DTOptionsBuilder, DTColumnDefBuilder,$stateParams,$state,$http) {
        'use strict';

        // Ajax
        $scope.confirmValue = '';
        $scope.action = $stateParams.action;
        if (typeof  $scope.action == 'undefined'){
            $scope.action = 'list'
        }
        $resource('/api/db/cert').query().$promise.then(function(data_set) {
            $scope.data_set = data_set;
        });

        $scope.dtOptions = DTOptionsBuilder.newOptions().withPaginationType('full_numbers');
        $scope.dtColumnDefs = [
            DTColumnDefBuilder.newColumnDef(0),
            DTColumnDefBuilder.newColumnDef(1),
            DTColumnDefBuilder.newColumnDef(2),
            DTColumnDefBuilder.newColumnDef(3).notSortable()
        ];
        $scope.addPerson = addPerson;
        $scope.modifyPerson = modifyPerson;
        $scope.back_to_list = back_to_list;

        function addPerson() {
            $state.go('app.table-list-'+$stateParams.name,{id:index,action:'create'});
        }
        function modifyPerson(index) {
            $state.go('app.table-list-'+$stateParams.name,{id:index,action:'update'});
        }
        $scope.removePerson = function removePerson(index,name) {
            console.log("removePerson:"+index)
            $scope.confirmValue = name;
            ngDialog.openConfirm({
                template: 'confirmDialogId',
                className: 'ngdialog-theme-default',
                scope: $scope
            }).then(function (value) {
                //ok
                $http({
                    method:'delete',
                    url:'/api/db/cert/'+ index
                }).success(function(req){
                    //重新加载
                    $resource('/api/db/cert').query().$promise.then(function(data_set) {
                        $scope.data_set = data_set;
                    });
                });
                console.log('Modal promise resolved. Value: ', value);
            }, function (reason) {
                //cancel
                console.log('Modal promise rejected. Reason: ', reason);
            });
        }

        function back_to_list(){
            $state.go('app.table-list-'+$stateParams.name,{action:'list'});
        }

        $scope.upload = function(){
            $state.go('app.table-list-'+$stateParams.name,{action:'upload'});
        }

    }]);


myApp.controller('FileUploadController', ['$scope', 'FileUploader', function($scope, FileUploader) {

    var uploader = $scope.uploader = new FileUploader({
        url: '/api/file',
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
        console.info('onWhenAddingFileFailed', item, filter, options);
    };
    uploader.onAfterAddingFile = function(fileItem) {
        console.info('onAfterAddingFile', fileItem);
    };
    uploader.onAfterAddingAll = function(addedFileItems) {
        console.info('onAfterAddingAll', addedFileItems);
    };
    uploader.onBeforeUploadItem = function(item) {
        console.info('onBeforeUploadItem', item);
    };
    uploader.onProgressItem = function(fileItem, progress) {
        console.info('onProgressItem', fileItem, progress);
    };
    uploader.onProgressAll = function(progress) {
        console.info('onProgressAll', progress);
    };
    uploader.onSuccessItem = function(fileItem, response, status, headers) {
        console.info('onSuccessItem', fileItem, response, status, headers);
    };
    uploader.onErrorItem = function(fileItem, response, status, headers) {
        console.info('onErrorItem', fileItem, response, status, headers);
    };
    uploader.onCancelItem = function(fileItem, response, status, headers) {
        console.info('onCancelItem', fileItem, response, status, headers);
    };
    uploader.onCompleteItem = function(fileItem, response, status, headers) {
        console.info('onCompleteItem', fileItem, response, status, headers);
    };
    uploader.onCompleteAll = function() {
        console.info('onCompleteAll');
    };

    console.info('uploader', uploader);
}]);

myApp.controller('FormValidationController', ["$scope",'$stateParams','$state','$resource','$http', function ($scope,$stateParams,$state,$resource,$http) {
    'use strict';
    $scope.data = "";
    $resource('/api/db/cert/'+$stateParams.id).query().$promise.then(function(data_set) {
        var attrs = ["id","player_name","exam_type","exam_time","cert_time","sex","tel","cert_id","idcard","exam_type","exam_level"];
        console.log("FormValidationController:"+data_set.length);
        $scope.player_name = "test"
        if (data_set.length>0){
            $scope.data = data_set[0];
        }
    });

    $scope.notBlackListed = function(value) {
        var blacklist = ['some@mail.com','another@email.com'];
        return blacklist.indexOf(value) === -1;
    };

    $scope.words = function(value) {
        return value && value.split(' ').length;
    };

    $scope.submitted = false;
    $scope.validateInput = function(name, type) {
        var input = $scope.formValidate[name];
        return (input.$dirty || $scope.submitted) && input.$error[type];
    };

    // Submit form
    $scope.submitForm = function() {
        $scope.submitted = true;
        if ($scope.formValidate.$valid) {
            console.log('Submitted!!');
            $http({
                method:'post',
                url:'/api/db/cert',
                data:$scope.data
            }).success(function(req){
                console.log(req);
            });
        } else {
            console.log('Not valid!!');
            return false;
        }
    };

}]);

myApp.config(['$stateProvider', '$locationProvider', '$urlRouterProvider', 'RouteHelpersProvider',
    function ($stateProvider, $locationProvider, $urlRouterProvider, helper) {
        /* specific routes here (see file config.js) */
        var tables = ['coach' ,'player', 'news-3'];
        angular.forEach(tables, function(v) {
            $stateProvider
                .state('app.table-list-' + v, {
                    url: '/table/' + v + '?id&action',
                    title: 'Table Datatable',
                    templateUrl: helper.basepath('qfc-table.html'),
                    resolve: helper.resolveFor('datatables','ui.select', 'taginput','inputmask','localytics.directives','ngDialog','angularFileUpload', 'filestyle','ng-file-upload'),
                    params: {
                        action: { value: 'list'},
                        name: { value: v}
                    }
                })
                .state('app.table-create-' + v, {
                    url: '/table/' + v + '/create',
                    title: 'Table Datatable create',
                    templateUrl: helper.basepath('qfc-table-update.html'),
                    resolve: helper.resolveFor('angularFileUpload', 'filestyle'),
                    params: {
                        id: { value: null}
                    }
                })
                .state('app.table-retrieve-' + v, {
                    url: '/table/' + v + '/retrieve/{id}',
                    title: 'Table Datatable retrieve',
                    templateUrl: helper.basepath('qfc-table-update.html'),
                    resolve: helper.resolveFor('angularFileUpload', 'filestyle')
                })
                .state('app.table-update-' + v, {
                    url: '/table/' + v + '/update/{id}',
                    title: 'Table Datatable update',
                    templateUrl: helper.basepath('qfc-table-update.html'),
                    resolve: helper.resolveFor('angularFileUpload', 'filestyle')
                })
                .state('app.table-delete-' + v, {
                    url: '/table/' + v + '/delete/{id}',
                    title: 'Table Datatable delete',
                    templateUrl: helper.basepath('qfc-table-update.html'),
                    resolve: helper.resolveFor('angularFileUpload', 'filestyle')
                })
                .state('app.table-upload-' + v, {
                    url: '/table/' + v + '/upload',
                    title: 'Table Datatable upload',
                    templateUrl: helper.basepath('qfc-table-upload.html'),
                    resolve: helper.resolveFor('angularFileUpload', 'filestyle')
                })
        });
    }]);