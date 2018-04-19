var UI = require('sketch/ui'),
    DOM = require('sketch/dom');

function onRun(context) {
  var document = DOM.getSelectedDocument(),
      documentData = document.sketchObject.documentData(),
      foreignSymbolList = documentData.foreignSymbols(),
      foreignLibraryNames = [],
      foreignLibraryIDs = [];

  if (foreignSymbolList.length > 0) {

    for (var i = 0; i < foreignSymbolList.length; i++){

      var foreignSymbol = foreignSymbolList[i],
          libraryName = String(foreignSymbol.sourceLibraryName()),
    	    libraryID = String(foreignSymbol.libraryID());

    	if (!foreignLibraryIDs.includes(libraryID)) {
        foreignLibraryIDs.push(libraryID);
          foreignLibraryNames.push(libraryName);
      }
    }

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
  var count = 0,
      symbols = foreignSymbolList.slice(0);

  for (var i = 0; i < symbols.length; i++) {
    var sourceLibraryID = symbols[i].libraryID();
    if (sourceLibraryID == libraryID) {
      symbols[i].unlinkFromRemote();
      count++;
    }
  }

  return count;
}
