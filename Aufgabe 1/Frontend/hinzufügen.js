document.addEventListener('DOMContentLoaded', () => {
  // URL-Parameter 'wish' auslesen
  const wish = new URLSearchParams(window.location.search).get('wish');
  if (wish) {
    // Wenn 'wish' existiert, den Inhalt des h1-Elements ändern und Detaildaten anzeigen
    document.querySelector('h1').textContent = wish;
    displayDetailData(wish);
  }
});

// Detaildaten im Local Storage und auf dem Server speichern
async function saveDetailData() {
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

  // Sendet die Detaildaten an den Server
  fetch('http://127.0.0.1:3000/details', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(detailData),
  })
    .then(response => response.text())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
}

// Detaildaten aus dem Local Storage und vom Server löschen
async function deleteDetail() {
  // URL-Parameter 'wish' auslesen
  const wish = new URLSearchParams(window.location.search).get('wish');
  if (!wish) return; // Abbrechen, wenn 'wish' nicht existiert

  localStorage.removeItem(`detail_${wish}`);
  alert('Daten gelöscht');

  // Anzeige zurücksetzen
  document.getElementById('detail-display').innerHTML = '';
  document.getElementById('displayed-image').src = 'Bilder/placeholder.jpg'; // Bild zurücksetzen
  updateRankList({ wish }); // Aus Rangliste entfernen

  // Sendet die Löschanfrage an den Server
  fetch(`http://127.0.0.1:3000/details?wish=${wish}`, {
    method: 'DELETE',
  })
    .then(response => response.text())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
}

// Detaildaten aus dem Local Storage oder vom Server laden
async function displayDetailData(wish) {
  const detailData = JSON.parse(localStorage.getItem(`detail_${wish}`));
  
  if (!detailData) {
    // Wenn keine Daten im Local Storage vorhanden sind, vom Server laden
    const response = await fetch(`http://127.0.0.1:3000/details?wish=${wish}`);
    if (response.ok) {
      const detailData = await response.json();
      localStorage.setItem(`detail_${wish}`, JSON.stringify(detailData)); // Im Local Storage speichern
      renderDetailData(detailData);
    } else {
      console.error('Error fetching detail data:', response.statusText);
    }
  } else {
    renderDetailData(detailData);
  }
}

// Funktion zum Rendern der Detaildaten
function renderDetailData(detailData) {
  document.getElementById('detail-display').innerHTML = `
    <p>Marke: ${detailData.marke}</p>
    <p>Link: <a href="${detailData.link}" target="_blank">${detailData.link}</a></p>
    <p>Datum: ${detailData.datum}</p>
    <p>Rang: ${detailData.rank}</p>
  `;
  document.getElementById('displayed-image').src = detailData.link || 'Bilder/placeholder.jpg';
}

// Bildquelle ändern oder auf Platzhalter zurücksetzen
function updateImage() {
  // Link von Eingabefeld lesen und trimmen
  const link = document.getElementById('link').value.trim();
  document.getElementById('displayed-image').src = link || 'Bilder/placeholder.jpg';
}

// Rangliste aus dem Local Storage oder vom Server laden und aktualisieren
async function updateRankList(detailData) {
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

  // Aktualisierte Rangliste an den Server senden
  fetch('http://127.0.0.1:3000/rankList', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(rankList),
  })
    .then(response => response.text())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
}


  
  
  
  
  
  