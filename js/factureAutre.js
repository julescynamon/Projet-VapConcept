const XLSX = require("xlsx");

// Get the link element by its ID
const link = document.getElementById("external-link");

// Add an event listener to the link element
link.addEventListener("click", (event) => {
  // Prevent the default behavior of the link element
  event.preventDefault();

  // Open the link in the user's default browser
  require("electron").shell.openExternal(link.href);
});

// Récupération du formulaire
const pdfForm = document.getElementById("excel-form");

// Écouteur d'événement pour la soumission du formulaire
pdfForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // Empêcher le comportement de soumission par défaut

  const fileInput = document.getElementById("excel-file");
  const file = fileInput.files[0];

  if (!file) {
    alert("Veuillez sélectionner un fichier excel.");
    return;
  }

  const jsonData = await convertExcelToJSON(file);
});

// Function to convert Excel file to JSON
async function convertExcelToJSON(excelFile) {
  const workbook = XLSX.readFile(excelFile.path);
  const sheetNames = workbook.SheetNames;
  const jsonData = {};

  for (let i = 0; i < sheetNames.length; i++) {
    const worksheet = workbook.Sheets[sheetNames[i]];
    jsonData[sheetNames[i]] = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
    });
  }

  console.log(jsonData);
  return jsonData;
}
