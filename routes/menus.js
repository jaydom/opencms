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
            "text": "Admin",
            "sref": "#",
            "icon": "icon-note",
            "submenu": [
                { "text": "Standard",     "sref": "app.table-list-coach", "translate": "sidebar.nav.table.DATATABLE" },
                { "text": "Extended",     "sref": "app.table-extended", "translate": "sidebar.nav.table.EXTENDED" },
                { "text": "DataTables",   "sref": "app.table-datatable", "translate": "sidebar.nav.table.DATATABLE" },
                { "text": "ngTables",     "sref": "app.table-ngtable" },
                { "text": "ngGrid",       "sref": "app.table-nggrid" },
                { "text": "uiGrid",       "sref": "app.table-uigrid" },
                { "text": "xEditable",    "sref": "app.table-xeditable"},
                { "text": "Angular Grid", "sref": "app.table-angulargrid"}
            ],
            "translate": "sidebar.nav.form.FORM"
        },
        {
            "text": "ref",
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
                {"text": "ngDialog",      "sref": "app.ngdialog"}
            ],
            "translate": "sidebar.nav.form.FORM"
        }
    ]);
});

module.exports = router;