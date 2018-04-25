var UI = require('sketch/ui'),
    DOM = require('sketch/dom');

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
      count = unlinkLibrary(foreignSymbolList, selectedLibraryID);
      if (count == 1) {
        UI.message('1 symbol was unlinked from ' + selectedLibraryName);
      } else {
        UI.message(count + ' symbols were unlinked from ' + selectedLibraryName);
      }
    }

  } else {
    UI.message('This file is not linked to any libraries')
  }

}

////////////////////////////////////////////////////////////////////////////////

function unlinkLibrary(foreignSymbolList, libraryID) {

  let symbols = foreignSymbolList.slice(0).filter(symbol => symbol.libraryID() == libraryID);

  symbols.forEach(symbol => {
    symbol.unlinkFromRemote();
  });

  return symbols.length;
}
