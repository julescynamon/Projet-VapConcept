const path = require("path");
const fs = require("fs");

function getAppDataPath() {
  switch (process.platform) {
    case "darwin": {
      return path.join(
        process.env.HOME,
        "Library",
        "Application Support",
        "vap-concept"
      );
    }
    case "win32": {
      return path.join(process.env.APPDATA, "vap-concept");
    }
    case "linux": {
      return path.join(process.env.HOME, ".vap-concept");
    }
    default: {
      console.log("Unsupported platform!");
      process.exit(1);
    }
  }
}

const appDatatDirPath = getAppDataPath();
const facturePath = path.join(appDatatDirPath, "facture.json");
const factureCopyPath = path.join(appDatatDirPath, "facture_copy.json");

// Lire le contenu du fichier facture.json
const factureContent = fs.readFileSync(facturePath, "utf8");

// Écrire le contenu dans un nouveau fichier facture_copy.json
fs.writeFileSync(factureCopyPath, factureContent);

// Read the facture.json file and parse it as a JavaScript object
const fact = JSON.parse(fs.readFileSync(factureCopyPath, "utf8"));

const bddPath = path.join(appDatatDirPath, "bdd.json");
const bddContent = fs.readFileSync(bddPath, "utf8");
const bdd = JSON.parse(bddContent);

for (let i = 0; i < fact.length; i++) {
  const item = fact[i];
  const refFournisseur = item.field1;

  for (let j = 0; j < bdd.length; j++) {
    const bddItem = bdd[j];
    if (bddItem.ref[" Fourn"] === refFournisseur) {
      const multiplier = bddItem.Tag;
      console.log(multiplier);
      item.field3 = parseInt(item.field3) * multiplier;
      break;
    }
  }
}

// Calculate the unit price for each item in fact
for (let i = 0; i < fact.length; i++) {
  const item = fact[i];
  item.unitPrice = (parseFloat(item.field4) / parseInt(item.field3)).toFixed(3);
}

// Write the modified facture.json file back to disk
if (fs.existsSync(factureCopyPath)) {
  fs.unlinkSync(factureCopyPath);
}
fs.writeFileSync(factureCopyPath, JSON.stringify(fact));

// on compare les references fournisseurs avec ceux dans le fichier bdd.xlsx et on affiche les references qui ne sont pas dans le fichier bdd.xlsx
const bddPath2 = path.join(appDatatDirPath, "bdd.json");
const bdd2 = JSON.parse(fs.readFileSync(bddPath2, "utf8"));

const refFournisseur = [];
for (let i = 0; i < fact.length; i++) {
  refFournisseur.push(fact[i].field1);
}

const refBdd = [];
for (let i = 0; i < bdd2.length; i++) {
  refBdd.push(bdd[i].ref[" Fourn"]);
}

// on compare les deux tableaux et on affiche les references qui ne sont pas dans le fichier bdd.json
const refNonTrouvees = [];
for (let i = 0; i < refFournisseur.length; i++) {
  if (!refBdd.includes(refFournisseur[i])) {
    refNonTrouvees.push(refFournisseur[i]);
  }
}

const refNonTrouveesPath = path.join(appDatatDirPath, "refNonTrouvees.json");

const refNonTrouvees2 = [];
for (let i = 0; i < fact.length; i++) {
  const item = fact[i];
  if (refNonTrouvees2.includes(item.field1)) {
    continue;
  }
  if (!refBdd.includes(item.field1)) {
    const newItem = {
      ref: item.field1,
      designation: item.field2,
      quantite: item.field3,
      prixTotal: item.field4,
    };
    refNonTrouvees2.push(newItem);
  }
}

fs.writeFileSync(refNonTrouveesPath, JSON.stringify(refNonTrouvees2));

// Get the totalRefNonTrouvee element and calculate the total price of the facture for the references that are not found in bdd.json
const totalRefNonTrouvee = document.getElementById("totalRefNonTrouvee");
totalRefNonTrouvee.innerHTML = "";
let total2 = 0;
for (let i = 0; i < refNonTrouvees2.length; i++) {
  total2 += parseFloat(refNonTrouvees2[i].prixTotal);
}
total2 = total2.toFixed(2);
totalRefNonTrouvee.textContent = "€ " + total2;

// Get the tbody element and clear its contents
const tbody2 = document.getElementById("refNotFind-table");
tbody2.innerHTML = "";

