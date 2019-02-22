var UI = require("sketch/ui"),
  DOM = require("sketch/dom"),
  SymbolMaster = DOM.SymbolMaster,
  Page = DOM.Page;

function onRun(context) {
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

    var selection = UI.getSelectionFromUser(
      "Select a library to unlink:",
      foreignLibraryNames
    );

    var ok = selection[2],
      index = selection[1],
      selectedLibraryID = foreignLibraryIDs[index];
    selectedLibraryName = foreignLibraryNames[index];

    if (ok) {
      let page = new Page({
        name: "Symbols from " + selectedLibraryName
      });
      page.parent = document;
      context.document.pageTreeLayoutDidChange();

      count = unlinkLibrary(page, foreignSymbolList, selectedLibraryID);

      if (count == 1) {
        UI.message("1 symbol was unlinked from " + selectedLibraryName);
      } else {
        UI.message(
          count + " symbols were unlinked from " + selectedLibraryName
        );
      }
    }
  } else {
    UI.message("This file is not linked to any libraries");
  }
}

////////////////////////////////////////////////////////////////////////////////

function unlinkLibrary(page, foreignSymbolList, libraryID) {
  let symbols = foreignSymbolList
      .slice(0)
      .filter(symbol => symbol.libraryID() == libraryID),
    x = 0;

  symbols.forEach(symbol => {
    symbol.unlinkFromRemote();
    let master = SymbolMaster.fromNative(symbol.symbolMaster());
    master.parent = page;
    master.frame = master.frame.offset(x, 0);
    x = x + master.frame.width + 100;
  });

  return symbols.length;
}
