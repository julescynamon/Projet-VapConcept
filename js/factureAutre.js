import PDFParser from "pdf2json";

const pdfForm = document.getElementById("pdf-form");

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

const convertPDFToJSON = (file) => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", (errData) =>
      reject(errData.parserError)
    );
    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      const textContent = pdfParser.getRawTextContent();
      const lines = textContent.split("\n");

      const jsonData = {
        ref: lines[0],
        designation: lines[1],
        quantité: lines[2],
        UnitPrice: lines[3],
        totalTTC: lines[4],
      };

      resolve(jsonData);
    });

    pdfParser.loadPDF(file);
  });
};
