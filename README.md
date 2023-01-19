# LTI Test App

This app is for testing LTI with Canvas. It expects Canvas to be running locally
via Docker. See [Canvas for Docker setup instructions][canvas-docker]

[canvas-docker]: https://github.com/instructure/canvas-lms/tree/master/doc/docker

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Build the Docker image

```bash
npm run docker-build
```

3. Run the Docker image

```bash
npm run docker-run
```

4. Alternitively, you can just run it via Node with `node index.js` instead of
   Docker.

This will start the app listening on `http://0.0.0.0:3000`. The app is set up to
log request and responses, so you can see what the contents of the LTI launch
flow are.

## Canvas Setup

- In Canvas, you'll need to configure the LTI App. In the Admin page, click on the
  'Developer Keys` section in the left navigation menu.
- Click on the `+ Devloper Key` button, and select `LTI Key`
- The three important URLs to know are the following:
  - `Target Link URI` = `http://localhost:3000/target`
  - `OpenID Connect Initiation URL` = `http://localhost:3000/launch`
  - `Redirect URIs` = `http://localhost:3000/oidc/authenticate`
- You'll also want to give this LTI app a Name, Title, and Description which are
  required
- Ignore JWK configuration for now
- Click `Save`
- After saving, make sure to enable the Key to `On`
- From here, you can add the LTI App in an Assigment view
