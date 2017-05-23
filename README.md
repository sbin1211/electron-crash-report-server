**electron-crash-report-server** is a server for collecting crash reports from
Electron applications.

## install

[![Deploy][deploy-img]][deploy-url]

During setup change the `AUTH_USER` and `AUTH_PASS` environment variables. Once
the app has been deployed use those values to login.

If crash reports do not appear after the first deploy restart the app.

## usage

~~~ javascript
const {crashReporter} = require('electron')
crashReporter.start({
  // ...other options
  submitURL: 'https://app-name-12345.herokuapp.com/'
})
~~~

Refer to the [`crashReporter`][docs] documentation for the full details. _Don't
forget to start the `crashReporter` in the main process and each renderer that
will create crash reports_.

Check out the [example electron app][example] and [demo server][demo] for a
working example. The login and password for the demo are `crash` and `electron`.

If there are no sample reports use the [example] (or any other) app to add some
reports to the demo server.

## development

Node.js 6.10+ (and `yarn` or `npm`) and PostgreSQL 9.4+ are required.

~~~ sh
git clone https://github.com/johnmuhl/electron-crash-report-server
cd electron-crash-report-server
createdb electron-crash-report-server
mv .env-example .env
yarn && yarn start-dev
~~~

## bugs & features

Please [create an issue][issues] if you encounter bugs or
missing features.

## license

[MIT license][license]

[deploy-img]: https://www.herokucdn.com/deploy/button.svg
[deploy-url]: https://heroku.com/deploy
[docs]: http://electron.atom.io/docs/api/crash-reporter/
[example]: https://github.com/johnmuhl/electron-crash-report-server/tree/master/electron-bomb
[demo]: https://pacific-falls-32011.herokuapp.com/
[issues]: https://github.com/johnmuhl/electron-crash-report-server/issues
[license]: https://github.com/johnmuhl/electron-crash-report-server/blob/master/LICENSE
