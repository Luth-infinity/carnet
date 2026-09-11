const { contextBridge, ipcRenderer } = require('electron');

const invoke = (channel, payload) => ipcRenderer.invoke(channel, payload);

function on(channel, handler) {
  const listener = (_event, payload) => handler(payload);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}

// Le preload est isolé : la version arrive par la ligne de commande du renderer
const version = (process.argv.find((arg) => arg.startsWith('--carnet-version=')) || '').split('=')[1] || '';

contextBridge.exposeInMainWorld('carnet', {
  platform: process.platform,
  version,
  openExternal: (url) => invoke('shell:open-external', url),
  onMenu: (handler) => on('menu', handler),
  checkUpdate: () => invoke('update:check'),
  onUpdateAvailable: (handler) => on('update:available', handler),
  updater: {
    canInstall: () => invoke('update:can-install'),
    download: () => invoke('update:download'),
    install: () => invoke('update:install'),
    onProgress: (handler) => on('update:progress', handler)
  }
});
