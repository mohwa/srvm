var fs = require('fs');
var _path = require('path');

process.on('uncaughtException', function (err) {

    var stack = err.stack.split(/\n/);

    console.error('\n' + err.message.red + '\n');
    console.error(stack);

    process.exit(1);
});

var setupFilePath = './resourceMap.json';


var config = JSON.parse(getFileText(setupFilePath));

var checkFiles = config.src;
var checkFileType = config.types;
var keyName = config.keyName;

eachFileText(checkFiles, function(text, path){

    var cssPattern = /[\n\r\t ]*(\<.*?link.*?href.*?\=.*?['"])(.*?)(['"].*?\>)[\n\r\t ]*/gi;
    var scriptPtn = /[\n\r\t ]*(\<.*?script.*?src.*?\=.*?['"])(.*?)(['"].*?\>)[\n\r\t ]*/gi;
    var imgPtn = /[\n\r\t ]*(\<.*?img.*?src.*?\=.*?['"])(.*?)(['"].*?\>)[\n\r\t ]*/gi;

    var audioPtn1 = /[\n\r\t ]*(\<.*?audio.*?src.*?\=.*?['"])(.*?)(['"].*?\>)[\n\r\t ]*/gi;
    var audioPtn2 = /[\n\r\t ]*(\<.*?source.*?src.*?\=.*?['"])(.*?\.(mp4|mp3|ogg|wav)+.*?)(['"].*?\>)[\n\r\t ]*/gi;

    var videoPtn1 = /[\n\r\t ]*(\<.*?video.*?src.*?\=.*?['"])(.*?)(['"].*?\>)[\n\r\t ]*/gi;
    var videoPtn2 = /[\n\r\t ]*(\<.*?source.*?src.*?\=.*?['"])(.*?\.(ogv|webm)+.*?)(['"].*?\>)[\n\r\t ]*/gi;

    if (checkFileType.isCSS){

        text = text.replace(cssPattern, function($0, $1, $2, $3) {

            // link 태그의 css file path
            var cssFilePath = $2;

            // 체크 파일의 디렉토리
            var chkFilePath = _path.dirname(path);

            // css file 의 절대 경로
            var logicalCssPath = _path.resolve(chkFilePath, cssFilePath.split('?')[0]);

            var cssText = fs.readFileSync(logicalCssPath, 'utf8');
            //
            var cssImgPattern = /[\n\r\t ]*(background.*?url.*?\(.*?['"])([^\:]*)(['"].*?\))[\n\r\t ]*/gi;

            cssText = cssText.replace(cssImgPattern, function($0, $1, $2, $3) {

                // css file 내부의 background url image path
                var imgPath = $2;

                // 체크 css 파일의 디렉토리
                var chkCssFilePath = _path.dirname(logicalCssPath);

                // img 파일의 절대 경로
                var logicalImgPath = _path.resolve(chkCssFilePath, imgPath);

                return $1 + getUpdateVersionFilePath(logicalImgPath, imgPath) + $3;
            });

            // 이전 css 파일의 내용을 변경된 내용으로 치환 시킨다.
            setFileText(logicalCssPath, cssText);


            return '\n' + $1 + getUpdateVersionFilePath(logicalCssPath, cssFilePath) + $3;
        });
    }

    if (checkFileType.isScript) {

        text = text.replace(scriptPtn, function (a, $1, $2, $3) {

            // link 태그의 script file path
            var scriptFilePath = $2;

            // 체크 파일의 디렉토리
            var chkFilePath = _path.dirname(path);

            // script file 의 절대 경로
            var logicalScriptPath = _path.resolve(chkFilePath, scriptFilePath.split('?')[0]);

            return '\n' + $1 + getUpdateVersionFilePath(logicalScriptPath, scriptFilePath) + $3;
        });
    }

    if (checkFileType.isImg){

        text = text.replace(imgPtn, function (a, $1, $2, $3) {

            // link 태그의 img file path
            var imageFilePath = $2;

            // 체크 파일의 디렉토리
            var chkFilePath = _path.dirname(path);

            // img file 의 절대 경로
            var logicalImagePath = _path.resolve(chkFilePath, imageFilePath.split('?')[0]);

            return '\n' + $1 + getUpdateVersionFilePath(logicalImagePath, imageFilePath) + $3;
        });
    }

    if (checkFileType.isAudio){

        text = text.replace(audioPtn1, function (a, $1, $2, $3) {

            // link 태그의 audio file path
            var audioFilePath = $2;

            // 체크 파일의 디렉토리
            var chkFilePath = _path.dirname(path);

            // audio file 의 절대 경로
            var logicalAudioPath = _path.resolve(chkFilePath, audioFilePath.split('?')[0]);

            return '\n' + $1 + getUpdateVersionFilePath(logicalAudioPath, audioFilePath) + $3;
        });

        text = text.replace(audioPtn2, function (a, $1, $2, $3, $4) {

            //console.log($4);
            //link 태그의 audio file path
            var audioFilePath = $2;

            // 체크 파일의 디렉토리
            var chkFilePath = _path.dirname(path);

            // audio file 의 절대 경로
            var logicalAudioPath = _path.resolve(chkFilePath, audioFilePath.split('?')[0]);

            return '\n' + $1 + getUpdateVersionFilePath(logicalAudioPath, audioFilePath) + $4;
        });
    }

    if (checkFileType.isVideo){

        text = text.replace(videoPtn1, function (a, $1, $2, $3) {

            // link 태그의 audio file path
            var videoFilePath = $2;

            // 체크 파일의 디렉토리
            var chkFilePath = _path.dirname(path);

            // audio file 의 절대 경로
            var logicalVideoPath = _path.resolve(chkFilePath, videoFilePath.split('?')[0]);

            return '\n' + $1 + getUpdateVersionFilePath(logicalVideoPath, videoFilePath) + $3;
        });

        text = text.replace(videoPtn2, function (a, $1, $2, $3, $4) {

            // link 태그의 audio file path
            var videoFilePath = $2;

            // 체크 파일의 디렉토리
            var chkFilePath = _path.dirname(path);

            // audio file 의 절대 경로
            var logicalVideoPath = _path.resolve(chkFilePath, videoFilePath.split('?')[0]);

            return '\n' + $1 + getUpdateVersionFilePath(logicalVideoPath, videoFilePath) + $4;
        });
    }

    setFileText(path, text);





    // core version manager Function

    function getUpdateVersionFilePath(logicalPath, relativePath){

        logicalPath = logicalPath || '';
        relativePath = relativePath || '';

        var ret = '';

        var logicalHrefValue = logicalPath.split('?');
        var relativeHrefValue = relativePath.split('?');

        var logicalFilePath = logicalHrefValue[0];
        var relativeFilePath = relativeHrefValue[0];

        var params = relativeHrefValue[1];

        if (params) {

            var tParams = [];

            var isDetectVersion = false;

            params = params.split('&');

            for (var n in params) {

                var param = params[n];

                var paramSplit = param.split('=');

                var key = paramSplit[0];
                var value = paramSplit[1];

                if (!key) continue;

                if (key === keyName) {

                    value = compareFileVersion(logicalFilePath, value);
                    isDetectVersion = true;
                }

                tParams.push(key + '=' + value);
            }

            ret = relativeFilePath + '?' + tParams.join('&');

            if (!isDetectVersion){
                ret += '&' + keyName + '=' + getFileVersion(logicalFilePath);
            }
        }
        else{

            ret = relativeFilePath + '?' + keyName + '=' + getFileVersion(logicalFilePath);
        }

        return ret;


        function getFileVersion(logicalFilePath){

            if (!logicalFilePath) return '';

            var ret = '';

            var isExists = fs.existsSync(logicalFilePath);

            if (isExists) {
                ret = getModifyTime(logicalFilePath);
            }

            return ret;
        };

        function compareFileVersion(logicalFilePath, prevModifyTime){

            if (!logicalFilePath) return '';

            prevModifyTime = (prevModifyTime && prevModifyTime.constructor === Number) ? prevModifyTime : 0;

            var ret = prevModifyTime;

            var isExists = fs.existsSync(logicalFilePath);

            if (isExists) {

                var currentModifyTime = getModifyTime(logicalFilePath);

                if (prevModifyTime < currentModifyTime) {
                    ret = currentModifyTime;
                }
            }

            return ret;
        };
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