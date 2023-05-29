$(() => {

  var date = new Date();
  var mois = [ "01","02","03","04","05","06","07","08","09","10","11","12"];
  var minDate = date.getFullYear() + "-" + mois[date.getMonth()] + "-01"; 
  var maxDate = date.getFullYear() + "-" + mois[date.getMonth()] + "-31"; 

  var Datastore = require("nedb"),
    db = new Datastore({ filename: "data.db", autoload: true });

  const revenusMois = document.getElementById("revenusMois");
  const revenusAn = document.getElementById("revenusAn");
  const depensesMois = document.getElementById("depensesMois");
  const depensesMoisStyle = document.getElementById("depensesMoisStyle");
  const depensesAn = document.getElementById("depensesAn");

  db.find( { },
    function (err, docs) {
      var rec = 0;
      var dep = 0;
      var recm = 0;
      var depm = 0;
      // Boucle sur les lignes
      docs.forEach(el => {
        // Pour l'année
        if(parseInt(el.montant) > 0) { // Si montant positif = recette
          rec += parseInt(el.montant);
        } else { // Sinon = dépense
          dep += parseInt(el.montant);
        }
        // Pour le mois en cours
        if(el.date >= minDate && el.date <= maxDate)
        {
          if (parseInt(el.montant) > 0) {
            // Si montant positif = recette
            recm += parseInt(el.montant);
          } else {
            // Sinon = dépense
            depm += parseInt(el.montant);
          }
        }
      }); // Fin boucle
      // On affiche les données sur la vue
      revenusAn.innerHTML = rec + "€";
      depensesAn.innerHTML = dep + "€";
      revenusMois.innerHTML = recm + "€";

      // Calcul du pourcentage des dépenses
      // Formule : v1 * 100 / v2
      var pourcentage = (depm * 100) / recm;

      depensesMois.innerHTML = Math.trunc(pourcentage) * -1 + "%";
      depensesMoisStyle.style.width = pourcentage + "%";
    }
  );
  
});
