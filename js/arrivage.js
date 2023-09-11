const path = require("path");
const fs = require("fs");

const facturePath = path.join(__dirname, "documents", "facture.json");
const factureCopyPath = path.join(__dirname, "documents", "facture_copy.json");

// Lire le contenu du fichier facture.json
const factureContent = fs.readFileSync(facturePath, "utf8");

// Écrire le contenu dans un nouveau fichier facture_copy.json
fs.writeFileSync(factureCopyPath, factureContent);

// Read the facture.json file and parse it as a JavaScript object
const fact = JSON.parse(fs.readFileSync(factureCopyPath, "utf8"));

// Define the replacements object
const replacements = {
  "par 20": 20,
  "20pcs": 20,
  "20 pièces": 20,
  "20 pieces": 20,
  "par 10": 10,
  "10 pièces": 10,
  "10 pieces": 10,
  "10pcs": 10,
  "pack de 10": 10,
  "par 2": 2,
  "2pcs": 2,
  "pack de 2": 2,
  "2 pièces": 2,
  "2 pieces": 2,
  "par 9": 9,
  "9pcs": 9,
  "pack de 9": 9,
  "9 pièces": 9,
  "9 pieces": 9,
  "par 12": 12,
  "12pcs": 12,
  "pack de 12": 12,
  "12 pièces": 12,
  "12 pieces": 12,
  "par 6": 6,
  "pack de 6": 6,
  "6pcs": 6,
  "6 pièces": 6,
  "6 pieces": 6,
  "par 5": 5,
  "pack de 5": 5,
  "5pcs": 5,
  "5 pièces": 5,
  "5 pieces": 5,
  "par 4": 4,
  "pack de 4": 4,
  "4pcs": 4,
  "4 pièces": 4,
  "4 pieces": 4,
  "par 3": 3,
  "pack de 3": 3,
  "3pcs": 3,
  "3 pièces": 3,
  "3 pieces": 3,
  "par 2": 2,
  "pack de 2": 2,
  "2pcs": 2,
  "2 pièces": 2,
  "2 pieces": 2,
};

// Replace the strings in fact[i].field2 with their corresponding multipliers
for (let i = 0; i < fact.length; i++) {
  const item = fact[i];
  for (const [string, multiplier] of Object.entries(replacements)) {
    if (item.field2.toLowerCase().includes(string.toLowerCase())) {
      item.field3 = parseInt(item.field3) * multiplier;
    }
  }
}

// Calculate the unit price for each item in fact
for (let i = 0; i < fact.length; i++) {
  const item = fact[i];
  item.unitPrice = (parseFloat(item.field4) / parseInt(item.field3)).toFixed(2);
}

// Write the modified facture.json file back to disk
if (fs.existsSync(factureCopyPath)) {
  fs.unlinkSync(factureCopyPath);
}
fs.writeFileSync(factureCopyPath, JSON.stringify(fact));

// Get the tbody element and clear its contents
const tbody = document.getElementById("arrivage-table");
tbody.innerHTML = "";

// Create a table row for each item in fact and append it to the tbody element
for (let i = 0; i < fact.length; i++) {
  const tr = document.createElement("tr");
  const td1 = document.createElement("td");
  const td2 = document.createElement("td");
  const td3 = document.createElement("td");
  const td4 = document.createElement("td");
  const td5 = document.createElement("td");

  td1.textContent = fact[i].field1;
  td2.textContent = fact[i].field2;
  td3.textContent = fact[i].unitPrice;
  td4.textContent = fact[i].field3;
  td5.textContent = fact[i].field4;

  tr.appendChild(td1);
  tr.appendChild(td2);
  tr.appendChild(td3);
  tr.appendChild(td4);
  tr.appendChild(td5);

  tbody.appendChild(tr);
}

// Get the totalArrivage element and calculate the total price of the facture
const totalArrivage = document.getElementById("totalArrivage");
totalArrivage.innerHTML = "";
let total = 0;
for (let i = 0; i < fact.length; i++) {
  total += parseFloat(fact[i].field4);
}
total = total.toFixed(2);
totalArrivage.textContent = "€ " + total;

// Create a new facture2.json file with the modified data from facture.json
const factureModifPath2 = path.join(__dirname, "documents", "facture2.json");
const fact2 = [];
for (let i = 0; i < fact.length; i++) {
  const item = fact[i];
  fact2.push({
    field1: item.field1,
    field3: item.field3,
    unitPrice: item.unitPrice,
  });
}
fs.writeFileSync(factureModifPath2, JSON.stringify(fact2));

// Create an XLSX file from the data in facture2.json
const XLSX = require("xlsx");
const workbook = XLSX.utils.book_new();
const sheet = XLSX.utils.json_to_sheet(fact2);
XLSX.utils.book_append_sheet(workbook, sheet, "Arrivage");
XLSX.writeFile(workbook, path.join(__dirname, "Arrivage.xlsx"));

