const XLSX = require("xlsx");

// Get the link element by its ID
const link = document.getElementById("external-link");

// Add an event listener to the link element
link.addEventListener("click", (event) => {
  // Prevent the default behavior of the link element
  event.preventDefault();

  // Open the link in the user's default browser
  require("electron").shell.openExternal(link.href);
});

// Récupération du formulaire
const pdfForm = document.getElementById("excel-form");

// Écouteur d'événement pour la soumission du formulaire
pdfForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // Empêcher le comportement de soumission par défaut

  const fileInput = document.getElementById("excel-file");
  const file = fileInput.files[0];

  if (!file) {
    alert("Veuillez sélectionner un fichier excel.");
    return;
  }

  const jsonData = await convertExcelToJSON(file);
});

// Function to convert Excel file to JSON
async function convertExcelToJSON(excelFile) {
  const workbook = XLSX.readFile(excelFile.path);
  const sheetNames = workbook.SheetNames;
  const jsonData = {};

  for (let i = 0; i < sheetNames.length; i++) {
    const worksheet = workbook.Sheets[sheetNames[i]];
    jsonData[sheetNames[i]] = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
    });
  }

  for (let i = 0; i < jsonData.length; i++) {
    for (let j = 0; j < jsonData[i].length; j++) {
      jsonData[i][j] = jsonData[i][j].replace(/\n/g, " ");
    }
  }

  // Merge all tables into one
  let mergedTable = [];

  for (let table in jsonData) {
    // Remove newline symbol from each row

    if (Array.isArray(jsonData[table])) {
      mergedTable = mergedTable.concat(jsonData[table]);
    }
  }

  let filteredTable = [];
  for (let i = 0; i < mergedTable.length; i++) {
    if (mergedTable[i].length > 0) {
      filteredTable.push(mergedTable[i]);
    }
    if (mergedTable[i].includes("Référence")) {
      // je supprime les lignes qui contiennent "Référence"
      filteredTable.pop();
    }
  }

  // pour chaque tableau, je rajoute une key field pour chaque valeur
  for (let i = 0; i < filteredTable.length; i++) {
    const currentLine = filteredTable[i];
    const object = {};
    for (let j = 0; j < currentLine.length; j++) {
      const key = "field" + (j + 1);
      // si un field est undefined, je le supprime
      if (currentLine[j] === undefined) {
        delete object[key];
        continue;
      }

      object[key] = currentLine[j];
    }
    filteredTable[i] = object;
  }

  for (let i = 0; i < filteredTable.length; i++) {
    const currentLine = filteredTable[i];
    if (currentLine.field1 && currentLine.field1.includes("JOSHNOACO")) {
      // je reprends mon tableau et dans chaque objet je supprime la keys field3
      for (let j = 0; j < filteredTable.length; j++) {
        delete filteredTable[j].field3;
      }
    }

    continue;
  }

  filteredTable = removeObjectsWithFewKeys(filteredTable);

  // Boucle pour supprimer les \n dans les valeurs
  for (let i = 0; i < filteredTable.length; i++) {
    const currentLine = filteredTable[i];
    const keyToModify = "field1";

    if (currentLine[keyToModify]) {
      currentLine[keyToModify] = currentLine[keyToModify].replace(/\n/g, "");
    }
  }

  // Loop to reassign keys in each object
  for (let i = 0; i < filteredTable.length; i++) {
    const currentLine = filteredTable[i];
    const object = {};

    let keyIndex = 1;
    for (const key in currentLine) {
      const newKey = "field" + keyIndex;
      object[newKey] = currentLine[key];
      keyIndex++;
    }

    filteredTable[i] = object;
  }

  filteredTable = removeObjectsWithoutNumber(filteredTable);

  console.log(filteredTable);
  return jsonData;
}

// Fonction pour supprimer les objets qui ont moins de 4 keys
function removeObjectsWithFewKeys(array) {
  return array.filter((obj) => Object.keys(obj).length > 4);
}

// Function to remove objects that do not have a number as the value of key 4
function removeObjectsWithoutNumber(array) {
  return array.filter((obj) => {
    const value = obj.field4;
    return (!isNaN(value) && Number.isInteger(value)) || Number.isFinite(value);
  });
}
