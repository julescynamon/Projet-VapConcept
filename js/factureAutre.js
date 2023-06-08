const path = require("path");
const fs = require("fs");
const pdfjsLib = require("pdfjs-dist");

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "./node_modules/pdfjs-dist/build/pdf.worker.js";

// Fonction pour convertir un fichier PDF en JSON
async function convertPDFToJSON(pdfFile) {
  const pdfData = await readFileAsArrayBuffer(pdfFile);

  // Fonction pour lire le fichier PDF sous forme de ArrayBuffer
  function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result);
      };

      reader.onerror = reject;

      reader.readAsArrayBuffer(file);
    });
  }

  // Fonction pour extraire les données du PDF
  async function extractDataFromPDF(pdfData) {
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    const totalPages = pdf.numPages;
    const extractedData = [];

    // Parcourir chaque page du PDF
    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const pageText = await page.getTextContent();
      const pageItems = pageText.items;

      console.log(pageText);

      // Analyser les éléments de texte pour extraire les données
      // Utilisez des expressions régulières ou d'autres méthodes pour extraire les données souhaitées
      // Dans cet exemple, nous supposons un modèle de facture avec des colonnes prédéfinies
      const rows = [];
      for (const item of pageItems) {
        const { str } = item;

        // Exemple de modèle de facture avec des colonnes prédéfinies
        const columns = str.split("\n");

        if (columns.length >= 5) {
          const [reference, designation, quantity, unitPrice, totalPrice] =
            columns;

          // Créer un objet JSON pour chaque ligne de la facture
          const invoiceRow = {
            reference: reference.trim(),
            designation: designation.trim(),
            quantity: quantity.trim(),
            unitPrice: unitPrice.trim(),
            totalPrice: totalPrice.trim(),
          };

          rows.push(invoiceRow);
        }
      }

      extractedData.push(...rows);
    }

    return extractedData;
  }

  // Appel de la fonction pour extraire les données du PDF
  const extractedData = await extractDataFromPDF(pdfData);

  return extractedData;
}

// Récupération du formulaire
const pdfForm = document.getElementById("pdf-form");

// Écouteur d'événement pour la soumission du formulaire
pdfForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // Empêcher le comportement de soumission par défaut

  const fileInput = document.getElementById("pdf-file");
  const file = fileInput.files[0];

  if (!file) {
    alert("Veuillez sélectionner un fichier PDF.");
    return;
  }

  const jsonData = await convertPDFToJSON(file);

  console.log(jsonData);
});
