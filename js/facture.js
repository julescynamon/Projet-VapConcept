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
    document.getElementById("facture-error").textContent =
      "Aucun fichier sélectionné";
    return;
  }

  // Lisez le contenu du fichier .xlsx
  const reader = new FileReader();
  reader.onload = function (e) {
    const csvContent = e.target.result;

    // Convertissez le .xlsx en JSON
    const json = csvToJson(csvContent);
    console.log(json);

    try {
      // Supprimez l'ancien fichier bdd.json s'il existe
      const facturePath = path.join(__dirname, "facture.json");
      if (fs.existsSync(facturePath)) {
        fs.unlinkSync(facturePath);
      }

      // Créez un nouveau fichier bdd.json avec le contenu JSON
      fs.writeFileSync(facturePath, JSON.stringify(json));

      // Affichez un message à l'utilisateur pour indiquer que la base de données a bien été importée
      document.getElementById("facture-success").textContent =
        "La base de données a bien été importée";
    } catch (error) {
      // Affichez un message d'erreur à l'utilisateur
      document.getElementById("facture-error").textContent =
        "Une erreur s'est produite lors de l'importation de la base de données";
      console.error(error);
    }
  };
  reader.readAsArrayBuffer(file);
}
