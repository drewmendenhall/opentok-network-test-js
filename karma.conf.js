const path = require('path');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config');

module.exports = function (config) {
  let sauceLaunchers = {
    ie: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: process.env.BVER === '10' ? 'Windows 8' : 'Windows 8.1',
      version: process.env.BVER,
      prerun: {
        executable: 'http://localhost:5000/plugin-installer/SauceLabsInstaller.exe',
        background: false,
        timeout: 120,
      }
    },
    chrome: {
      base: 'Chrome',
      // flags: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']
    },
    firefox: {
      base: 'Firefox',
      prefs: {
        'media.navigator.permission.disabled': true,
        'media.navigator.streams.fake': true,
        'app.update.enabled': false,
      }
    }
  };
  let browser;
  if (process.env.BROWSER === 'safari') {
    browser = process.env.BVER === 'unstable' ? 'SafariTechPreview' : 'Safari'
  } else {
    browser = process.env.BROWSER || 'chrome';
  }
  config.set({
    hostname: '127.0.0.1',
    basePath: './test',
    files: [
      '*.spec.ts',
    ],
    autoWatch: true,
    frameworks: ['jasmine'],
    customLaunchers: sauceLaunchers,
    colors: true,
    browsers: [browser],
    preprocessors: {
      '*.spec.ts': ['webpack', 'sourcemap'],
    },
    webpack: {
      module: {
        loaders: [
          {
            test: /\.js(x?)$/,
            loader: 'babel-loader',
          },
          {
            test: /\.ts(x?)$/,
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            }
          },
        ]
      },
      resolve: webpackConfig.resolve,
      devtool: 'inline-source-map',
      plugins: [
        new webpack.SourceMapDevToolPlugin({
          filename: null,
          test: /\.(ts|js)(x?)$/ // to allow webpack to pass sourcemap if the file is ts or js.
        })
      ],
      externals: webpackConfig.externals.concat({
        'websocket': 'window.WebSocket'
      })
    },
    webpackMiddleware: {
      stats: 'errors-only'
    },
    mime: {
      'text/x-typescript': ['ts']
    },
    junitReporter: {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    },
    sauceLabs: {
      startConnect: false,
      tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER
    },
    reporters: ['progress', 'saucelabs']
  });
};