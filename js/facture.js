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
      const appDatatDirPath = getAppDataPath();
      // Supprimez l'ancien fichier facture.csv s'il existe
      const facturePath = path.join(appDatatDirPath, "facture.csv");
      if (fs.existsSync(facturePath)) {
        fs.unlinkSync(facturePath);
      }

      // Créez un nouveau fichier facture.csv avec le contenu CSV
      fs.writeFileSync(facturePath, csvContent);

      // Affichez un message à l'utilisateur pour indiquer que la facture a bien été importée
      document.getElementById("facture-success").textContent =
        "La facture a bien été importée";

      // Affichez les données de la facture dans un tableau
      displayFactureData(csvContent);
    } catch (error) {
      // Affichez un message d'erreur à l'utilisateur
      document.getElementById("facture-error").textContent =
        "Une erreur s'est produite lors de l'importation de la facture";
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

    // on récupère le prix unitaire et on l'ajoute au tableau
    const field3 = parseFloat(currentLine[2]);
    const field4 = parseFloat(currentLine[3]);
    if (!isNaN(field3) && !isNaN(field4) && field3 !== 0) {
      const unitPrice = (field4 / field3).toFixed(3);
      object["unitPrice"] = unitPrice;
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

  const appDatatDirPath = getAppDataPath();
  // on crèe un fichier json avec les données de la facture
  const factureModifPath = path.join(appDatatDirPath, "facture.json");
  if (fs.existsSync(factureModifPath)) {
    fs.unlinkSync(factureModifPath);
  }
  fs.writeFileSync(factureModifPath, JSON.stringify(jsonData));
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
}
