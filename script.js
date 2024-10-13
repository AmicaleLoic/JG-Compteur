
// Valeurs par défaut des catégories
let counts = {
    category1: { present: 0, entered: 0 },
    category2: { present: 0, entered: 0 },
    category3: { present: 0, entered: 0 },
};

let history = []; // Tableau pour stocker l'historique
let myChart; // Référence au graphique



function updateCount(category, change) {
    const categoryData = counts[category];
    if (change === 1) {
        categoryData.present += 1;
        categoryData.entered += 1;
    } else if (change === -1 && categoryData.present > 0) {
        categoryData.present -= 1;
    }

    displayCounts();
}

// Afficher les données de chaque catégorie
function displayCounts() {
    document.getElementById(`present1`).innerText = counts.category1.present;
    document.getElementById(`entered1`).innerText = counts.category1.entered;

    document.getElementById(`present2`).innerText = counts.category2.present;
    document.getElementById(`entered2`).innerText = counts.category2.entered;

    document.getElementById(`present3`).innerText = counts.category3.present;
    document.getElementById(`entered3`).innerText = counts.category3.entered;

    const totalPresent = counts.category1.present + counts.category2.present + counts.category3.present;
    document.getElementById(`totalPresent`).innerText = totalPresent;
}

let previousCounts = JSON.parse(JSON.stringify(counts)); // État précédent des comptes

// Enregistrer dans l'historique
function saveToLocalStorage() {
    // Enregistrer les comptes
    localStorage.setItem('counts', JSON.stringify(counts));
    
    // Vérifier si les comptes ont changé
    if (
        previousCounts.category1.present !== counts.category1.present ||
        previousCounts.category1.entered !== counts.category1.entered ||
        previousCounts.category2.present !== counts.category2.present ||
        previousCounts.category2.entered !== counts.category2.entered ||
        previousCounts.category3.present !== counts.category3.present ||
        previousCounts.category3.entered !== counts.category3.entered
    ) {
        // Enregistrer l'historique seulement si les comptes ont changé
        const timestamp = new Date().toISOString();
        history.push({
            timestamp: timestamp,
            category1: { present: counts.category1.present, entered: counts.category1.entered },
            category2: { present: counts.category2.present, entered: counts.category2.entered },
            category3: { present: counts.category3.present, entered: counts.category3.entered },
        });
        localStorage.setItem('history', JSON.stringify(history)); // Sauvegarder l'historique

        // Mettre à jour l'état précédent
        previousCounts = JSON.parse(JSON.stringify(counts));

        // Afficher le message "Updated"
        const updateMessage = document.getElementById('updateMessage');
        updateMessage.style.display = 'block'; // Afficher le message

        setTimeout(() => {
            updateMessage.style.display = 'none'; // Cacher le message après 1 seconde
        }, 1000);

        drawChart(); // Appeler la fonction pour mettre à jour le graphique


    }

}



//Chargement de l'historique
function loadFromLocalStorage() {
    const storedCounts = localStorage.getItem('counts');
    if (storedCounts) {
        counts = JSON.parse(storedCounts);
    }
    
    const storedHistory = localStorage.getItem('history');
    if (storedHistory) {
        history = JSON.parse(storedHistory);
    } else {
        // Si l'historique est vide, ajouter une première ligne avec des valeurs zéro
        const timestamp = new Date().toISOString();
        history.push({
            timestamp: timestamp,
            category1: { present: 0, entered: 0 },
            category2: { present: 0, entered: 0 },
            category3: { present: 0, entered: 0 },
        });
    }

    displayCounts();
    drawChart(); // Appeler la fonction pour dessiner le graphique
}




// Charger les données au démarrage
loadFromLocalStorage();


// Enregistrer automatiquement toutes les 7,5 secondes >> il faudra mettre ça en minutes plus tard
setInterval(() => {
    saveToLocalStorage();

}, 7500);

//Modification du temps pour un bon affichage dans le csv
function formatTimestamp(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}


