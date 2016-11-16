const https = require('https');
const url = require('url');
const crypto = require('crypto');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var jws = require('jws');

var config = require('./config.js');

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('static'));
app.set('views', __dirname + '/views');
app.set('view engine', 'jsx');
app.engine('jsx', require('express-react-views').createEngine());

app.use(session(config.session));

app.get('/', function (expressRequest, expressResponse) {
    checkSession(expressRequest, expressResponse, function () {
        expressResponse.render('authenticated');
    });
});

app.post('/login', function (expressRequest, expressResponse) {
    expressRequest.session.authenticated = true;
    expressRequest.session.authenticationCode = expressRequest.body.id_token;

    var jwtStrings = expressRequest.session.authenticationCode ? expressRequest.session.authenticationCode.split('.') : '';
    expressRequest.session.jwt = {
        isSet: jwtStrings.length > 0,
        header: jwtStrings.length > 0 ? JSON.parse(atob(jwtStrings[0])) : '',
        payload: jwtStrings.length > 0 ? JSON.parse(atob(jwtStrings[1])) : '',
        signature: jwtStrings.length > 0 ? jwtStrings[2] : ''
    };
    renderAuthenticated(expressRequest, expressResponse);

});

app.get('/logout', function (expressRequest, expressResponse) {
    expressRequest.session.destroy(function (err) {
        expressResponse.render('logged-out', { url: config.getLoginUrl() });
    });
});

app.post('/validateToken', function (expressRequest, expressResponse) {
    checkSession(expressRequest, expressResponse, function () {
        expressRequest.session.validation = null;
        if (expressRequest.session.jwt.isSet) {
            try {

                var key = config.findAuthenticationKey(expressRequest.session.jwt.header.kid);

                expressRequest.session.validation = jws.verify(expressRequest.body.token, expressRequest.session.jwt.header.alg, convertCertificate(key.x5c[0]));
            } catch (exception) {
                console.log(exception);
            }
        }
        renderAuthenticated(expressRequest, expressResponse);
    });
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');

    new Promise(function (resolve, reject) {
        var options = {
            host: config.iam.hostname,
            path: config.iam.getConfigurationPath()
        };

        var httpRequest = https.request(options, (httpResponse) => {
            var body = '';
            httpResponse.setEncoding('utf8');
            httpResponse.on('data', (chunk) => {
                body += chunk;
            });
            httpResponse.on('end', () => {
                resolve(body);
            });
        });
        httpRequest.end();

        httpRequest.on('error', (e) => {
            reject(e);
        });
    }).then(function (body) {
        return JSON.parse(body);
    }).catch(function (e) {
        console.error(e);
    }).then(function (parsedBody) {
        return parsedBody.jwks_uri;
    }).then(function (keysUrl) {
        return new Promise(function (resolve, reject) {
            var parsedUrl = url.parse(keysUrl);
            var options = {
                host: parsedUrl.hostname,
                path: parsedUrl.pathname
            };

            var httpRequest = https.request(options, (httpResponse) => {
                var body = '';
                httpResponse.setEncoding('utf8');
                httpResponse.on('data', (chunk) => {
                    body += chunk;
                });
                httpResponse.on('end', () => {
                    resolve(body);
                });
            });
            httpRequest.end();

            httpRequest.on('error', (e) => {
                reject(e);
            });
        });
    }).then(function (body) {
        return JSON.parse(body);
    }).catch(function (e) {
        console.error(e);
    }).then(function (parsedBody) {
        config.addAuthenticationKeys(parsedBody.keys);
    });

});

function checkSession(expressRequest, expressResponse, callback) {
    if (!expressRequest.session || !expressRequest.session.authenticated) {
        expressResponse.render('not-authenticated', { url: config.getLoginUrl() });
    } else {
        callback();
    }
}

function renderAuthenticated(expressRequest, expressResponse) {

    expressResponse.render('authenticated', {
        authenticationCode: expressRequest.session.authenticationCode,
        jwt: {
            header: JSON.stringify(expressRequest.session.jwt.header),
            payload: JSON.stringify(expressRequest.session.jwt.payload),
            signature: expressRequest.session.jwt.signature
        },
        validation: expressRequest.session.validation !== undefined ? expressRequest.session.validation.toString() : ''
    });
}

function atob(str) {
    return new Buffer(str, 'base64').toString('binary');
}

function convertCertificate(cert) {

    var beginCert = '-----BEGIN CERTIFICATE-----';
    var endCert = '-----END CERTIFICATE-----';

    cert = cert.replace('\n', '');
    cert = cert.replace(beginCert, '');
    cert = cert.replace(endCert, '');

    var result = beginCert;
    while (cert.length > 0) {

        if (cert.length > 64) {
            result += '\n' + cert.substring(0, 64);
            cert = cert.substring(64, cert.length);
        }
        else {
            result += '\n' + cert;
            cert = '';
        }
    }

    if (result[result.length ] != '\n')
        result += '\n';
    result += endCert + '\n';
    return result;
}
