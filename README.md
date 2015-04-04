
#SRVM(static resource version manager)

#개발한 이유 ?

- 현재 개발 중인 프로젝트의 정적 리소스(js, css, img 등) 관리를 위해 만듬.

	- 프로젝트에 브라우저 지원 여부에 따라 Application Cache 를 사용하는 것도 적극 추천한다.

- 관련 내용(Cache Control)에 대한 참고 링크.

	- [http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.9.3](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.9.3)

	- [https://devcenter.heroku.com/articles/increasing-application-performance-with-http-cache-headers](https://devcenter.heroku.com/articles/increasing-application-performance-with-http-cache-headers)

#설정하기

- **resourceMap.json** 파일 설정

	- **src**: resource 버전(file modify date 할당)을 체크하고 싶은 html 경로를 정의한다.

	- **keyName**: 체크 후 버전이 할당 될 queryString <span style="color:red">{key name}</span> 을 정의한다.
	```javascript
	<img src="../resources/img/banner1.png?{keyName}=1424941714000" />
	```
	- **types**: 정의된 파일 체크 후 resource 버전을 추가하고 싶은 파일 타입 정의.

		- **isStyle**: link Element 에 링크된 파일을 관리한다.

		- **isImg**: img Element 에 링크된 파일을 관리한다.

		- **isScript**: script Element 에 링크된 파일을 관리한다.

		- **isAudio**: audio Element 및 내부 source Element 에 링크된 파일을 관리한다.

		- **isVideo**: video Element 및 내부 source Element 에 링크된 파일을 관리한다.

	```json
	{
	  "src": [
		"template/index.html",
		"index.html"
	  ],
	  "keyName": "version",
	  "types": {

		"isStyle": true,
		"isImg": true,
		"isScript": true,
		"isAudio": true,
		"isVideo": true
	  }
	}
	```
	
#실행하기

- 파일 실행 후 설정 파일을 통해 할당 된 html 파일 내부 Element 링크들의 버전이 업데이트 된다.

- css 파일의 경우 Link Element 의 href 링크 및 css 파일 내부 background: url(<span style="color:red">{img link}</span>) 까지 업데이트 된다.

```vim
npm install

node resource_version_manager.js
```

#앞으로 해야할일들...

- html 경로를 디렉토리로 정의할 수 있게 업데이트.(만약 디렉토리로 정의한경우 해당 디렉토리 내부에 포함된 모든 html 파일을 대상으로 만든다)

- 절대 경로 버그 수정.(현재는 모든 리소스 링크들에 대해 상대 경로만 지원한다)

- 현재까지 생각나는건 여기까지...






























