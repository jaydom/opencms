var xl = require('node-xlrd');

exports.isValidFormat = function(sheet,cRow,table_headers){
    var cCount = sheet.column.count;
    //判断长度
    if (table_headers.length>cCount){
        return -1;
    }
    //比较表头
    for (var sIdx =0; sIdx< table_headers.length; sIdx++ ){
        if (table_headers[sIdx]["title"]!=sheet.cell(cRow,sIdx) ){
            return -1;
        }
    }
    return cRow+1;
}

exports.parse_cols = function(sheet,cRow,table_headers){
    var cols = {};
    for(var i in table_headers){
        var field = table_headers[i];
        if(field["insert"]==false){
            continue;
        }
        var name = field["name"];
        cols[name] = sheet.cell(cRow,i).toString().trim();
    }
    return cols;
}

exports.isValidCols = function (cols) {
    var valid = false;
    for (var key in cols) {
        if(cols[key]!=""){
            valid = true;
            break;
        }
    }
    return valid;
}