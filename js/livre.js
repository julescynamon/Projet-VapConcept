$(() => {

  var mois = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Aout","Septembre","Octobre","Novembre","Décembre"];

  // Affichage mois en cours
  var selectedDate = new Date();
  var dateShowed = document.getElementById("dateShowed");
  dateShowed.innerHTML =
    mois[selectedDate.getMonth()] + " " + selectedDate.getFullYear();

  // Gestion des btns prev & next
  var prevMonth = document.getElementById("prevMonth");
  var nextMonth = document.getElementById("nextMonth");

  // Gestion du clic sur ces btns + Modif du mois
  prevMonth.addEventListener("click", () => {
    selectedDate = new Date(selectedDate.setMonth(selectedDate.getMonth() - 1));
    dateShowed.innerHTML =
      mois[selectedDate.getMonth()] + " " + selectedDate.getFullYear();
    loadTableLines(selectedDate);
  });
  nextMonth.addEventListener("click", () => {
    selectedDate = new Date(selectedDate.setMonth(selectedDate.getMonth() + 1));
    dateShowed.innerHTML =
      mois[selectedDate.getMonth()] + " " + selectedDate.getFullYear();
    loadTableLines(selectedDate);
  });

  loadTableLines(selectedDate);

  const exportPdfBtn = document.getElementById("genPdf");
  exportPdfBtn.addEventListener('click', () => {
    ipc.send('exportPdf');
  });
});

loadTableLines = function (date) {
  var mois = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
  ];
  var minDate = date.getFullYear() + "-" + mois[date.getMonth()] + "-01"; // 2000-06-01
  var maxDate = date.getFullYear() + "-" + mois[date.getMonth()] + "-31"; // 2000-06-31

  // Charger la BDD
  var Datastore = require("nedb"),
    db = new Datastore({ filename: "data.db", autoload: true });

  // Récupérer le contenu de la BDD
  // db.find({}, function (err, docs) { // BACKUP
  // Filtre par date (mois sélectionné)
  db.find({ $and: [{ date: { $gte: minDate } }, { date: { $lte: maxDate } }] }, function (err, docs) {
    console.log("*** docs = ", docs);

    var tableRegistre = document.getElementById("tableRegistre");
    var tableRows = tableRegistre.querySelectorAll("thead > tr");

    // On supprime le contenu du tableau
    tableRows.forEach((el, i) => {
      if (i > 0) el.parentNode.removeChild(el);
    });

    // On construit le contenu du tableau
    docs.forEach((el) => {
      // Création d'une ligne
      var row = tableRegistre.insertRow(1);
      // Création des cellules
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);
      var cell3 = row.insertCell(2);
      var cell4 = row.insertCell(3);
      // Injecter le contenu des cellules
      cell1.innerHTML = el.date;
      cell2.innerHTML = el.montant > 0 ? '<span class="badge bg-success text-white">' + el.montant + '</span>' : '<span class="badge bg-danger text-white">' + el.montant + '</span>';
      cell3.innerHTML = el.info;
      cell4.innerHTML =
        '<button id="' +
        el._id +
        '" class="btn btn-danger"><i class="fa fa-trash"></i></button>';
      // Gestion des btns d'action
      var btn = document.getElementById(el._id);
      btn.addEventListener("click", () => {
        console.log("*** Demande de supp de ", el._id);
        db.remove({ _id: el._id }, function (err, nbRemoved) {
          if (err != null) {
            console.log("*** err = ", err);
          }
          console.log(nbRemoved + " lines removed!");
          ipc.send("reload");
        });
      });
    });
  });
}
