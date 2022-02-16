# BTCAnalyzerWeb
`static/` contains 2 directories for different versions of the web app.

`static/local/` is the main version, does all processing locally in browser.

`static/lambda/` is an alternative lambda version, does the same but runs mostly in AWS Lambda using Java. [[SOURCE](https://github.com/Eerosal/BtcAnalyzerLambda)]

## Live demo
http://btc-analyzer.s3-website.eu-north-1.amazonaws.com/navigation.html

## Usage
Included index.js (root directory) starts a simple HTTP server. 

```bash
npm start
```
After that head to http://127.0.0.1:8080/navigation.html



## 3rd party code used
[Pico.css](https://github.com/picocss/pico) (Licensed: [MIT](https://github.com/picocss/pico/blob/master/LICENSE.md))
