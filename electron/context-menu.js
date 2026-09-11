const { Menu, clipboard, shell } = require('electron');

/**
 * Electron n'a pas de menu contextuel par défaut : sans celui-ci, le clic
 * droit ne propose ni copier-coller ni les corrections orthographiques.
 */
function attachContextMenu(win) {
  win.webContents.on('context-menu', (_event, params) => {
    const { editFlags, isEditable, selectionText, linkURL, misspelledWord, dictionarySuggestions } = params;
    const template = [];

    if (misspelledWord) {
      for (const suggestion of dictionarySuggestions.slice(0, 5)) {
        template.push({ label: suggestion, click: () => win.webContents.replaceMisspelling(suggestion) });
      }
      if (!dictionarySuggestions.length) template.push({ label: 'Aucune suggestion', enabled: false });
      template.push(
        {
          label: 'Ajouter au dictionnaire',
          click: () => win.webContents.session.addWordToSpellCheckerDictionary(misspelledWord)
        },
        { type: 'separator' }
      );
    }

    if (/^(https?|mailto):/.test(linkURL)) {
      template.push(
        { label: 'Ouvrir le lien', click: () => shell.openExternal(linkURL) },
        { label: "Copier l'adresse du lien", click: () => clipboard.writeText(linkURL) },
        { type: 'separator' }
      );
    }

    if (isEditable) {
      template.push(
        { role: 'cut', label: 'Couper', enabled: editFlags.canCut },
        { role: 'copy', label: 'Copier', enabled: editFlags.canCopy },
        { role: 'paste', label: 'Coller', enabled: editFlags.canPaste },
        { role: 'pasteAndMatchStyle', label: 'Coller sans mise en forme', enabled: editFlags.canPaste },
        { type: 'separator' },
        { role: 'selectAll', label: 'Tout sélectionner' }
      );
    } else if (selectionText.trim()) {
      template.push({ role: 'copy', label: 'Copier' });
    }

    if (template.length && template[template.length - 1].type === 'separator') template.pop();
    if (template.length) Menu.buildFromTemplate(template).popup({ window: win });
  });
}

module.exports = { attachContextMenu };
