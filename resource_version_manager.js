var fs = require('fs');
var http = require('http');
var _path = require('path');
var punycode = require('punycode');

process.on('uncaughtException', function (err) {

    var stack = err.stack.split(/\n/);

    console.error('\n' + err.message.red + '\n');
    console.error(stack);

    process.exit(1);
});

var setupFilePath = './resourceMap.json';
var emojiMapFilePath = './emoji_pretty.json';


var config = JSON.parse(getFileText(setupFilePath));
var emojiMap = JSON.parse(getFileText(emojiMapFilePath));
var types = config.types;

eachFileText(config.src, function (text, path) {

    var linkElemPtn = /(?:(\<link.*?href\=.*?['"])(.*?)(['"].*?\/?\>))+/gi;
    var scriptElemPtn = /(?:(\<script.*?src\=.*?['"])(.*?)(['"].*?\>\s*\<\/script.*?\>))+/gi;
    var imgElemPtn = /(?:(\<img.*?src\=.*?['"])(.*?)(['"].*?\/?\>))+/gi;

    var audioElemPtn = /(?:(\<audio.*?src\=.*?['"])(.*?)(['"].*?\>))+/gi;
    var audioSourceElemPtn = /(\<audio.*?\>)((?:\s*\<source.*?src\=['"](.*?)['"].*?\/?\>\s*)+)(\<\/audio.*?\>)/gi;

    var srcPtn = /(.*?src\=['"])(.*?)(['"].*?\/?\>)/gi;

    var videoElemPtn = /(?:(\<video.*?src\=.*?['"])(.*?)(['"].*?\>))+/gi;
    var videoSourceElemPtn = /(\<video.*?\>)((?:\s*\<source.*?src\=['"](.*?)['"].*?\/?\>\s*)+)(\<\/video.*?\>)/gi;

    // 현재 디렉토리
    var currentDir = _path.dirname(path);

    if (types.isStyle) {

        var replaceStyleText = function () {

            var originalText = arguments[0];
            // link 태그의 css file path
            var cssFilePath = arguments[2];

            // css file 의 절대 경로
            // http://nodejs.sideeffect.kr/docs/v0.10.35/api/path.html#path_path_resolve_from_to
            var absoluteCssFilePath = _path.resolve(currentDir, cssFilePath.split('?')[0]);

            var isExists = exists(absoluteCssFilePath);

            if (!isExists) return originalText;

            var backgroundImgPtn = /\s*(?:(background.*?url.*?\(.*?['"])([^\:]*)(['"].*?\)))+\s*/gi;

            var innerText = getFileText(absoluteCssFilePath);
            innerText = innerText.replace(backgroundImgPtn, function () {

                // css file 내부의 background url image path
                var imgPath = arguments[2];

                // img 파일의 절대 경로
                var absoluteImgPath = _path.resolve(_path.dirname(absoluteCssFilePath), imgPath);

                return arguments[1] + getUpdateVersionFilePath(absoluteImgPath, imgPath) + arguments[3];
            });

            // 이전 css 파일의 내용을 변경된 내용으로 치환 시킨다.

            setFileText(absoluteCssFilePath, innerText);

            return arguments[1] + getUpdateVersionFilePath(absoluteCssFilePath, cssFilePath) + arguments[3];
        };

        text = text.replace(linkElemPtn, replaceStyleText);
    }

    if (types.isScript) {

        text = text.replace(scriptElemPtn, function () {

            var originalText = arguments[0];

            // link 태그의 script file path
            var scriptFilePath = arguments[2];

            // 체크 파일의 디렉토리
            // script file 의 절대 경로
            var absoluteScriptFilePath = _path.resolve(currentDir, scriptFilePath.split('?')[0]);

            var isExists = exists(absoluteScriptFilePath);

            if (!isExists) return originalText;

            return arguments[1] + getUpdateVersionFilePath(absoluteScriptFilePath, scriptFilePath) + arguments[3];
        });
    }

    if (types.isImg) {

        text = text.replace(imgElemPtn, function () {

            var originalText = arguments[0];

            // link 태그의 script file path
            var imgFilePath = arguments[2];

            // 체크 파일의 디렉토리
            // script file 의 절대 경로
            var absoluteImgFilePath = _path.resolve(currentDir, imgFilePath.split('?')[0]);

            var isExists = exists(absoluteImgFilePath);

            if (!isExists) return originalText;

            return arguments[1] + getUpdateVersionFilePath(absoluteImgFilePath, imgFilePath) + arguments[3];
        });
    }


    if (types.isAudio) {

        text = text.replace(audioElemPtn, function () {

            var originalText = arguments[0];

            // link 태그의 script file path
            var audioFilePath = arguments[2];

            // 체크 파일의 디렉토리
            // script file 의 절대 경로
            var absoluteAudioFilePath = _path.resolve(currentDir, audioFilePath.split('?')[0]);

            var isExists = exists(absoluteAudioFilePath);

            if (!isExists) return originalText;

            return arguments[1] + getUpdateVersionFilePath(absoluteAudioFilePath, audioFilePath) + arguments[3];
        });

        text = text.replace(audioSourceElemPtn, function () {

            var searchSrc = function () {

                var originalText = arguments[0];

                //link 태그의 audio file path
                var sourceFilePath = arguments[2];

                // audio file 의 절대 경로
                var absoluteAudioSourceFilePath = _path.resolve(currentDir, sourceFilePath.split('?')[0]);

                var isExists = exists(absoluteAudioSourceFilePath);

                if (!isExists) return originalText;

                return arguments[1] + getUpdateVersionFilePath(absoluteAudioSourceFilePath, sourceFilePath) + arguments[3];
            };

            // link 태그의 script file path
            var sourceFilePath = arguments[2];

            return arguments[1] + sourceFilePath.replace(srcPtn, searchSrc) + arguments[4];
        });
    }

    if (types.isVideo) {

        text = text.replace(videoElemPtn, function () {

            var originalText = arguments[0];

            // link 태그의 script file path
            var videoFilePath = arguments[2];

            // 체크 파일의 디렉토리
            // script file 의 절대 경로
            var absoluteVideoFilePath = _path.resolve(currentDir, videoFilePath.split('?')[0]);

            var isExists = exists(absoluteVideoFilePath);

            if (!isExists) return originalText;


            return arguments[1] + getUpdateVersionFilePath(absoluteVideoFilePath, videoFilePath) + arguments[3];
        });

        text = text.replace(videoSourceElemPtn, function () {

            var searchSrc = function () {

                var originalText = arguments[0];

                //link 태그의 audio file path
                var sourceFilePath = arguments[2];

                // audio file 의 절대 경로
                var absoluteVideoSourceFilePath = _path.resolve(currentDir, sourceFilePath.split('?')[0]);

                var isExists = exists(absoluteVideoSourceFilePath);

                if (!isExists) return originalText;

                return arguments[1] + getUpdateVersionFilePath(absoluteVideoSourceFilePath, sourceFilePath) + arguments[3];
            };

            // link 태그의 script file path
            var sourceFilePath = arguments[2];

            return arguments[1] + sourceFilePath.replace(srcPtn, searchSrc) + arguments[4];
        });
    }

    // 치환된 모든 체크 파일을 초기화한다.
    setFileText(path, text);

    var emojis = getEmojisCodePoint(['beers', 'four_leaf_clover', 'smile', 'boy', 'clap']);
    console.log('update file: ' + path + ' ' + emojis[Math.floor(Math.random() * 5)]);
});



// core version manager Function

function getUpdateVersionFilePath(logicalPath, relativePath){

    logicalPath = logicalPath || '';
    relativePath = relativePath || '';

    var keyName = config.keyName;

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

        var isExists = exists(logicalFilePath);

        if (isExists) {
            ret = getModifyTime(logicalFilePath);
        }

        return ret;
    };

    function compareFileVersion(logicalFilePath, prevModifyTime){

        if (!logicalFilePath) return '';

        prevModifyTime = (prevModifyTime && prevModifyTime.constructor === Number) ? prevModifyTime : '';

        var ret = prevModifyTime;

        var isExists = exists(logicalFilePath);

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

function exists(path){

    path = path || '';

    return fs.existsSync(path) ? true : false;
};

function getFileText(path){

    path = path || '';

    var text = '';

    var isExists = exists(path);

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

        var isExists = exists(path);

        if (!isExists) continue;

        if (isExists){

            var text = fs.readFileSync(path, 'utf8');
            callback(text, path);
        }
    }
};

function setFileText(path, string){

    if (exists(path)){

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

function getEmojisCodePoint(emojiNames){

    emojiNames = emojiNames || [];

    var ret = [];
    for (var key in emojiMap){

        var emoji = emojiMap[key];

        var length = emojiNames.length;
        for (var i = 0; i < length; i++) {

            if (emoji.short_name === emojiNames[i]) {
                ret.push(punycode.ucs2.encode(['0x' + String(emoji.unified)]));
            }
        }
    }

    return ret;
};

