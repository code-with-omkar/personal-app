// Karma config for `ng test` (runner: karma). The Angular builder injects
// frameworks/files; this file only customises browsers and reporting.
// CHROME_BIN may point at any Chromium; the cloud image ships /opt/pw-browsers/chromium.
const fs = require('node:fs');

if (!process.env.CHROME_BIN && fs.existsSync('/opt/pw-browsers/chromium')) {
  process.env.CHROME_BIN = '/opt/pw-browsers/chromium';
}

module.exports = function (config) {
  config.set({
    frameworks: ['jasmine'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
    ],
    client: { jasmine: { random: true }, clearContext: false },
    jasmineHtmlReporter: { suppressAll: true },
    coverageReporter: {
      dir: require('node:path').join(__dirname, './coverage/personal-app'),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'text-summary' }, { type: 'lcovonly' }],
    },
    reporters: ['progress', 'kjhtml'],
    browsers: ['ChromeHeadlessCI'],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-dev-shm-usage'],
      },
    },
    restartOnFileChange: true,
  });
};
