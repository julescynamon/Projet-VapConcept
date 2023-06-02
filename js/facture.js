const Papa = require("papaparse");
const path = require("path");
const fs = require("fs");

// Sélectionnez le formulaire et ajoutez un écouteur d'événements 'submit'
const form = document.getElementById("csv-form");
form.addEventListener("submit", handleFormSubmit);

function handleFormSubmit(event) {
  event.preventDefault(); // Empêche le rechargement de la page

  // Récupérez le fichier .csv sélectionné
  const fileInput = event.target.elements.file;
  const file = fileInput.files[0];

  // Vérifiez si un fichier a été sélectionné
  if (!file) {
    document.getElementById("facture-error").textContent =
      "Aucun fichier sélectionné";
    return;
  }

  // Lisez le contenu du fichier .csv
  const reader = new FileReader();
  reader.onload = function (e) {
    const csvContent = e.target.result;

    try {
      // Supprimez l'ancien fichier facture.csv s'il existe
      const facturePath = path.join(__dirname, "facture.csv");
      if (fs.existsSync(facturePath)) {
        fs.unlinkSync(facturePath);
      }

      // Créez un nouveau fichier facture.csv avec le contenu CSV
      fs.writeFileSync(facturePath, csvContent);

      // Affichez un message à l'utilisateur pour indiquer que la base de données a bien été importée
      document.getElementById("facture-success").textContent =
        "La base de données a bien été importée";

      // Affichez les données de la facture dans un tableau
      displayFactureData(csvContent);
    } catch (error) {
      // Affichez un message d'erreur à l'utilisateur
      document.getElementById("facture-error").textContent =
        "Une erreur s'est produite lors de l'importation de la base de données";
      console.error(error);
    }
  };
  reader.readAsText(file);
}

// on réxupère les données de la facture et on les affiches dans le tableau
function displayFactureData(csvContent) {
  const csvData = csvContent;
  const lines = csvData.split("\n");

  const jsonData = [];

  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i].split(";");
    const object = {};

    for (let j = 0; j < currentLine.length; j++) {
      const key = "field" + (j + 1);
      object[key] = currentLine[j];
    }
    // Si la dernière ligne est vide, ne l'ajoutez pas au tableau
    if (
      i === lines.length - 1 &&
      currentLine.length === 1 &&
      currentLine[0] === ""
    ) {
      continue;
    }
    jsonData.push(object);
  }

  console.log(jsonData);

  const tbody = document.getElementById("facture-table");
  tbody.innerHTML = "";
  // Créez les lignes du tableau avec les données de la facture
  for (let i = 0; i < jsonData.length; i++) {
    const tr = document.createElement("tr");
    const td1 = document.createElement("td");
    const td2 = document.createElement("td");
    const td3 = document.createElement("td");
    const td4 = document.createElement("td");

    td1.textContent = jsonData[i].field1;
    td2.textContent = jsonData[i].field2;
    td3.textContent = jsonData[i].field3;
    td4.textContent = jsonData[i].field4;

    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(td4);

    tbody.appendChild(tr);
  }

  console.log(jsonData[0].field4);
  // on récupère le prix total de la facture
  const totalFact = document.getElementById("totalFact");
  totalFact.innerHTML = "";
  let total = 0;
  for (let i = 0; i < jsonData.length; i++) {
    total += parseFloat(jsonData[i].field4);
    console.log(total);
  }
  total = total.toFixed(2);
  totalFact.textContent = "€ " + total;
}
