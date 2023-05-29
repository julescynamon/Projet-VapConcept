// Quand le contenu est chargé
window.addEventListener("DOMContentLoaded", () => {
  // fonction qui remplace le texte dans le sélecteur par le texte
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };
  // Pour chaque type, on remplace le texte par la version
  for (const type of ["chrome", "node", "electron"]) {
    replaceText(`${type}-version`, process.versions[type]);
  }
});
