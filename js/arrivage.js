const path = require("path");
const fs = require("fs");

// Get the path to the facture.json file using path.join()
const factureModifPath = path.join(__dirname, "documents", "facture.json");

// Read the facture.json file and parse it as a JavaScript object
const fact = JSON.parse(fs.readFileSync(factureModifPath, "utf8"));

// Define the replacements object
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
if (fs.existsSync(factureModifPath)) {
  fs.unlinkSync(factureModifPath);
}
fs.writeFileSync(factureModifPath, JSON.stringify(fact));

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
