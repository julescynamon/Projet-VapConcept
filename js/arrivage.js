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

fs.writeFileSync(factureModifPath, JSON.stringify(fact));