// Create a table row for each item in fact and append it to the tbody element
for (let i = 0; i < refNonTrouvees2.length; i++) {
  const tr2 = document.createElement("tr");
  const tdRef = document.createElement("td");
  const tdDesign = document.createElement("td");
  const tdQuantity = document.createElement("td");
  const tdTotal = document.createElement("td");
  const tdCheckbox = document.createElement("td"); // Ajout de la cellule pour la case à cocher
  const tdCheckboxCreate = document.createElement("td"); // Ajout de la cellule pour la case à cocher

  const checkbox = document.createElement("input"); // Création de la case à cocher
  checkbox.type = "checkbox"; // Définition du type de la case à cocher
  checkbox.addEventListener("change", () => {
    // Ajouter un gestionnaire d'événement pour détecter les changements de la case à cocher
    if (checkbox.checked) {
      tr2.classList.add("checked"); // Ajoutez une classe CSS pour marquer la ligne
    } else {
      tr2.classList.remove("checked"); // Supprimez la classe CSS pour marquer la ligne
    }
  });

  const checkboxCreate = document.createElement("input"); // Création de la case à cocher
  checkboxCreate.type = "checkbox"; // Définition du type de la case à cocher
  checkboxCreate.addEventListener("change", () => {
    // Ajouter un gestionnaire d'événement pour détecter les changements de la case à cocher
    if (checkboxCreate.checked) {
      tr2.classList.add("checkboxCreate"); // Ajoutez une classe CSS pour marquer la ligne
    } else {
      tr2.classList.remove("checkboxCreate"); // Supprimez la classe CSS pour marquer la ligne
    }
  });

  tdRef.textContent = refNonTrouvees2[i].ref;
  tdDesign.textContent = refNonTrouvees2[i].designation;
  tdQuantity.textContent = refNonTrouvees2[i].quantite;
  tdTotal.textContent = refNonTrouvees2[i].prixTotal;
  tdCheckbox.appendChild(checkbox); // Ajout de la case à cocher à la cellule correspondante
  tdCheckboxCreate.appendChild(checkboxCreate); // Ajout de la case à cocher à la cellule correspondante

  tr2.appendChild(tdRef);
  tr2.appendChild(tdDesign);
  tr2.appendChild(tdQuantity);
  tr2.appendChild(tdTotal);
  tr2.appendChild(tdCheckbox); // Add the "À Rentrer" checkbox cell to the row
  tr2.appendChild(tdCheckboxCreate); // Add the "À Créer" checkbox cell to the row

  tbody2.appendChild(tr2);
}

// Get the tbody element and clear its contents
const tbody = document.getElementById("arrivage-table");
tbody.innerHTML = "";

// Create a table row for each item in fact that is found in bdd.json and append it to the tbody element
for (let i = 0; i < fact.length; i++) {
  const item = fact[i];
  const refFournisseur = item.field1;

  // Check if the reference is found in bdd.json
  if (refBdd.includes(refFournisseur)) {
    const tr = document.createElement("tr");
    const td1 = document.createElement("td");
    const td2 = document.createElement("td");
    const td3 = document.createElement("td");
    const td4 = document.createElement("td");
    const td5 = document.createElement("td");

    td1.textContent = item.field1;
    td2.textContent = item.field2;
    td3.textContent = item.unitPrice;
    td4.textContent = item.field3;
    td5.textContent = item.field4;

    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(td4);
    tr.appendChild(td5);

    tbody.appendChild(tr);
  }
}

// Get the totalArrivage element and calculate the total price of the facture for the found references
const totalArrivage = document.getElementById("totalArrivage");
totalArrivage.innerHTML = "";
let total = 0;
for (let i = 0; i < fact.length; i++) {
  const item = fact[i];
  const refFournisseur = item.field1;

  // Check if the reference is found in bdd.json
  if (refBdd.includes(refFournisseur)) {
    total += parseFloat(item.field4);
  }
}
total = total.toFixed(2);
totalArrivage.textContent = "€ " + total;

// Create a new facture2.json file with the modified data from facture.json for the found references
const factureModifPath2 = path.join(appDatatDirPath, "facture2.json");
const fact2 = [];
for (let i = 0; i < fact.length; i++) {
  const item = fact[i];
  const refFournisseur = item.field1;

  // Check if the reference is found in bdd.json
  if (refBdd.includes(refFournisseur)) {
    fact2.push({
      field1: item.field1,
      field3: item.field3,
      unitPrice: item.unitPrice,
    });
  }
}
fs.writeFileSync(factureModifPath2, JSON.stringify(fact2));

// Create a new CSV file with the modified data from fact2.json
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const csvWriter = createCsvWriter({
  path: path.join(appDatatDirPath, "Arrivage.csv"),
  header: [
    { id: "field1", title: "Field 1" },
    { id: "field3", title: "Field 3" },
    { id: "unitPrice", title: "Unit Price" },
  ],
});

csvWriter
  .writeRecords(fact2)
  .then(() => console.log("CSV file created successfully"))
  .catch((error) => console.error("Error creating CSV file:", error));

// Enable the download button for the XLSX file
const downloadButton = document.getElementById("btnArrivage");
downloadButton.disabled = false;

// Create a download link for the XLSX file and set the download attribute to the user's desktop path
downloadButton.addEventListener("click", () => {
  const file = new Blob(
    [fs.readFileSync(path.join(appDatatDirPath, "Arrivage.csv"))],
    {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }
  );
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = path.join(require("os").homedir(), "Desktop", "Arrivage.csv");
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
});

// Si on quitte la page arrivage on supprime les fichiers facture.json et facture2.json et arrivage.xlsx
window.addEventListener("beforeunload", () => {
  const fs = require("fs");
  const path = require("path");

  const appDatatDirPath = getAppDataPath();

  const factureCopytoModifiedPath = path.join(
    appDatatDirPath,
    "facture_copy.json"
  );
  const facture2Path = path.join(appDatatDirPath, "facture2.json");
  const arrivagePath = path.join(appDatatDirPath, "Arrivage.xlsx");
  const refNonTrouveesPath = path.join(appDatatDirPath, "refNonTrouvees.json");

  if (fs.existsSync(refNonTrouveesPath)) {
    fs.unlinkSync(refNonTrouveesPath);
  }

  if (fs.existsSync(facture2Path)) {
    fs.unlinkSync(facture2Path);
  }

  if (fs.existsSync(arrivagePath)) {
    fs.unlinkSync(arrivagePath);
  }

  if (fs.existsSync(factureCopytoModifiedPath)) {
    fs.unlinkSync(factureCopytoModifiedPath);
  }
});
