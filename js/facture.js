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

    // Convertissez le .csv en JSON
    const json = csvToJson(csvContent);
    console.log(json);

    try {
      // Supprimez l'ancien fichier facture.json s'il existe
      const facturePath = path.join(__dirname, "facture.json");
      if (fs.existsSync(facturePath)) {
        fs.unlinkSync(facturePath);
      }

      // Créez un nouveau fichier facture.json avec le contenu JSON
      fs.writeFileSync(facturePath, JSON.stringify(json));

      // Affichez un message à l'utilisateur pour indiquer que la facture a bien été importée
      document.getElementById("facture-success").textContent =
        "La base de données a bien été importée";
    } catch (error) {
      // Affichez un message d'erreur à l'utilisateur
      document.getElementById("facture-error").textContent =
        "Une erreur s'est produite lors de l'importation de la facture";
      console.error(error);
    }
  };
  reader.readAsText(file);
}

function csvToJson(csvContent) {
  // Utilisez PapaParse pour lire le contenu du fichier .csv
  const parsedData = Papa.parse(csvContent, { header: true });

  // Récupérez les données JSON
  const json = parsedData.data;

  return json;
}
