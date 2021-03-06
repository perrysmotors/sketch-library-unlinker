var UI = require("sketch/ui"),
  DOM = require("sketch/dom"),
  SymbolMaster = DOM.SymbolMaster,
  Page = DOM.Page;

export default function() {
  var document = DOM.getSelectedDocument(),
    documentData = document.sketchObject.documentData(),
    foreignSymbolList = documentData.foreignSymbols(),
    foreignLibraryNames = [],
    foreignLibraryIDs = [];

  if (foreignSymbolList.length > 0) {
    foreignSymbolList.forEach(foreignSymbol => {
      let libraryName = String(foreignSymbol.sourceLibraryName()),
        libraryID = String(foreignSymbol.libraryID());

      if (!foreignLibraryIDs.includes(libraryID)) {
        foreignLibraryIDs.push(libraryID);
        foreignLibraryNames.push(libraryName);
      }
    });

    UI.getInputFromUser(
      "Select a library to unlink?",
      {
        type: UI.INPUT_TYPE.selection,
        possibleValues: foreignLibraryNames
      },
      (err, value) => {
        if (err) {
          // most likely the user canceled the input
          return;
        } else {
          let index = foreignLibraryNames.findIndex(name => name === value);
          let selectedLibraryID = foreignLibraryIDs[index];

          let page = new Page({
            name: "Symbols from " + value,
            parent: document,
            selected: true
          });

          let count = unlinkLibrary(page, foreignSymbolList, selectedLibraryID);

          if (count == 1) {
            UI.message("1 symbol was unlinked from " + value);
          } else {
            UI.message(count + " symbols were unlinked from " + value);
          }
          return;
        }
      }
    );
  } else {
    UI.message("This file is not linked to any libraries");
  }
}

export function onUnlinkMissingSymbols() {
  var document = DOM.getSelectedDocument(),
    documentData = document.sketchObject.documentData(),
    foreignSymbolList = documentData.foreignSymbols();

  let notFoundList = [];

  if (foreignSymbolList.length > 0) {
    foreignSymbolList.forEach(foreignSymbol => {
      let assetLibraryController = AppController.sharedInstance().librariesController();
      let libraryForSymbol = assetLibraryController.libraryForShareableObject(
        foreignSymbol.symbolMaster()
      );

      let masterFromLibrary = foreignSymbol.masterFromLibrary(libraryForSymbol);

      if (!masterFromLibrary) {
        notFoundList.push(foreignSymbol);
      }
    });

    if (notFoundList.length > 0) {
      let page = new Page({
        name: "Symbols missing from libraries",
        parent: document,
        selected: true
      });

      let count = unlinkSymbols(page, notFoundList);

      if (count == 1) {
        UI.message("1 symbol was unlinked");
      } else {
        UI.message(count + " symbols were unlinked");
      }
    } else {
      UI.message("This document does not contain any symbols that are missing from their libraries");
    }
  } else {
    UI.message("This file is not linked to any libraries");
  }
}

////////////////////////////////////////////////////////////////////////////////

function unlinkLibrary(page, foreignSymbolList, libraryID) {
  let symbols = foreignSymbolList
    .slice(0)
    .filter(symbol => symbol.libraryID() == libraryID);

  return unlinkSymbols(page, symbols);
}

function unlinkSymbols(page, symbols) {
  let x = 0;

  symbols.forEach(symbol => {
    symbol.unlinkFromRemote();
    let master = SymbolMaster.fromNative(symbol.symbolMaster());
    master.parent = page;
    master.frame = master.frame.offset(x, 0);
    x = x + master.frame.width + 100;
  });

  return symbols.length;
}
