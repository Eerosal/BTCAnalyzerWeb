# BTCAnalyzerWeb
Vincit Rising Star Pre-assignment. (https://vincit.fi/risingstar/Vincit-Rising-Star-2021-Pre-assignment.pdf)

`static/` contains 2 directories for different versions of the web app.

`static/local/` is the main version, does all processing locally in browser.

`static/lambda/` is an alternative lambda version, does the same but runs mostly in AWS Lambda using Java. [[SOURCE](https://github.com/Eerosal/BtcAnalyzerLambda)]

## Usage
Included index.js (root directory) starts a simple HTTP server. The pages should however work fine in browser.

```bash
npm start
```
And head to http://127.0.0.1:8080/navigation.html

## 3rd party code used
[Pico.css](https://github.com/picocss/pico) (Licensed: [MIT](https://github.com/picocss/pico/blob/master/LICENSE.md))
