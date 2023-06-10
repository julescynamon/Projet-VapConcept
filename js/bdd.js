const path = require("path");
const fs = require("fs");

// Get the link element by its ID
const link = document.getElementById("external-link");

// Add an event listener to the link element
link.addEventListener("click", (event) => {
  // Prevent the default behavior of the link element
  event.preventDefault();

  // Open the link in the user's default browser
  require("electron").shell.openExternal(link.href);
});

// Sélectionnez le formulaire et ajoutez un écouteur d'événements 'submit'
const form = document.getElementById("bdd-form");
form.addEventListener("submit", handleFormSubmit);

const csv = require("csvtojson");

function handleFormSubmit(event) {
  event.preventDefault(); // Empêche le rechargement de la page

  // Récupérez le fichier .csv sélectionné
  const fileInput = event.target.elements.file;
  const file = fileInput.files[0];

  // Vérifiez si un fichier a été sélectionné
  if (!file) {
    document.getElementById("bdd-error").textContent =
      "Aucun fichier sélectionné";
    return;
  }

  // Lisez le contenu du fichier .csv
  const reader = new FileReader();
  reader.onload = function (e) {
    const csvContent = e.target.result;

    try {
      // Convert the csv content to JSON
      csv()
        .fromString(csvContent)
        .then((jsonContent) => {
          // Supprimez l'ancien fichier bdd.json s'il existe
          const bddPath = path.join(__dirname, "/documents/bdd.json");
          if (fs.existsSync(bddPath)) {
            fs.unlinkSync(bddPath);
          }

          // Créez un nouveau fichier bdd.json avec le contenu JSON
          fs.writeFileSync(bddPath, JSON.stringify(jsonContent));

          // Affichez un message à l'utilisateur pour indiquer que la base de données a bien été importée
          document.getElementById("bdd-success").textContent =
            "La base de données a bien été importée";
        });
    } catch (error) {
      // Affichez un message d'erreur à l'utilisateur
      document.getElementById("bdd-error").textContent =
        "Une erreur s'est produite lors de l'importation de la base de données";
      console.error(error);
    }
  };
  reader.readAsText(file);
}
