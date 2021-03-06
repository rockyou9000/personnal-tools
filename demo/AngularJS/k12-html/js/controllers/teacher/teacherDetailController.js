'use strict';

angular.module('admin').controller('TeacherDetailController', ['$rootScope','$state','$window','teacherService','courseService','FileUploader','uploadService', TeacherDetailController]);

function TeacherDetailController($rootScope,$state,$window, teacherService,courseService, FileUploader,uploadService) {
    var vm = this;
    if(!vm.params){
        vm.params={};
    }
    // 获取老师ID
    var id = $state.params.id;
    vm.id = id;
    var choice1 = $state.params.choiceb;
    var statusb = $state.params.statusb;
    vm.params.sex = $state.params.sex;
    vm.params.status = $state.params.status;


    //vm.noedit = true;
    //choice1为1是编辑页面，为2是查看页面,为3是新增页面
    if(choice1 == 1 && statusb == 1){
        teacherService.get(id).then(function(res) {
            if (res.data.code === 0) {
                vm.params = res.data.data;
            } else {
                $rootScope.alert(res.data.message);
            }
        });
        vm.status = 1;
        vm.noedit = false;
    }
    else if(choice1 == 2 && statusb == 1){
        teacherService.get(id).then(function(res) {
            if (res.data.code === 0) {
                vm.params = res.data.data;
            } else {
                $rootScope.alert(res.data.message);
            }
        });
        vm.status = 2;
        vm.noedit = true;
    }
    else if (choice1 == 3 ) {
        vm.status = 3;
        vm.noedit = false;
    }
    else if(choice1 == 2 && statusb == 0){
        teacherService.get(id).then(function(res) {
            if (res.data.code === 0) {
                vm.params = res.data.data;
            } else {
                $rootScope.alert(res.data.message);
            }
        });
        vm.status = 4;
        vm.noedit = true;
    }
    else if(choice1 == 1 && statusb == 0){
        teacherService.get(id).then(function(res) {
            if (res.data.code === 0) {
                vm.params = res.data.data;
            } else {
                $rootScope.alert(res.data.message);
            }
        });
        vm.status = 5;
        vm.noedit = false;
    }

    ////权限获取，设置
    //var moduleId = JSON.parse($cookies.records).moduleID;
    //var modulePermission = $rootScope.permissionSet[moduleId];
    //console.log(modulePermission);
    //
    //vm.created = modulePermission.in_array("create");
    //vm.updated = modulePermission.in_array("update");
    //vm.deleted = modulePermission.in_array("delete");
    //vm.sorted = modulePermission.in_array("sort");

    //判断是否显示课程
    var coursePermission = $rootScope.permissionSet[55];
    if(coursePermission == undefined){
        vm.courseShow = false;
    }
    else {
        vm.courseShow = true;
    }

    //有查看状态转为编辑状态
    vm.edit = function(){
        vm.status = 1;
        vm.noedit = false;
    };
    // 新增
    vm.add = function() {
        vm.params.grade = '';
        teacherService.add(vm.params).then(function(res) {
            if (res.data.code === 0) {
                //  $rootScope.alert("增加信息成功");

                $rootScope.alert("增加信息成功", function() {
                    vm.noedit = true;
                    vm.status=2;
                    $window.history.back();
                });
            } else {
                $rootScope.alert(res.data.message);
            }
        });
    };
    // 更新
    vm.update = function() {
        angular.extend(vm.params, {id: id});
        delete vm.params.createTime;
        delete vm.params.updateTime;

        teacherService.update(id, vm.params).then(function(res) {
            if (res.data.code === 0) {
             //   alert(vm.params.status);
                $rootScope.alert("更新信息成功", function() {
                    vm.noedit = true;
                    vm.status=2;
                    $window.history.back();
                });
            } else {
                $rootScope.alert(res.data.message);
            }
        });
    };
    // 取消
    vm.cancel = function() {
      //  $state.go("field.teacherList",{status:vm.params.status});
        $window.history.back();
    };

    vm.fireorhire = function(id,statusmes,tname) {
        if (statusmes == 0) {
            var thisstatus = 1;
            var tips = "您确定要召回该外教吗？";
        }
        else {
            thisstatus = 0;
            tips = "您确定要辞退该外教吗？";
        }
        if (statusmes == 1) {

            var teacherparams = {
                startAt: '',
                endAt: '',
                grade: '',
                cname: '',
                tname: tname,
                tid:id,
                status: 1,
                bname: '',
                uname: '',
                cwname: ''
            };
            courseService.getList(teacherparams).then(function (res) {
                if (res.data.code === 0) {
                    vm.teacherListData = res.data.data;
                    // alert(vm.teacherListData.length);
                    console.log(vm.teacherListData);
                    if (vm.teacherListData.length == 0) {
                        $rootScope.confirm(tips, function () {
                            teacherService.fire(id, thisstatus).then(function (res) {
                                if (res.data.code === 0) {
                                    $state.go("field.teacherList", {status: vm.params.status, grade: -1});
                                } else {
                                    $rootScope.alert(res.data.message);
                                }
                            });
                        })
                    }
                    else {
                        $rootScope.confirm("该教师已有排课，请先取消该老师排课计划", function () {
                            $state.go("field.courseList", {tname: tname,status: 1});
                        });
                    }

                } else {
                    $rootScope.alert(res.data.message);
                }
            });
        }
        else if(statusmes == 0){
            $rootScope.confirm(tips, function () {
                teacherService.fire(id, thisstatus).then(function (res) {
                    if (res.data.code === 0) {
                        $state.go("field.teacherList", {status: vm.params.status, grade: -1});
                    } else {
                        $rootScope.alert(res.data.message);
                    }
                });
            })
        }
    }

    // 修改密码
    vm.changePwdStatus = false;
    vm.changePwd = function() {
        vm.changePwdStatus = !vm.changePwdStatus;
        if (vm.changePwdStatus) {
        } else {
            teacherService.pwd(id, {id: id, pwd: vm.pwd}).then(function(res) {
                if (res.data.code === 0) {
                    $rootScope.alert("保存新密码成功", function() {
                        vm.changePwdStatus = false;
                    });
                } else {
                    $rootScope.alert(res.data.message);
                }
            })
        }
    };


    FileUploader.FileSelect.prototype.isEmptyAfterSelection = function(){
        return true;
    };
    vm.uploader = uploadService.uploadFile(FileUploader);
    vm.uploader.onSuccessItem = function(fileItem, response, status, headers) {
        if (status == 200) {
            console.log(response.data.url);
            vm.params.img = response.data.url;
        }
    };


}