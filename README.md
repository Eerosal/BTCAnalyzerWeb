# BTCAnalyzerWeb

## 🚨 Disclaimer 🚨

This small prototype doesn't mirror my current capabilities. Some of the key points:

* Relies on ClickOps for rapid setup.
* Initially used a public S3 bucket.
* Chose Java for Lambda, potentially increasing cold start times.
* Although it's a simple application, DOM manipulation might have benefited from a library like React.js.
* Communication between the Lambda function could have been more streamlined using JSON to represent data.
* Experienced visual issues with some browsers. These issues weren't present during the initial development.

To mitigate risks, the live demo site has been replaced with a video demonstration.

## Directory structure

`static/` contains 2 directories for different versions of the web app.

`static/local/` is the main version, does all processing locally in browser.

`static/lambda/` is an alternative lambda version, does the same but runs mostly in AWS Lambda using Java. [[SOURCE](https://github.com/Eerosal/BtcAnalyzerLambda)]

## Demo
https://youtu.be/GgmzZ7g3xgk

## Usage
Included index.js (root directory) starts a simple HTTP server. 

```bash
npm start
```
After that head to http://127.0.0.1:8080/navigation.html



## 3rd party code used
[Pico.css](https://github.com/picocss/pico) (Licensed: [MIT](https://github.com/picocss/pico/blob/master/LICENSE.md))
