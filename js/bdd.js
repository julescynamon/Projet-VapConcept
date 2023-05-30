// Sélectionnez le formulaire et ajoutez un écouteur d'événements 'submit'
const form = document.getElementById("csv-form");
form.addEventListener("submit", handleFormSubmit);

function handleFormSubmit(event) {
  event.preventDefault(); // Empêche le rechargement de la page

  // Récupérez le fichier .xlsx sélectionné
  const fileInput = event.target.elements.file;
  const file = fileInput.files[0];

  // Vérifiez si un fichier a été sélectionné
  if (!file) {
    document.getElementById("bdd-error").textContent =
      "Aucun fichier sélectionné";
    return;
  }

  // Lisez le contenu du fichier .xlsx
  const reader = new FileReader();
  reader.onload = function (e) {
    const xlsxContent = e.target.result;

    // Convertissez le .xlsx en JSON
    const json = xlsxToJson(xlsxContent);

    // Sauvegardez le JSON dans votre base de données
    saveToDatabase(json);
  };
  reader.readAsArrayBuffer(file);
}

function xlsxToJson(xlsxContent) {
  // Implémentez la conversion de .xlsx en JSON ici
  const XLSX = require("xlsx");

  const workbook = XLSX.readFile("fichier.xlsx");
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  console.log(jsonData);
}

function saveToDatabase(json) {
  // Implémentez la sauvegarde du JSON dans votre base de données ici
  // Si la sauvegarde réussit, mettez à jour le message de succès, sinon mettez à jour le message d'erreur
}
