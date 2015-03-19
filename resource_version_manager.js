var fs = require('fs');

process.on('uncaughtException', function (err) {

    var stack = err.stack.split(/\n/);

    console.error('\n' + err.message.red + '\n');
    console.error(stack);

    process.exit(1);
});

var setupFilePath = './resourceMap.json';


var config = JSON.parse(getFileText(setupFilePath));

var cwd = config.cwd;
var checkFiles = config.src;
var checkFileType = config.types;

eachFileText(checkFiles, function(text, path){

    var cssPtn = /[\n\r\t ]*(<link.*?href.*?\=.*?['"])(.*?)(['"].*?>)[\n\r\t ]*/gi;
    var scriptPtn = /[\n\r\t ]*(<script.*?src.*?\=.*?['"])(.*?)(['"].*?>)[\n\r\t ]*/gi;
    var imgPtn = /[\n\r\t ]*(<img.*?src.*?\=.*?['"])(.*?)(['"].*?>)[\n\r\t ]*/gi;

    if (checkFileType.isCSS){

        text = text.replace(cssPtn, function(a, $1, $2, $3) {
            return '\n' + $1 + getUpdateVersionFilePath($2) + $3;
        });
    }

    if (checkFileType.isScript) {

        text = text.replace(scriptPtn, function (a, $1, $2, $3) {
            return '\n' + $1 + getUpdateVersionFilePath($2) + $3;
        });
    }

    if (checkFileType.isImg){

        text = text.replace(imgPtn, function (a, $1, $2, $3) {
            return '\n' + $1 + getUpdateVersionFilePath($2) + $3;
        });
    }

    if (checkFileType.isFlash){

    }

    setFileText(path, text);



    // CORE Function

    function getUpdateVersionFilePath(src){

        src = src || '';

        var ret = src;

        var hrefValue = src.split('?');
        var relativeFilePath = hrefValue[0];

        var logicalFilePath = cwd + '/' + relativeFilePath;

        var queryString = hrefValue[1];

        if (queryString) {

            var retQuerys = [];

            var querys = queryString.split('&');

            for (var n in querys) {

                var query = querys[n];

                var qSplit = query.split('=');

                var key = qSplit[0];
                var value = qSplit[1] || '';

                if (key) {

                    if (key === 'v') {

                        if (/\d/gi.test(value)) {

                            var isExists = fs.existsSync(logicalFilePath);

                            if (isExists) {

                                var pTime = value;
                                var cTime = getModifyTime(logicalFilePath);

                                if (pTime < cTime) {
                                    value = cTime;
                                }
                            }
                        }
                    }

                    retQuerys.push(key + '=' + value);
                }
            }

            ret = relativeFilePath + '?' + retQuerys.join('&');
        }
        else{

            var isExists = fs.existsSync(logicalFilePath);

            if (isExists){

                var cTime = getModifyTime(logicalFilePath);

                ret = relativeFilePath + '?v=' + cTime;
            }
        }

        return ret;
    };

    function getModifyTime(path){

        path = path || '';

        var status = fs.statSync(path);

        var mtime = status.mtime.getTime();

        return mtime;
    };

});

function getFileText(path){

    path = path || '';

    var text = '';

    var isExists = fs.existsSync(path);

    if (isExists){
        text = fs.readFileSync(path, 'utf8');
    }

    return text;
};

function eachFileText(paths, callback){

    paths = paths || [];
    callback = callback || function(){};

    var length = paths.length;
    for (var i = 0; i < length; i++){

        var path = paths[i];

        var isExists = fs.existsSync(path);

        if (!isExists) continue;

        if (isExists){

            var text = fs.readFileSync(path, 'utf8');
            callback(text, path);
        }
    }
};

function setFileText(path, string){

    if (fs.existsSync(path)){

        writeFile(path, string);
    }
    else{
        creteFile(path, string);
    }
};

function writeFile(path, string){

    path = path || '';
    string = string || '';

    fs.writeFileSync(path, string);
};

function creteFile(path, string){

    path = path || '';
    string = string || '';

    fs.appendFileSync(path, string);
};