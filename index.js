'use strict';

const fs = require('fs');
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const host = '0.0.0.0';
const port = 3000;
const dbFile = './lti-db.json';

// NOTE: update this to the value created when setting up the Developer Key in Canvas
const client_id = '10000000000001';
const canvasBaseURI = 'http://canvas.docker';

function launchHandler(req, res) {
  console.log(`Launch Request Body (from Canvas LMS): ${JSON.stringify(req.body)}\n`);

  // This value can be the same for all "instances" of this LTI app, as it's configured in the LMS during setup
  const redirectURI = 'http://localhost:3000/oidc/authenticate';
  // This value would be stored in a DB along with other data during the LMS onboarding/setup. For now it's hardcoded.
  const canvasAuthURI = `${canvasBaseURI}/api/lti/authorize_redirect`;

  // Using a simple file to mock a database here
  const fileContent = {
    target_link_uri: req.body.target_link_uri,
  };
  // Write to dbFile
  fs.writeFile(dbFile, JSON.stringify(fileContent), (err) => {
    if (err) {
      console.error(err);
    }
  });

  if (!req.body.login_hint) {
    res.send('Must supply `login_hint` as parameter');
    return;
  }

  const authRequestBody = {
    scope: 'openid',
    response_type: 'id_token',
    client_id: client_id,
    redirect_uri: redirectURI,
    login_hint: req.body.login_hint,
    lti_message_hint: req.body.lti_message_hint ? req.body.lti_message_hint : '', // TEMP: probably remove this, but see if Canvas is sending this
    state: 'state123', // For test, we'll hardcode this vs. generating it
    response_mode: 'form_post',
    nonce: 'nonce123', // For test, we'll hardcode this vs. generating it
    prompt: 'none',
  };

  const params = new URLSearchParams(authRequestBody);

  console.log(`Auth Request Body (from LTI App): ${JSON.stringify(authRequestBody)}\n`);

  res.redirect(`${canvasAuthURI}?${params}`);
}

function authenticateHandler(req, res) {
  console.log(`Auth Response Body (from Canvas LMS): ${JSON.stringify(req.body)}\n`);

  // grab id_token out of request
  const jwt = req.body.id_token;
  // read dbFile, update with JWT value, and write back
  const fileData = fs.readFileSync(dbFile);
  const fileContent = JSON.parse(fileData);
  fileContent.jwt = jwt;

  fs.writeFile(dbFile, JSON.stringify(fileContent), (err) => {
    if (err) {
      console.error(err);
    }
  });

  // redirect to final requested URI that was part of initial launch request
  res.redirect(fileContent.target_link_uri);
}

// Starting point, this route handles LTI launch requests
app.get('/launch', (req, res) => {
  launchHandler(req, res);
});

app.post('/launch', (req, res) => {
  launchHandler(req, res);
});

// This route handles the Authentication response from the LMS
app.get('/oidc/authenticate', (req, res) => {
  authenticateHandler(req, res);
});

app.post('/oidc/authenticate', (req, res) => {
  authenticateHandler(req, res);
});

// Mock final URI, this would be the landing page of studio.code.org or something
app.get('/target', (req, res) => {
  const fileData = fs.readFileSync(dbFile);
  const fileContent = JSON.parse(fileData);
  const jwtBody = JSON.parse(Buffer.from(fileContent.jwt.split('.')[1], 'base64').toString());

  const landingPage = `
<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        background-color: lightblue;
      }
      h1 {text-align: center;}
      h2 {text-align: center;}
    </style>
  </head>
  <body>
    <h1>Welcome, ${jwtBody.name}!</h1>
    <h2>This is the LTI Test App (but pretend it's studio.code.org)</h2>
  </body>
</html>
`;

  res.send(landingPage);
});

app.listen(port, () => {
  console.log(`Example app listening on http://${host}:${port}\n`);
});
