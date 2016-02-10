// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import { app, BrowserWindow } from 'electron';
import devHelper from './dev_helper';
import windowStateKeeper from './window_state';

// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from './env';

let mainWindow;

// Preserver of the window size and position between app launches.
const mainWindowState = windowStateKeeper('main', {
  width: 1000,
  height: 600
});

app.on('ready', () => {

  mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    webPreferences: {
      webSecurity: false // Disable the same-origin policy when using http
    }
  });

  if (mainWindowState.isMaximized) {
    mainWindow.maximize();
  }

  if (env.name === 'test') {
    mainWindow.loadURL('file://' + __dirname + '/spec.html');
  } else if (env.name === 'development') {
    mainWindow.loadURL('http://localhost:3000/index.html');
  } else {
    mainWindow.loadURL('file://' + __dirname + '/index.html');
  }

  if (env.name !== 'production') {
    devHelper.setDevMenu();
    mainWindow.openDevTools();
  }

  mainWindow.on('close', () => {
    mainWindowState.saveState(mainWindow);
  });
});

app.on('window-all-closed', () => {
  app.quit();
});
