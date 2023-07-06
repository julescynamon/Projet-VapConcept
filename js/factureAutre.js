const path = require("path");
const fs = require("fs");
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
    if (
      currentLine.field1 &&
      typeof currentLine.field1 === "string" &&
      currentLine.field1.includes("JOSHNOACO")
    ) {
      // je reprends mon tableau et dans chaque objet je supprime la keys field3
      for (let j = 0; j < filteredTable.length; j++) {
        delete filteredTable[j].field3;
      }
    }
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

  // bouclz pour reassigner les keys
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

  // je boucle sur mon tableau d'objet pour réassigner la keys field4 en unitPrice
  for (let i = 0; i < filteredTable.length; i++) {
    const currentLine = filteredTable[i];
    const object = {};

    for (const key in currentLine) {
      if (key === "field4") {
        object["unitPrice"] = currentLine[key];
      } else {
        object[key] = currentLine[key];
      }
    }

    filteredTable[i] = object;
  }

  // je boucle sur mon tableau d'objet pour réassigner la keys field5 en field4
  for (let i = 0; i < filteredTable.length; i++) {
    const currentLine = filteredTable[i];
    const object = {};

    for (const key in currentLine) {
      if (key === "field5") {
        object["field4"] = currentLine[key];
      } else {
        object[key] = currentLine[key];
      }
    }

    filteredTable[i] = object;
  }

  return filteredTable;
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

  // on crèe un fichier json avec les données de la facture
  const factureModifPath = path.join(__dirname, "/documents/facture.json");
  if (fs.existsSync(factureModifPath)) {
    fs.unlinkSync(factureModifPath);
  }

  fs.writeFileSync(factureModifPath, JSON.stringify(jsonData));

  const tbody = document.getElementById("factureAutre-table");
  tbody.innerHTML = "";
  // Créez les lignes du tableau avec les données de la facture
  for (let i = 0; i < jsonData.length; i++) {
    const tr = document.createElement("tr");
    const td1 = document.createElement("td");
    const td2 = document.createElement("td");
    const td3 = document.createElement("td");
    const td4 = document.createElement("td");
    const td5 = document.createElement("td");

    td1.textContent = jsonData[i].field1;
    td2.textContent = jsonData[i].field2;
    td3.textContent = jsonData[i].field3;
    td4.textContent = jsonData[i].field4;
    td5.textContent = jsonData[i].unitPrice;

    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(td4);
    tr.appendChild(td5);

    tbody.appendChild(tr);
  }

  // on récupère le prix total de la facture
  const totalFact = document.getElementById("totalFact");
  totalFact.innerHTML = "";
  let total = 0;
  for (let i = 0; i < jsonData.length; i++) {
    total += parseFloat(jsonData[i].field4);
  }
  total = total.toFixed(2);
  totalFact.textContent = "€ " + total;
});
