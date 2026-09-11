const { app, BrowserWindow, Menu, ipcMain, nativeTheme, protocol, screen, session, shell } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const updates = require('./updates');
const { attachContextMenu } = require('./context-menu');

// `--static` fait tourner l'app non packagée sur l'export (out/), comme une fois installée
const isDev = !app.isPackaged && !process.argv.includes('--static');
const DEV_SERVER = process.env.CARNET_DEV_SERVER || 'http://localhost:3217';

// L'interface est un export statique de Next.js. Elle est servie par un schéma
// dédié plutôt que par `file://` : les chemins absolus (`/_next/…`) s'y
// résolvent comme sur un site, et `localStorage` a une origine stable, donc les
// notes survivent aux mises à jour de l'application.
const SCHEME = 'carnet';
const APP_URL = `${SCHEME}://app/`;
const OUT = path.join(__dirname, '..', 'out');

protocol.registerSchemesAsPrivileged([
  { scheme: SCHEME, privileges: { standard: true, secure: true, supportFetchAPI: true } }
]);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff'
};

/** Fichier de l'export correspondant à une adresse, en suivant les conventions de `trailingSlash`. */
function resolveFile(pathname) {
  const relative = decodeURIComponent(pathname).replace(/^\/+/, '');
  const candidate = path.normalize(path.join(OUT, relative));
  // Une adresse forgée ne doit jamais sortir du dossier de l'export
  if (!candidate.startsWith(OUT)) return null;
  const tries = [candidate, path.join(candidate, 'index.html'), `${candidate}.html`];
  return tries.find((file) => fs.existsSync(file) && fs.statSync(file).isFile()) ?? null;
}

function serveApp() {
  protocol.handle(SCHEME, async (request) => {
    const { pathname } = new URL(request.url);
    const file = resolveFile(pathname) ?? path.join(OUT, '404.html');
    try {
      const body = await fs.promises.readFile(file);
      const type = MIME[path.extname(file)] ?? 'application/octet-stream';
      return new Response(body, { status: file.endsWith('404.html') ? 404 : 200, headers: { 'content-type': type } });
    } catch {
      return new Response('Introuvable', { status: 404 });
    }
  });
}

// --- état de la fenêtre ------------------------------------------------------

const STATE_FILE = () => path.join(app.getPath('userData'), 'fenetre.json');

function loadWindowState() {
  const fallback = { width: 1280, height: 820, maximized: false };
  try {
    const saved = JSON.parse(fs.readFileSync(STATE_FILE(), 'utf8'));
    // Un écran débranché depuis la dernière session laisserait la fenêtre hors de vue
    const visible = screen.getAllDisplays().some(({ workArea: a }) =>
      saved.x >= a.x - 50 && saved.y >= a.y - 50 && saved.x < a.x + a.width && saved.y < a.y + a.height
    );
    return visible ? { ...fallback, ...saved } : { ...fallback, maximized: Boolean(saved.maximized) };
  } catch {
    return fallback;
  }
}

function saveWindowState(win) {
  try {
    const bounds = win.getNormalBounds();
    fs.writeFileSync(STATE_FILE(), JSON.stringify({ ...bounds, maximized: win.isMaximized() }));
  } catch {
    // Pas de quoi empêcher la fermeture
  }
}

// --- fenêtre -----------------------------------------------------------------

let win = null;

const send = (channel, payload) => {
  if (win && !win.isDestroyed()) win.webContents.send(channel, payload);
};

const isInternal = (url) => url.startsWith(APP_URL) || (isDev && url.startsWith(DEV_SERVER));

function createWindow() {
  const state = loadWindowState();

  win = new BrowserWindow({
    width: state.width,
    height: state.height,
    x: state.x,
    y: state.y,
    minWidth: 860,
    minHeight: 560,
    show: false,
    // Couleurs de la barre latérale : pas d'éclair blanc avant le premier rendu
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#141416' : '#f3f3f5',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 18, y: 18 },
    // Même choix que Hublink : le menu reste accessible avec Alt sans voler de hauteur
    autoHideMenuBar: true,
    icon: process.platform === 'darwin' ? undefined : path.join(__dirname, '..', 'build', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: true,
      additionalArguments: [`--carnet-version=${app.getVersion()}`]
    }
  });

  if (state.maximized) win.maximize();
  win.once('ready-to-show', () => win.show());
  win.on('close', () => saveWindowState(win));
  win.on('closed', () => {
    win = null;
  });

  // Liens du contenu des notes : toujours dans le navigateur par défaut
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^(https?|mailto):/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (event, url) => {
    if (isInternal(url)) return;
    event.preventDefault();
    if (/^(https?|mailto):/.test(url)) shell.openExternal(url);
  });

  attachContextMenu(win);

  win.loadURL(isDev ? DEV_SERVER : APP_URL);
  if (isDev && process.argv.includes('--devtools')) win.webContents.openDevTools({ mode: 'detach' });

  const checkOnFocus = updates.watch((update) => send('update:available', update));
  win.on('focus', checkOnFocus);
}

