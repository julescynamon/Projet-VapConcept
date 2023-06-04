const path = require("path");
const fs = require("fs");

// je récupère mon fichier json
const factureModifPath = path.join(__dirname, "/documents/facture.json");
// je le convertit en objet javascript
const fact = JSON.parse(fs.readFileSync(factureModifPath, "utf8"));

const replacements = {
  "par 10": 10,
  "10 pièces": 10,
  "10 pieces": 10,
  "par 2": 2,
  "2 pièces": 2,
  "2 pieces": 2,
  "par 9": 9,
  "9 pièces": 9,
  "9 pieces": 9,
  "par 12": 12,
  "12 pièces": 12,
  "12 pieces": 12,
  "par 6": 6,
  "6 pièces": 6,
  "6 pieces": 6,
  "par 5": 5,
  "5 pièces": 5,
  "5 pieces": 5,
  "par 4": 4,
  "4 pièces": 4,
  "4 pieces": 4,
  "par 3": 3,
  "3 pièces": 3,
  "3 pieces": 3,
  "par 2": 2,
  "2 pièces": 2,
  "2 pieces": 2,
};

for (let i = 0; i < fact.length; i++) {
  const item = fact[i];
  for (const [string, multiplier] of Object.entries(replacements)) {
    if (item.field2.toLowerCase().includes(string.toLowerCase())) {
      item.field3 = parseInt(item.field3) * multiplier;
    }
  }
}

for (let i = 0; i < fact.length; i++) {
  const item = fact[i];
  item.unitPrice = (parseFloat(item.field4) / parseInt(item.field3)).toFixed(2);
}

console.log(fact);

if (fs.existsSync(factureModifPath)) {
  fs.unlinkSync(factureModifPath);
}
fs.writeFileSync(factureModifPath, JSON.stringify(fact));

const tbody = document.getElementById("arrivage-table");
tbody.innerHTML = "";
// Créez les lignes du tableau avec les données de l'arrivage
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

// on récupère le prix total de la facture
const totalArrivage = document.getElementById("totalArrivage");
totalArrivage.innerHTML = "";
let total = 0;
for (let i = 0; i < fact.length; i++) {
  total += parseFloat(fact[i].field4);
}
total = total.toFixed(2);
totalArrivage.textContent = "€ " + total;

// je cree un nouveau fichier json avec les données de l'arrivage sans la colonne "field4"
const factureModifPath2 = path.join(__dirname, "/documents/facture2.json");
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

// Une fois l'affichage ok je convertit le fichier json en xlsx en supprimant la colonne "field4" et j'active le bouton de téléchargement du fichier xlsx
const XLSX = require("xlsx");
const workbook = XLSX.utils.book_new();
const sheet = XLSX.utils.json_to_sheet(fact2);
XLSX.utils.book_append_sheet(workbook, sheet, "Arrivage");
XLSX.writeFile(workbook, "/documents/Arrivage.xlsx");
const downloadArrivage = document.getElementById("btnArrivage");
downloadArrivage.disabled = false;

// lors du clique sur le bouton de téléchargement du fichier xlsx je supprime le fichier json et je désactive le bouton de téléchargement du fichier xlsx et j'exporte le fichier xlsx

const downloadArrivage = async () => {
  const response = await fetch(__dirname, "/Arrivage.xlsx");
  const blob = await response.blob();
  const url = window.URL.createObjectURL(new Blob([blob]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "your_file_name.xlsx");
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
};
