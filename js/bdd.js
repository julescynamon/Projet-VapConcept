const XLSX = require("xlsx");

// Sélectionnez le formulaire et ajoutez un écouteur d'événements 'submit'
const form = document.getElementById("xlsx-form");
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
    console.log(json);
    // Sauvegardez le JSON dans votre base de données
    saveToDatabase(json);
  };
  reader.readAsArrayBuffer(file);
}

function xlsxToJson(xlsxContent) {
  // Utilisez SheetJS pour lire le contenu du fichier .xlsx
  const workbook = XLSX.read(xlsxContent, { type: "buffer" });

  // Convertissez la première feuille de calcul en JSON
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json(worksheet);

  return json;
}

function saveToDatabase(json) {
  // Implémentez la sauvegarde du JSON dans votre base de données ici
  // Si la sauvegarde réussit, mettez à jour le message de succès, sinon mettez à jour le message d'erreur
}
