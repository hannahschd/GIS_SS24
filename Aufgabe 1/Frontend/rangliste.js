// Wartet, bis das gesamte Dokument geladen ist, bevor der Code ausgeführt wird
document.addEventListener('DOMContentLoaded', (event) => {
  // Ruft die Funktion auf, um die Rangliste anzuzeigen
  displayRankList();
});

// Funktion, um die Rangliste anzuzeigen
async function displayRankList() {
  const rankListDiv = document.getElementById('rank-list');
  // Holt die 'rankList' vom Server
  let rankList = await fetch('http://127.0.0.1:3000/rankList')
    .then(response => response.json())
    .catch(error => {
      console.error('Error fetching rankList:', error);
      return JSON.parse(localStorage.getItem('rankList')) || [];
    });
  
  // Löscht den aktuellen Inhalt von 'rank-list', um die aktualisierte Rangliste anzuzeigen
  rankListDiv.innerHTML = '';
  
  // Durchläuft jedes Element in der Rangliste
  rankList.forEach((item, index) => {
    // Erstellt ein neues <div>-Element für jedes Ranglistenelement
    const listItem = document.createElement('div');
    // Fügt dem <div>-Element die Klasse 'rank-item' hinzu
    listItem.className = 'rank-item';
    // Fügt dem <div> den HTML-Inhalt hinzu, der den Wunsch, den Rang und den Löschen-Button anzeigt
    listItem.innerHTML = `
      <p>${index + 1}. <a href="hinzufügen.html?wish=${item.wish}" target="_blank">${item.wish}</a> - Rang: ${item.rank}</p>
      <button onclick="deleteItem(${index})">Löschen</button>
    `;
    // Fügt das <div>-Element in das 'rank-list'-Element ein
    rankListDiv.appendChild(listItem);
  });
}

// Funktion zum Löschen eines Artikels
async function deleteItem(index) {
  // Holt die 'rankList' vom Server
  let rankList = await fetch('http://127.0.0.1:3000/rankList')
    .then(response => response.json())
    .catch(error => {
      console.error('Error fetching rankList:', error);
      return JSON.parse(localStorage.getItem('rankList')) || [];
    });
  
  // Entfernt den Artikel an der angegebenen Indexposition aus der Rangliste
  rankList.splice(index, 1);
  
  // Speichert die aktualisierte Rangliste im Local Storage
  localStorage.setItem('rankList', JSON.stringify(rankList));
  
  // Sendet die aktualisierte Rangliste an den Server
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

  // Aktualisiert die angezeigte Rangliste
  displayRankList();
}



  
  
  