// --- menu ----------------------------------------------------------------------

function buildMenu() {
  const isMac = process.platform === 'darwin';
  const mod = isMac ? 'Cmd' : 'Ctrl';
  // Les raccourcis sont gérés par l'interface, qui connaît la page en cours :
  // le menu les affiche sans les intercepter, sinon chaque action partirait deux fois.
  const action = (label, name, key) => ({
    label,
    accelerator: key ? `${mod}+${key}` : undefined,
    registerAccelerator: false,
    click: () => send('menu', name)
  });

  const template = [
    ...(isMac
      ? [
          {
            label: 'Carnet',
            submenu: [
              { role: 'about', label: 'À propos de Carnet' },
              { type: 'separator' },
              { ...action('Réglages…', 'settings'), accelerator: 'Cmd+,', registerAccelerator: true },
              { type: 'separator' },
              { role: 'hide', label: 'Masquer Carnet' },
              { role: 'hideOthers', label: 'Masquer les autres' },
              { role: 'unhide', label: 'Tout afficher' },
              { type: 'separator' },
              { role: 'quit', label: 'Quitter Carnet' }
            ]
          }
        ]
      : []),
    {
      label: 'Fichier',
      submenu: [
        action('Nouvelle page', 'new-page', 'N'),
        action('Note du jour', 'today', 'J'),
        action('Rechercher', 'search', 'K'),
        action('Tâches', 'tasks'),
        ...(isMac ? [] : [{ type: 'separator' }, action('Réglages', 'settings'), { type: 'separator' }, { role: 'quit', label: 'Quitter' }])
      ]
    },
    {
      label: 'Édition',
      submenu: [
        { role: 'undo', label: 'Annuler' },
        { role: 'redo', label: 'Rétablir' },
        { type: 'separator' },
        { role: 'cut', label: 'Couper' },
        { role: 'copy', label: 'Copier' },
        { role: 'paste', label: 'Coller' },
        { role: 'pasteAndMatchStyle', label: 'Coller sans mise en forme' },
        { role: 'selectAll', label: 'Tout sélectionner' }
      ]
    },
    {
      label: 'Affichage',
      submenu: [
        { role: 'resetZoom', label: 'Taille réelle' },
        { role: 'zoomIn', label: 'Zoom avant' },
        { role: 'zoomOut', label: 'Zoom arrière' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Plein écran' },
        ...(isDev ? [{ type: 'separator' }, { role: 'reload' }, { role: 'toggleDevTools' }] : [])
      ]
    },
    {
      label: 'Fenêtre',
      submenu: [
        { role: 'minimize', label: 'Réduire' },
        ...(isMac ? [{ role: 'zoom', label: 'Agrandir' }, { role: 'front', label: 'Tout ramener au premier plan' }] : [{ role: 'close', label: 'Fermer' }])
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// --- IPC -----------------------------------------------------------------------

function registerIpc() {
  ipcMain.handle('shell:open-external', (_event, url) => {
    if (typeof url === 'string' && /^(https?|mailto):/.test(url)) return shell.openExternal(url);
  });
  ipcMain.handle('update:check', () => updates.check());
  ipcMain.handle('update:can-install', () => updates.canInstall());
  ipcMain.handle('update:download', () => updates.download((percent) => send('update:progress', { percent })));
  ipcMain.handle('update:install', () => updates.install());
}

// --- démarrage -----------------------------------------------------------------

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!win) return;
    if (win.isMinimized()) win.restore();
    win.focus();
  });

  if (process.platform === 'win32') app.setAppUserModelId('com.luthinfinity.carnet');

  app.whenReady().then(() => {
    serveApp();
    registerIpc();
    buildMenu();

    // Exports Markdown et sauvegardes : on demande où enregistrer plutôt que de poser le fichier en silence
    session.defaultSession.on('will-download', (_event, item) => {
      item.setSaveDialogOptions({
        title: 'Enregistrer',
        defaultPath: path.join(app.getPath('downloads'), item.getFilename())
      });
    });

    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
