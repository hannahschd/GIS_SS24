// Führt den Code aus, sobald das Dokument vollständig geladen ist
document.addEventListener('DOMContentLoaded', () => displayWishes());

// Speichert einen neuen Wunsch
function saveData() {
  const wishInput = document.getElementById('wish');
  const wish = wishInput.value.trim();

  // Überprüft, ob das Eingabefeld leer ist
  if (!wish) {
    alert('Bitte geben Sie einen Wunsch ein.');
    return;
  }

  // Holt die bestehenden Wünsche aus dem Local Storage, fügt den neuen Wunsch hinzu und speichert sie erneut
  const wishes = JSON.parse(localStorage.getItem('wishes')) || [];
  wishes.push(wish);
  localStorage.setItem('wishes', JSON.stringify(wishes));

  // Setzt das Eingabefeld zurück und aktualisiert die angezeigte Wunschliste
  wishInput.value = '';
  displayWishes();
}

// Zeigt die gespeicherten Wünsche an
function displayWishes() {
  const wishListDiv = document.getElementById('wish-list');
  const wishes = JSON.parse(localStorage.getItem('wishes')) || [];

  // Löscht den aktuellen Inhalt der Wunschliste
  wishListDiv.innerHTML = '';

  // Fügt jeden Wunsch als neues Element in die Wunschliste ein
  wishes.forEach((wish, index) => {
    wishListDiv.innerHTML += `
      <div class="wish-item">
        <p><a href="hinzufügen.html?wish=${encodeURIComponent(wish)}">${wish}</a></p>
        <button onclick="deleteWish(${index})">Löschen</button>
      </div>
    `;
  });
}

// Löscht einen Wunsch basierend auf dem Index
function deleteWish(index) {
  const wishes = JSON.parse(localStorage.getItem('wishes')) || [];
  wishes.splice(index, 1);
  localStorage.setItem('wishes', JSON.stringify(wishes));
  displayWishes();
}

  
  
  
  