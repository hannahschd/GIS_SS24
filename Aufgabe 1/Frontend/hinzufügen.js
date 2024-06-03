document.addEventListener('DOMContentLoaded', () => {
  // URL-Parameter 'wish' auslesen
  const wish = new URLSearchParams(window.location.search).get('wish');
  if (wish) {
  // Wenn 'wish' existiert, den Inhalt des h1-Elements ändern und Detaildaten anzeigen
    document.querySelector('h1').textContent = wish;
    displayDetailData(wish);
  }
});

// Detaildaten im Local Storage speichern
  function saveDetailData() {
  // URL-Parameter 'wish' auslesen
  const wish = new URLSearchParams(window.location.search).get('wish');
  if (!wish) return; // Abbrechen, wenn 'wish' nicht existiert

  // Detaildaten von den Eingabefeldern lesen und trimmen
  const detailData = {
    wish,
    marke: document.getElementById('marke').value.trim(),
    link: document.getElementById('link').value.trim(),
    datum: document.getElementById('datum').value.trim(),
    rank: parseInt(document.getElementById('rank').value.trim()),
  };

  localStorage.setItem(`detail_${wish}`, JSON.stringify(detailData));
  alert('Daten gespeichert');
  displayDetailData(wish); // Detaildaten anzeigen
  updateRankList(detailData); // Rangliste aktualisieren
}

// Detaildaten aus dem Local Storage löschen
  function deleteDetail() {
  // URL-Parameter 'wish' auslesen
  const wish = new URLSearchParams(window.location.search).get('wish');
  if (!wish) return; // Abbrechen, wenn 'wish' nicht existiert

  localStorage.removeItem(`detail_${wish}`);
  alert('Daten gelöscht');
  
  // Anzeige zurücksetzen
  document.getElementById('detail-display').innerHTML = '';
  document.getElementById('displayed-image').src = 'Bilder/placeholder.jpg'; // Bild zurücksetzen
  updateRankList({ wish }); // Aus Rangliste entfernen
}

// Detaildaten aus dem Local Storage laden
  function displayDetailData(wish) {
  const detailData = JSON.parse(localStorage.getItem(`detail_${wish}`));
  if (detailData) {
    // Detaildaten anzeigen
    document.getElementById('detail-display').innerHTML = `
      <p>Marke: ${detailData.marke}</p>
      <p>Link: <a href="${detailData.link}" target="_blank">${detailData.link}</a></p>
      <p>Datum: ${detailData.datum}</p>
      <p>Rang: ${detailData.rank}</p>
    `;
    document.getElementById('displayed-image').src = detailData.link || 'Bilder/placeholder.jpg';
  }
}

// Bildquelle ändern oder auf Platzhalter zurücksetzen
  function updateImage() {
  // Link von Eingabefeld lesen und trimmen
  const link = document.getElementById('link').value.trim();
  document.getElementById('displayed-image').src = link || 'Bilder/placeholder.jpg';
}

// Rangliste aus dem Local Storage laden oder neue erstellen
  function updateRankList(detailData) {
  let rankList = JSON.parse(localStorage.getItem('rankList')) || [];
  // Existierenden Eintrag für das gleiche 'wish' entfernen, falls vorhanden
  rankList = rankList.filter(item => item.wish !== detailData.wish);

// Neuen Eintrag hinzufügen, falls 'marke' existiert (keine leeren Einträge)
  if (detailData.marke) {
    rankList.push(detailData);
// Rangliste nach Rang sortieren
    rankList.sort((a, b) => a.rank - b.rank);
  }

// Aktualisierte Rangliste im Local Storage speichern
  localStorage.setItem('rankList', JSON.stringify(rankList));
}

  
  
  
  
  
  