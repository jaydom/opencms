/**
 * Created by chenqianfeng on 2017/6/14.
 */
var express = require('express');
var router = express.Router();
var auth = require('./auth');

router.all('/', auth.isValid);

router.get('/', function(req, res, next) {
    res.json([
        {
            "text": "Main Navigation",
            "heading": "true",
            "translate": "sidebar.heading.HEADER"
        },
        {
            "text": "Dashboard",
            "sref": "app.dashboard",
            "icon": "icon-speedometer",
            "label": "label label-info",
            "translate": "sidebar.nav.DASHBOARD"
        },
        {
            "text": "裁判系统",
            "sref": "#",
            "icon": "icon-user",
            "submenu": [
                { "text": "比赛管理",     "sref": "app.table-list-Game" },
                { "text": "裁判管理",     "sref": "app.table-list-Referee" },
                { "text": "裁判组管理",     "sref": "app.table-list-RefereeGroup" },
                { "text": "裁判记录管理",     "sref": "app.table-list-RefereeRecord" },
                { "text": "裁判认证管理",     "sref": "app.table-list-RefereeCert" }
            ]
        },
        {
            "text": "系统管理",
            "sref": "#",
            "icon": "icon-settings",
            "submenu": [
                { "text": "报名管理",     "sref": "app.table-list-Apply" },
                { "text": "单位管理",     "sref": "app.table-list-Club" },
                { "text": "教练管理",     "sref": "app.table-list-Coach" },
                { "text": "领队管理",     "sref": "app.table-list-Leader" },
                { "text": "认证管理",     "sref": "app.table-list-Certificate" },
                { "text": "用户管理",     "sref": "app.table-list-User" }
            ]
        },
        {
            "text": "待上线",
            "sref": "#",
            "icon": "icon-note",
            "submenu": [
                {"text": "Standard",    "sref": "app.form-standard", "translate": "sidebar.nav.form.STANDARD" },
                {"text": "Extended",    "sref": "app.form-extended", "translate": "sidebar.nav.form.EXTENDED" },
                {"text": "Validation",  "sref": "app.form-validation", "translate": "sidebar.nav.form.VALIDATION" },
                {"text": "Parsley",     "sref": "app.form-parsley" },
                {"text": "Wizard",      "sref": "app.form-wizard", "translate": "sidebar.nav.form.WIZARD" },
                {"text": "Upload",      "sref": "app.form-upload", "translate": "sidebar.nav.form.UPLOAD" },
                {"text": "xEditable",   "sref": "app.form-xeditable"},
                {"text": "Image Crop",  "sref": "app.form-imagecrop"},
                {"text": "uiSelect",    "sref": "app.form-uiselect"},
                {"text": "ngDialog",      "sref": "app.ngdialog"},
                { "text": "Extended",     "sref": "app.table-extended", "translate": "sidebar.nav.table.EXTENDED" },
                { "text": "DataTables",   "sref": "app.table-datatable", "translate": "sidebar.nav.table.DATATABLE" },
                { "text": "ngTables",     "sref": "app.table-ngtable" },
                { "text": "ngGrid",       "sref": "app.table-nggrid" },
                { "text": "uiGrid",       "sref": "app.table-uigrid" },
                { "text": "xEditable",    "sref": "app.table-xeditable"},
                { "text": "Angular Grid", "sref": "app.table-angulargrid"}
            ]
        }
    ]);
});

module.exports = router;