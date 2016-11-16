const querystring = require('querystring');

const redirectUrl = 'http://localhost:3000/login';

const iam = {
    clientId: '<application ID in the APP config>',
    clientSecret: '<application secret (a generated key)>',
    tenantId: '<AD tenant (in the URL when logged in Azure AD)>',
    hostname: 'login.microsoftonline.com',
    getAuthorizePath: () => { return '/' + iam.tenantId + '/oauth2/authorize'; },
    getTokenPath: () => { return '/' + iam.tenantId + '/oauth2/token'; },
    getConfigurationPath: () => { return '/' + iam.tenantId + '/v2.0/.well-known/openid-configuration'; }
};

const session = {
    secret: 'AGEO_SECRET',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
};

const loginParameters = querystring.stringify({
    'client_id' : iam.clientId,
    'response_type' : 'id_token',
    'redirect_uri' : redirectUrl,
    'response_mode': 'form_post',
    'scope': 'openid',
    'state': '12345',
    'nonce': Date.now()
});

var authenticationKeys = [];

const config = {

    redirectUrl: redirectUrl,
    iam: iam,
    session: session,
    authenticationKeys: authenticationKeys,

    getLoginUrl: () => {
        return 'https://' + iam.hostname + iam.getAuthorizePath() + '?' + loginParameters;
    },

    getTokenParameters: (code) => {
        return querystring.stringify({
            'grant_type': 'authorization_code',
            'client_id': iam.clientId,
            'code': code,
            'client_secret': iam.clientSecret,
            'redirect_uri': redirectUrl,
            'resource': iam.clientId
        });
    },

    addAuthenticationKeys: (keys) => {
        authenticationKeys = authenticationKeys.concat(keys);
    },

    findAuthenticationKey: (kid) => {
        return authenticationKeys.find(function (key) {
            return key.kid === kid;
        });
    }
};

module.exports = config;

