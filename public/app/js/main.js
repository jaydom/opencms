/**
 * Created by chenqianfeng on 2017/6/17.
 */
// To run this code, edit file
// index.html or index.jade and change
// html data-ng-app attribute from
// angle to myAppName
// -----------------------------------

var myApp = angular.module('myAppName', ['angle']);

myApp.config(['$stateProvider', '$locationProvider', '$urlRouterProvider', 'RouteHelpersProvider',
    function ($stateProvider, $locationProvider, $urlRouterProvider, helper) {
        /* specific routes here (see file config.js) */
        var tables = ["Certificate","User","Club","Coach","Leader","Apply","Game","Referee","RefereeCert","RefereeGroup","RefereeRecord"];
        angular.forEach(tables, function(v) {
            $stateProvider
                .state('app.table-list-' + v, {
                    url: '/table/' + v + '?id&action',
                    title: 'Table Datatable',
                    templateUrl: helper.basepath('qfc-table.html'),
                    controller: 'myDataTableController',
                    resolve: helper.resolveFor('datatables','ui.select', 'taginput','inputmask','localytics.directives','ngDialog','angularFileUpload', 'filestyle','ngTable','ui-bootstrap'),
                    params: {
                        action: { value: 'list'},
                        name: { value: v}
                    }
                })
        });
    }]);

// 添加对应的 Interceptors
myApp.config(['$httpProvider', function($httpProvider){
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

myApp.config(["RouteHelpersProvider", function(RouteHelpersProvider) {

    // Custom Route definition

}]);

myApp.run(["$rootScope", "$state", "$stateParams",  '$window', '$templateCache',"$log",'$resource',function ($rootScope, $state, $stateParams, $window, $templateCache,$log,$resource) {

    if (typeof($rootScope.$storage["token"])=="undefined"){
        $rootScope.isUserAuth = false; //是否鉴权成功
    }else{
        $rootScope.isUserAuth = true; //是否鉴权成功
    }
    $resource("server/db/db.json",{},{'query': {method: 'get', isArray: false}}).query(function(profile) {
        $rootScope.tables = {};
        $rootScope.db_profile = profile;
        angular.forEach(profile["tables"], function(v) {
            var table_name = v["name"];
            $rootScope.tables[table_name] = v;
        });
    });
}]);

myApp.controller('TopbarController', ["$scope","$localStorage",'$state','$window',"$rootScope", function($scope,$localStorage,$state,$window,$rootScope) {
    /* controller code */
    $scope.logout = function(){
        delete $rootScope.$storage["token"];
        $state.go('page.login');
    };
}]);

myApp.directive('oneOfMyOwnDirectives', function() {
    /*directive code*/
});

//数据表主控制器
myApp.controller('myDataTableController', ['$scope',"$rootScope", '$resource','ngDialog', 'DTOptionsBuilder', 'DTColumnDefBuilder','$stateParams','$state','$http',
    function($scope, $rootScope, $resource, ngDialog,DTOptionsBuilder, DTColumnDefBuilder,$stateParams,$state,$http) {
        'use strict';
        //数据表表配置，根据原始转换
        $scope.hasFilterBtn = $rootScope.tables[$stateParams.name]["operate"]["filter"];
        $scope.hasCreateBtn = $rootScope.tables[$stateParams.name]["operate"]["create"];
        $scope.hasDeleteBtn = $rootScope.tables[$stateParams.name]["operate"]["delete"];
        $scope.hasUploadBtn = $rootScope.tables[$stateParams.name]["operate"]["upload"];
        $scope.table_title = $rootScope.tables[$stateParams.name]["title"];
        $scope.table_name = $stateParams.name;
        var db_url = "/api/db/" + $stateParams.name
        var table_url = "/server/db/"+$stateParams.name+ ".json";
        $scope.table_profile = {
            db_url:db_url,
            create_url:db_url,
            update_url:db_url,
            delete_url:db_url,
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
            $scope.table_profile["cols"].push({ "field": "selector", "title": "", "headerTemplateURL": "headerCheckbox.html", "show": true });
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
                //多对多关系
                if(item["component"]=="array"){
                    $scope.table_profile["create_url"]=$scope.table_profile["db_url"]+"/group/"+item["map_table"];
                    $scope.table_profile["update_url"]=$scope.table_profile["db_url"]+"/group/"+item["map_table"];
                    $scope.table_profile["delete_url"]=$scope.table_profile["db_url"]+"/group/"+item["map_table"];
                }
                //编辑项
                $scope.table_profile["fieldset"].push(item);
            });
            //表格列
            $scope.table_profile["cols"].push({ "field": "operation","title": "操作","show": true });

            // Ajax
            $scope.action = $stateParams.action;
            if (typeof  $scope.action == 'undefined'){
                $scope.action = 'list'
            }
        });

        $scope.to_list_page = function(){
            $state.go('app.table-list-'+$stateParams.name,{action:'list'});
        }

        $scope.to_create_page = function(){
            $state.go('app.table-list-'+$stateParams.name,{action:'create'});
        }

        $scope.to_upload_page = function(){
            $state.go('app.table-list-'+$stateParams.name,{action:'upload'});
        }

        $scope.to_update_page = function(index){
            $state.go('app.table-list-'+$stateParams.name,{id:index,action:'update'});
        }

        $scope.to_create_group_page = function(){
            $state.go('app.table-list-'+$stateParams.name,{action:'create_group'});
        }
    }]);


