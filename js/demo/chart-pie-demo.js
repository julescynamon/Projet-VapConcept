// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';

var Datastore = require("nedb"),
  db = new Datastore({ filename: "data.db", autoload: true });

var labels = ["Recettes", "Dépenses"];
var monDataset = [];

db.find({},
  function (err, docs) {
    var rec = 0;
    var dep = 0;
    // Boucle sur les lignes
    docs.forEach(el => {
      // Pour l'année
      if (parseInt(el.montant) > 0) { // Si montant positif = recette
        rec += parseInt(el.montant);
      } else { // Sinon = dépense
        dep += parseInt(el.montant);
      }
    }); // Fin boucle
    // on met dans le dataset
    monDataset.push(rec);
    monDataset.push(dep);

    genGraph();
  }
);

genGraph = function () {
  // Pie Chart Example
  var ctx = document.getElementById("myPieChart");
  var myPieChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: monDataset,
        backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc'],
        hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf'],
        hoverBorderColor: "rgba(234, 236, 244, 1)",
      }],
    },
    options: {
      maintainAspectRatio: false,
      tooltips: {
        backgroundColor: "rgb(255,255,255)",
        bodyFontColor: "#858796",
        borderColor: '#dddfeb',
        borderWidth: 1,
        xPadding: 15,
        yPadding: 15,
        displayColors: false,
        caretPadding: 10,
      },
      legend: {
        display: false
      },
      cutoutPercentage: 80,
    },
  });
};