// Enable the download button for the XLSX file
const downloadButton = document.getElementById("btnArrivage");
downloadButton.disabled = false;

// Create a download link for the XLSX file and set the download attribute to the user's desktop path
downloadButton.addEventListener("click", () => {
  const file = new Blob(
    [fs.readFileSync(path.join(__dirname, "Arrivage.xlsx"))],
    {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }
  );
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = path.join(require("os").homedir(), "Desktop", "Arrivage.xlsx");
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
});

// une fois l'arrivage effectué on compare les references fournisseurs avec ceux dans le fichier bdd.xlsx et on affiche les references qui ne sont pas dans le fichier bdd.xlsx
const bddPath = path.join(__dirname, "documents", "bdd.json");
const bdd = JSON.parse(fs.readFileSync(bddPath, "utf8"));

const refFournisseur = [];
for (let i = 0; i < fact.length; i++) {
  refFournisseur.push(fact[i].field1);
}

const refBdd = [];
for (let i = 0; i < bdd.length; i++) {
  refBdd.push(bdd[i].ref[" Fourn"]);
}

// on compare les deux tableaux et on affiche les references qui ne sont pas dans le fichier bdd.json
const refNonTrouvees = [];
for (let i = 0; i < refFournisseur.length; i++) {
  if (!refBdd.includes(refFournisseur[i])) {
    refNonTrouvees.push(refFournisseur[i]);
  }
}

const refNonTrouveesPath = path.join(
  __dirname,
  "documents",
  "refNonTrouvees.json"
);

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
      prixUnitaire: item.unitPrice,
      prixTotal: item.field4,
    };
    refNonTrouvees2.push(newItem);
  }
}

fs.writeFileSync(refNonTrouveesPath, JSON.stringify(refNonTrouvees2));

// Get the tbody element and clear its contents
const tbody2 = document.getElementById("refNotFind-table");
tbody2.innerHTML = "";

// Create a table row for each item in fact and append it to the tbody element
for (let i = 0; i < refNonTrouvees2.length; i++) {
  const tr2 = document.createElement("tr");
  const tdCheckbox = document.createElement("td"); // Ajout de la cellule pour la case à cocher
  const tdRef = document.createElement("td");
  const tdDesign = document.createElement("td");
  const tdUnit = document.createElement("td");
  const tdQuantity = document.createElement("td");
  const tdTotal = document.createElement("td");

  const checkbox = document.createElement("input"); // Création de la case à cocher
  checkbox.type = "checkbox"; // Définition du type de la case à cocher
  checkbox.addEventListener("change", () => {
    // Ajouter un gestionnaire d'événement pour détecter les changements de la case à cocher
    if (checkbox.checked) {
      // Si la case à cocher est cochée
      // Faites quelque chose ici, par exemple, marquez la ligne comme étant traitée

      tr2.classList.add("checked"); // Ajoutez une classe CSS pour marquer la ligne
    } else {
      // Si la case à cocher est décochée
      // Faites quelque chose ici, par exemple, marquez la ligne comme non traitée
      tr2.classList.remove("checked"); // Supprimez la classe CSS pour marquer la ligne
    }
  });

  tdCheckbox.appendChild(checkbox); // Ajout de la case à cocher à la cellule correspondante
  tdRef.textContent = refNonTrouvees2[i].ref;
  tdDesign.textContent = refNonTrouvees2[i].designation;
  tdUnit.textContent = refNonTrouvees2[i].prixUnitaire;
  tdQuantity.textContent = refNonTrouvees2[i].quantite;
  tdTotal.textContent = refNonTrouvees2[i].prixTotal;

  tr2.appendChild(tdRef);
  tr2.appendChild(tdDesign);
  tr2.appendChild(tdUnit);
  tr2.appendChild(tdQuantity);
  tr2.appendChild(tdTotal);
  tr2.appendChild(tdCheckbox); // Ajout de la cellule de la case à cocher à la ligne

  tbody2.appendChild(tr2);
}

// Si on quitte la page arrivage on supprime les fichiers facture.json et facture2.json et arrivage.xlsx
window.addEventListener("beforeunload", () => {
  const fs = require("fs");
  const path = require("path");

  const factureCopytoModifiedPath = path.join(
    __dirname,
    "documents",
    "facture_copy.json"
  );
  const facture2Path = path.join(__dirname, "documents", "facture2.json");
  const arrivagePath = path.join(__dirname, "Arrivage.xlsx");
  const refNonTrouveesPath = path.join(
    __dirname,
    "documents",
    "refNonTrouvees.json"
  );

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
