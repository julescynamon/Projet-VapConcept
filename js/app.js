const { ipcRenderer } = require('electron')
const ipc = ipcRenderer

const reduceBtn = document.getElementById("reduceBtn");
const sizeBtn = document.getElementById("sizeBtn");
const closeBtn = document.getElementById("closeBtn");

reduceBtn.addEventListener("click", () => {
  ipc.send("reduceApp");
});

sizeBtn.addEventListener("click", () => {
  ipc.send("sizeApp");
});

closeBtn.addEventListener("click", () => {
  ipc.send("closeApp");
});

// Gestion ajout ligne dans registre + Prépa BDD
const btnAddLigne = document.getElementById("btnSaveLigne");
if (btnAddLigne != null)
{
  btnAddLigne.addEventListener('click', () => {
    // Les inputs du formulaire ajout d'une ligne
    const dateVal = document.getElementById("dateLigne");
    const montantVal = document.getElementById("montantLigne");
    const infoVal = document.getElementById("infoLigne");
    // Préparer l'objet pour l'insert BDD
    var _myrec = {
      date: dateVal.value,
      montant: montantVal.value,
      info: infoVal.value,
    };
    
    ipc.send("addLigneToDb", _myrec);
  })
}
