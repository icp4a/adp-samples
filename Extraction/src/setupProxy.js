/*
 * Licensed Materials - Property of IBM (c) Copyright IBM Corp. 2022. All Rights Reserved.
 * 
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */
const { createProxyMiddleware } = require('http-proxy-middleware');
const express = require('express');
const axios = require('axios');
const cookieparser = require('cookie-parser');

// This is the name of the authentication cookie used by the document processing engine.
const AUTH_COOKIE_NAME = 'ibm-private-cloud-session';

// Add a trailing slash to the DBP server URL if there isn't one already.
let dpeUrl = process.env['DPE_SERVICE_URL'];
if (!dpeUrl.endsWith('/')) {
  dpeUrl = dpeUrl.concat('/');
}

module.exports = function (app) {
  app.use(
    // Intercept any requests that have "/api/" as the prefix.
    // Forward these requests to the target URL constructed below.
    '/api/',
    createProxyMiddleware({
      // Construct the URL we use to make requests to the Document Processing Engine.
      target: dpeUrl + 'v1/projects/' + process.env['DPE_PROJECT_ID'],
      changeOrigin: true,
      secure: false,
      pathRewrite: {
        '^/api/': '/', // Remove the "/api/" from the URL before forwarding to the Document Processing Engine.
      },
    })
  );

  app.get('/authEnabled', cookieparser(), function (req, res) {
    const authEnabled = process.env['AUTHENTICATION_ENABLED'];
    const authCookie = req.cookies[AUTH_COOKIE_NAME];

    const authenticationEnabled = authEnabled === '1' || authEnabled === 1;

    res.status(200).json({
      authEnabled: authenticationEnabled,
      authenticated: !authenticationEnabled || authCookie != null,
    });
  });

  app.post('/logout', function (req, res) {
    res.clearCookie(AUTH_COOKIE_NAME);
    res.end();
  });

  app.post('/login', express.json(), async function (req, res) {
    const { username, password } = req.body || {};
    const { DPE_ZEN_SERVICE_URL, DPE_IAM_SERVICE_URL } = process.env;
    const zenBaseUrl = new URL(DPE_ZEN_SERVICE_URL)?.origin;
    const zenAuthUrl = `${zenBaseUrl}/v1/preauth/validateAuth`;
    const iamAuthUrl = `${DPE_IAM_SERVICE_URL}/idprovider/v1/auth/identitytoken`;

    let status = 200;
    let message = 'Successfully logged in.';
    let success = true;

    try {
      // Get IAM access token
      const iamResponse = await axios.post(iamAuthUrl, {
        grant_type: 'password',
        scope: 'openid',
        username,
        password,
      });
      //     console.log(
      //       `IAM access token: ' ${JSON.stringify(iamResponse)}`
      //     );

      if (iamResponse.status !== 200) {
        status = iamResponse.status;
        message = iamResponse.statusText;
        success = false;
      } else {
        // Get the Zen token by exchanging the IAM access token
        const headers = {
          username,
          'iam-token': iamResponse.data.access_token,
        };
        const zenResponse = await axios.get(zenAuthUrl, { headers });
        //     console.log(
        //       `Zen Token from IAM accessToken: ${JSON.stringify(zenAuthRes)}`
        //     );

        if (zenResponse.status !== 200) {
          status = zenResponse.status;
          message = zenResponse.statusText;
          success = false;
        } else {
          // Set the Cookie with Zen token (use the same cookie name from zen front door)
          res.cookie(AUTH_COOKIE_NAME, zenResponse.data.accessToken, {
            httpOnly: true,
          });
        }
      }
    } catch (error) {
      console.log(JSON.stringify(error));
      success = false;
      status = error.status || 400;
      message = error.message;
    }

    res.status(status).json({
      success,
      status,
      message,
    });
  });
};