myApp.controller('FileUploadController', ['$scope', 'FileUploader', function($scope, FileUploader) {
    $scope.upload_error = "";
    var uploader = $scope.uploader = new FileUploader({
        url: '/api/file/'+$scope.table_name ,
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
    };
    uploader.onSuccessItem = function(fileItem, response, status, headers) {
        //console.info('onSuccessItem', fileItem, response, status, headers);
    };
    uploader.onErrorItem = function(fileItem, response, status, headers) {
        fileItem["error"] = response.message;
        //console.info('onErrorItem', fileItem, response, status, headers);
    };
    uploader.onCancelItem = function(fileItem, response, status, headers) {
        //console.info('onCancelItem', fileItem, response, status, headers);
    };
    uploader.onCompleteItem = function(fileItem, response, status, headers) {
        //console.info('onCompleteItem', fileItem, response, status, headers);
    };
    uploader.onCompleteAll = function() {
        //onsole.info('onCompleteAll');
    };

    //console.info('uploader', uploader);
}]);

myApp.controller('FormValidationController', ["$scope",'$stateParams','$state','$resource','$http','ngDialog', function ($scope,$stateParams,$state,$resource,$http,ngDialog) {
    'use strict';
    $scope.data = "";
    $scope.disable_create_btn = false;
    var attrs = $scope.table_profile["attrs"];
    $scope.pre_handlers = [];
    $resource($scope.table_profile["db_url"]+'/'+$stateParams.id).query().$promise.then(function(data_set) {
        if (data_set.length>0){
            $scope.data = [];
            for(var i in attrs){
                $scope.data.push(data_set[0][attrs[i]]);
            }
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
        $scope.disable_create_btn = true;
        var submit_data = {};
        //预处理
        for(var i in $scope.pre_handlers){
            $scope.pre_handlers[i]();
        }
        //组织数据
        for(var i in attrs){
            submit_data[attrs[i]] = $scope.data[i];
        }
        if ($scope.formValidate.$valid) {
            //预处理
            $http({
                method:'post',
                url:$scope.table_profile["update_url"],
                data:submit_data
            }).success(function(req){
                ngDialog.openConfirm({
                    template: 'confirmDialogId',
                    className: 'ngdialog-theme-default',
                    scope: $scope
                }).then(function (value) {
                    //ok
                    $state.go('app.table-list-'+$stateParams.name,{action:'list'});
                }, function (reason) {
                    //cancel
                    $state.go('app.table-list-'+$stateParams.name,{action:'list'});
                });
            });
        } else {
            $scope.disable_create_btn = false;
            return false;
        }
    };

}]);

myApp.controller('CreateValidationController', ["$scope",'$stateParams','$state','$resource','$http','ngDialog', function ($scope,$stateParams,$state,$resource,$http,ngDialog) {
    'use strict';
    $scope.submitted = false;
    $scope.disable_create_btn = false;
    var attrs = $scope.table_profile["attrs"];
    $scope.pre_handlers = [];
    $scope.data = [];
    for(var i in attrs){
        $scope.data.push(null);
    }
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
        var submit_data = {};
        //预处理
        for(var i in $scope.pre_handlers){
            $scope.pre_handlers[i]();
        }
        //组织数据
        for(var i in attrs){
            if(attrs[i]!="id" && attrs[i]!="no"){
                submit_data[attrs[i]] = $scope.data[i];
            }
        }
        console.log(submit_data);
        if ($scope.formValidate.$valid) {
            $http({
                method:'put',
                url:$scope.table_profile["create_url"],
                data:[submit_data]
            }).success(function(req){
                ngDialog.openConfirm({
                    template: 'confirmDialogId',
                    className: 'ngdialog-theme-default',
                    scope: $scope
                }).then(function (value) {
                    //ok
                    $state.go('app.table-list-'+$stateParams.name,{action:'list'});
                }, function (reason) {
                    //cancel
                    $state.go('app.table-list-'+$stateParams.name,{action:'list'});
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
            $scope.disable_create_btn = false;
            return false;
        }
    };

}]);




myApp.controller('ngGridController',['$scope','$filter','$resource','$http','NgTableParams','ngTableDefaults', 'ngDialog',function ($scope,$filter,$resource,$http,NgTableParams,ngTableDefaults,ngDialog){
    ngTableDefaults.params.count = 5;
    ngTableDefaults.settings.counts = [];
    var self = $scope;
    self.loading = true;
    self.count = 10;
    self.newPageSize = 10;
    var self = $scope;
    $scope.btn_del_disable = true;
    $scope.table_delete_items = {};
    $scope.checkboxes = {
        checked: false,
        items: {}
    };
    self.loading = false;
    self.cols = $scope.table_profile["cols"];
    $scope.inputs ={
        fileters: $scope.table_profile["fileters"],
        globalSearchTerm : ""
    }
    $scope.fileters = $scope.inputs["fileters"][0];
    self.data_list = [];//[{"id":1,"name":"Nissim","age":41,"money":454},{"id":2,"name":"Mariko","age":10,"money":-100},{"id":3,"name":"Mark","age":39,"money":291},{"id":4,"name":"Allen","age":85,"money":871},{"id":5,"name":"Dustin","age":10,"money":378},{"id":6,"name":"Macon","age":9,"money":128},{"id":7,"name":"Ezra","age":78,"money":11},{"id":8,"name":"Fiona","age":87,"money":285},{"id":9,"name":"Ira","age":7,"money":816},{"id":10,"name":"Barbara","age":46,"money":44},{"id":11,"name":"Lydia","age":56,"money":494},{"id":12,"name":"Carlos","age":80,"money":193}];

    self.tableParams = new NgTableParams({
        settings: {counts:[]},
        page: 1,            // show first page
        count: self.count,          // count per page
        sorting: { sort_id: "asc" }
    }, {
        getData: function ($defer, params) {
            // use build-in angular filter
            // $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            return $resource($scope.table_profile["db_url"],{},{'get': {method: 'get', isArray: false}}).get(params.url()).$promise.then(function(data) {
                params.total(data.count);
                $scope.data_list = data.results;
                angular.forEach($scope.data_list, function(item) {
                    if(typeof $scope.checkboxes.items[item.id]=="undefined"){
                        $scope.checkboxes.items[item.id] = $scope.checkboxes.checked;
                    }
                });
                return data.results;
            });
        }
    });

    self.setFilterField =   function(field){
        $scope.fileters = field;
    };

    self.applyGlobalSearch = function(){
        if($scope.inputs.globalSearchTerm!=""){
            var filter = {
                name:$scope.fileters["field"],
                op: $scope.fileters["op"],
                value: $scope.inputs.globalSearchTerm
            };
            angular.extend(self.tableParams.filter(), filter);
        }else{
            self.tableParams.filter({ });
        }
    };

    self.changePageSize = function(newSize){
        console.log("changePageSize");
        this.tableParams.count(newSize);
    }

    self.add_object = function() {

    };

    self.update_object = function() {

    };

    self.delete_object = function(index,name) {
        $scope.confirmValue = name;
        ngDialog.openConfirm({
            template: 'confirmDialogId',
            className: 'ngdialog-theme-default',
            scope: $scope
        }).then(function (value) {
            console.log('Modal promise resolved. Value: ', value);
            //ok
            $http({
                method:'delete',
                url:$scope.table_profile["delete_url"]+'/'+ index
            }).success(function(req){
                //重新加载
                self.tableParams.reload();
                console.log("success");
            }).error(function(req){
                ngDialog.openConfirm({
                    template: 'errorDialogId',
                    className: 'ngdialog-theme-default',
                    scope: $scope
                }).then(function (value) {
                    //ok
                }, function (reason) {
                    //cancel
                });
            });

        }, function (reason) {
            //cancel
            console.log('Modal promise rejected. Reason: ', reason);
        });
    };

    self.remove_all = function() {
        //批量删除
        /*
         * 如果没有点击全选checkbox，则将选中的item放入handle_list,并置handle=delete
         * 否则将没选中的item放入not_to_del_list,并置handle=not_delete
         * */
        var handle_data = {
            type: "",
            dataset:[]
        };
        if (!$scope.checkboxes.checked){
            handle_data["type"] = "delete";
            angular.forEach(self.checkboxes.items, function(item_value,item_key) {
                if(item_value){
                    //选中的item
                    handle_data["dataset"].push(item_key);
                }
            });
        }else{
            handle_data["type"] = "not_delete";
            angular.forEach(self.checkboxes.items, function(item_value,item_key) {
                if(!item_value){
                    //没选中的item
                    handle_data["dataset"].push(item_key);
                }
            });
        }
        $scope.confirmValue = name;
        ngDialog.openConfirm({
            template: 'confirmDialogId',
            className: 'ngdialog-theme-default',
            scope: $scope
        }).then(function (value) {
            //ok
            $http({
                method:'post',
                url:$scope.table_profile["delete_url"]+'/delete_all',
                data: handle_data
            }).success(function(req){
                //重新加载
                self.tableParams.reload();//重新加载
                console.log("success");
            }).error(function(req){
                ngDialog.openConfirm({
                    template: 'errorDialogId',
                    className: 'ngdialog-theme-default',
                    scope: $scope
                }).then(function (value) {
                    //ok
                }, function (reason) {
                    //cancel
                });
            });
            console.log('Modal promise resolved. Value: ', value);
        }, function (reason) {
            //cancel
            console.log('Modal promise rejected. Reason: ', reason);
        });
    };



    $scope.$watch(function() {
        return $scope.checkboxes.checked;
    }, function(value) {
        angular.forEach(self.checkboxes.items, function(item_value,item_key) {
            self.checkboxes.items[item_key] = value;
        });
    });

    $scope.$watch(function() {
        return $scope.checkboxes.items;
    }, function(values) {
        var checked = 0, unchecked = 0,
            total = self.data_list.length;
        angular.forEach(self.data_list, function(item) {
            checked   +=  (self.checkboxes.items[item.id]) || 0;
            unchecked += (!self.checkboxes.items[item.id]) || 0;
        });
        if (total>0){
            if ((unchecked == 0) || (checked == 0)) {
                self.checkboxes.checked = (checked == total);
            }
        }else{
            self.checkboxes.checked = false;
        }
        self.btn_del_disable = (checked != 0);
    }, true);

}]);