// Export au format CSV
function exportToCSV() {
    const categoryNames = JSON.parse(localStorage.getItem('categoryNames')) || {
        category1: "Catégorie 1",
        category2: "Catégorie 2",
        category3: "Catégorie 3"
    };

    const data = [
        // Entêtes
        ["Horodatage", "Présents " + categoryNames.category1, "Présents " + categoryNames.category2, "Présents " + categoryNames.category3, "Entrées " + categoryNames.category1, "Entrées " + categoryNames.category2, "Entrées " + categoryNames.category3]
    ];

    // Ajouter une ligne pour chaque entrée de l'historique
    history.forEach(entry => {
        const date = new Date(entry.timestamp);
        data.push([
            formatTimestamp(date), // Utiliser la fonction de formatage ici
            entry.category1.present,
            entry.category2.present,
            entry.category3.present,
            entry.category1.entered,
            entry.category2.entered,
            entry.category3.entered
        ]);
    });

    // Convertir les données en format CSV
    const csvContent = data.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    // Créer un lien de téléchargement
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "historique_session.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}




function resetData() {
    if (confirm("Voulez-vous vraiment réinitialiser toutes les données ?")) {
        // Réinitialiser les données de l'historique
        const defaultEntry = {
            timestamp: new Date().toISOString(),
            category1: { present: 0, entered: 0 },
            category2: { present: 0, entered: 0 },
            category3: { present: 0, entered: 0 }
        };

        // Vider l'historique
        history = []; // Réinitialiser le tableau d'historique
        localStorage.setItem('history', JSON.stringify([defaultEntry])); // Ajouter la ligne par défaut

        // Réinitialiser les valeurs des catégories
        counts = {
            category1: { present: 0, entered: 0 },
            category2: { present: 0, entered: 0 },
            category3: { present: 0, entered: 0 },
        };

        displayCounts(); // Mettre à jour l'affichage des comptages

        // Réinitialiser le total des présents
        document.getElementById('totalPresent').textContent = '0';

        // Demander à l'utilisateur s'il souhaite réinitialiser les noms des catégories
        if (confirm("Souhaitez-vous également réinitialiser les noms des catégories?")) {
            // Réinitialiser les noms des catégories
            const defaultNames = {
                category1: "Catégorie 1",
                category2: "Catégorie 2",
                category3: "Catégorie 3"
            };
            localStorage.setItem('categoryNames', JSON.stringify(defaultNames));

            // Mettre à jour les noms des catégories dans l'interface
            document.getElementById('category1-name').textContent = defaultNames.category1;
            document.getElementById('category2-name').textContent = defaultNames.category2;
            document.getElementById('category3-name').textContent = defaultNames.category3;
        }
    }
}








// Fonction pour renommer une catégorie
function renameCategory(categoryNumber) {
    const newName = prompt(`Entrez le nouveau nom pour Catégorie ${categoryNumber}:`);
    
    if (newName) {
        // Mettre à jour le nom de la catégorie dans l'interface
        document.getElementById(`category${categoryNumber}-name`).textContent = newName;
        
        // Sauvegarder le nouveau nom dans le local storage
        const categoryNames = JSON.parse(localStorage.getItem('categoryNames')) || {};
        categoryNames[`category${categoryNumber}`] = newName;
        localStorage.setItem('categoryNames', JSON.stringify(categoryNames));
    }
}

// Fonction pour charger les noms des catégories depuis le local storage
function loadCategoryNames() {
    const categoryNames = JSON.parse(localStorage.getItem('categoryNames')) || {};
    
    if (categoryNames.category1) {
        document.getElementById('category1-name').textContent = categoryNames.category1;
    }
    
    if (categoryNames.category2) {
        document.getElementById('category2-name').textContent = categoryNames.category2;
    }
    
    if (categoryNames.category3) {
        document.getElementById('category3-name').textContent = categoryNames.category3;
    }
}

// Appeler la fonction lors du chargement de la page
window.onload = function() {
    loadCategoryNames();
    // Vous pouvez aussi appeler d'autres fonctions ici comme la récupération des données de l'historique
};


function drawChart() {
    if (history.length === 0) return; // Ne rien faire si l'historique est vide

    const labels = history.map(entry => new Date(entry.timestamp)); // Convertir en objets Date
    const presentData1 = history.map(entry => entry.category1.present);
    const presentData2 = history.map(entry => entry.category2.present);
    const presentData3 = history.map(entry => entry.category3.present);
    
    // Calculer le total des présents
    const totalPresentData = history.map(entry => 
        entry.category1.present + entry.category2.present + entry.category3.present
    );

    const ctx = document.getElementById('myChart').getContext('2d');

    // Si le graphique existe déjà, le détruire
    if (myChart) {
        myChart.destroy();
    }

    // Créer un nouveau graphique
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels, // Utiliser les timestamps
            datasets: [
                {
                    label: 'Total Présents',
                    data: totalPresentData,
                    borderColor: 'rgba(192, 32, 192, 1)',
                    backgroundColor: 'rgba(192, 32, 192, 0.2)',
                    fill: true,
                    hidden: false // Visible par défaut
                }
            ]
        },
        options: {
            scales: {
                x: {
                    type: 'time', // Utiliser une échelle de temps
                    time: {
                        unit: 'minute', // Unité de temps (minutes)
                        displayFormats: {
                            minute: 'HH:mm' // Format d'affichage
                        }
                    },
                    title: {
                        display: true,
                        text: 'Temps'
                    },
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 10 // Limiter le nombre de graduations à 10
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Présents'
                    }
                }
            }
        }
    });
}



let chartVisible = true; // Variable pour suivre l'état d'affichage du graphique

function toggleChart() {
    const chartContainer = document.getElementById('chartContainer'); // L'élément contenant le graphique
    const chartIcon = document.getElementById('chartIcon');

    if (chartVisible) {
        chartContainer.style.display = 'none'; // Masquer le graphique
        chartIcon.src = 'images/stats.png'; // Image pour masquer le graphique
    } else {
        chartContainer.style.display = 'block'; // Afficher le graphique
        chartIcon.src = 'images/stats.png'; // Image pour afficher le graphique
    }

    chartVisible = !chartVisible; // Inverser l'état d'affichage
}




