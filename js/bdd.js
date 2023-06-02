const path = require("path");
const fs = require("fs");

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

    try {
      // Supprimez l'ancien fichier bdd.json s'il existe
      const bddPath = path.join(__dirname, "bdd.xlsx");
      if (fs.existsSync(bddPath)) {
        fs.unlinkSync(bddPath);
      }

      // Créez un nouveau fichier bdd.json avec le contenu JSON
      fs.writeFileSync(bddPath, xlsxContent);

      // Affichez un message à l'utilisateur pour indiquer que la base de données a bien été importée
      document.getElementById("bdd-success").textContent =
        "La base de données a bien été importée";
    } catch (error) {
      // Affichez un message d'erreur à l'utilisateur
      document.getElementById("bdd-error").textContent =
        "Une erreur s'est produite lors de l'importation de la base de données";
      console.error(error);
    }
  };
  reader.readAsText(file);
}
