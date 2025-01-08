// Plafonds ASI, qui changent au 1er avril chaque année
const plafonds = {
    "2017": { seul: 9658.13, couple: 15592.07 },
    "2018": { seul: 9820.46, couple: 15872.24 },
    "2019": { seul: 9951.84, couple: 16091.92 },
    "2020": { seul: 10068.00, couple: 16293.12 },
    "2021": { seul: 10183.20, couple: 16396.49 },
    "2022": { seul: 10265.16, couple: 16512.93 },
    "2023": { seul: 10320.07, couple: 16548.23 },
    "2024": { seul: 10536.50, couple: 16890.35 },
};

// Liste complète des abattements par année
const abattements = {
    "2017": { seul: 1400, couple: 2400 },
    "2018": { seul: 1450, couple: 2450 },
    "2019": { seul: 1500, couple: 2500 },
    "2020": { seul: 1550, couple: 2550 },
    "2021": { seul: 1600, couple: 2600 },
    "2022": { seul: 1600, couple: 2600 },
    "2023": { seul: 1600, couple: 2600 },
    "2024": { seul: 1650, couple: 2650 },
};

// Fonction pour récupérer le plafond applicable en fonction de la date d'effet
function obtenirPlafond(dateEffet, statut) {
    const annee = dateEffet.getFullYear();
    const mois = dateEffet.getMonth() + 1;

    // Si la date est avant le 1er avril, on utilise le plafond de l'année précédente
    const anneePlafond = mois < 4 ? annee - 1 : annee;

    return plafonds[anneePlafond]?.[statut] || 0;
}
let customColumns = []; // Colonnes personnalisées ajoutées par l'utilisateur

function genererTableauRessources() {
    const dateEffet = new Date(document.getElementById("dateEffet").value);
    const statut = document.getElementById("statut").value;

    if (isNaN(dateEffet.getTime())) return;

    const ressourcesContainer = document.getElementById("ressourcesContainer");
    ressourcesContainer.innerHTML = ""; // Réinitialise le contenu

    const tableDemandeur = createRessourceTable("Demandeur", dateEffet);
    ressourcesContainer.appendChild(tableDemandeur);

    if (statut === "couple") {
        const tableConjoint = createRessourceTable("Conjoint", dateEffet);
        ressourcesContainer.appendChild(tableConjoint);
    }
}

function createRessourceTable(role, dateEffet) {
    const tableContainer = document.createElement("div");
    tableContainer.classList.add("table-container");

    const title = document.createElement("h3");
    title.textContent = `Ressources du ${role}`;
    tableContainer.appendChild(title);

    const table = document.createElement("table");
    table.id = `${role.toLowerCase()}Table`;

    const header = document.createElement("tr");
    ["Mois", "Pension d'invalidité", "Salaires", "Indemnités journalières", "Chômage"].forEach(col => {
        const th = document.createElement("th");
        th.textContent = col;
        header.appendChild(th);
    });

    customColumns.forEach(colName => {
        const th = document.createElement("th");
        th.textContent = colName;
        header.appendChild(th);
    });

    const addColumnButton = document.createElement("th");
    const button = document.createElement("button");
    button.textContent = "+";
    button.className = "add-column-btn";
    button.title = "Ajouter une ressource";
    button.onclick = event => {
        event.preventDefault();
        addColumnToTable(role.toLowerCase());
    };
    addColumnButton.appendChild(button);
    addColumnButton.classList.add("add-column");
    header.appendChild(addColumnButton);

    table.appendChild(header);

    for (let i = 3; i >= 1; i--) {
        const mois = new Date(dateEffet);
        mois.setMonth(mois.getMonth() - i);

        const row = document.createElement("tr");

        const moisCell = document.createElement("td");
        moisCell.textContent = mois.toLocaleString("fr-FR", { month: "long", year: "numeric" });
        row.appendChild(moisCell);

        ["invalidite", "salaires", "indemnites", "chomage"].forEach(type => {
            const cell = document.createElement("td");
            const input = document.createElement("input");
            input.type = "number";
            input.id = `${role.toLowerCase()}_${type}M${4 - i}`;
            input.placeholder = "€";
            input.min = 0;
            cell.appendChild(input);
            row.appendChild(cell);
        });

        customColumns.forEach((col, index) => {
            const cell = document.createElement("td");
            const input = document.createElement("input");
            input.type = "number";
            input.id = `${role.toLowerCase()}_custom${index}M${4 - i}`;
            input.placeholder = "€";
            input.min = 0;
            cell.appendChild(input);
            row.appendChild(cell);
        });

        table.appendChild(row);
    }

    tableContainer.appendChild(table);
    return tableContainer;
}

function addColumnToTable(role) {
    const table = document.getElementById(`${role.toLowerCase()}Table`);
    if (!table) return;

    const columnIndex = table.rows[0].cells.length - 1;

    const headerCell = document.createElement("th");
    const headerInput = document.createElement("input");
    headerInput.type = "text";
    headerInput.placeholder = `Ressource ${columnIndex - 4}`;
    headerInput.style.wordWrap = "break-word";
    headerInput.style.whiteSpace = "normal";
    headerCell.appendChild(headerInput);
    table.rows[0].insertBefore(headerCell, table.rows[0].lastChild);

    for (let i = 1; i < table.rows.length; i++) {
        const cell = document.createElement("td");
        const input = document.createElement("input");
        input.type = "number";
        input.placeholder = "€";
        input.min = 0;
        input.id = `${role}_custom${columnIndex - 4}M${4 - i}`;
        cell.appendChild(input);
        table.rows[i].insertBefore(cell, table.rows[i].lastChild);
    }
}
function calculateRessources(role, dateEffet) {
    const details = [];
    let total = 0;
    let totalSalaires = 0;

    for (let i = 3; i >= 1; i--) {
        const mois = new Date(dateEffet);
        mois.setMonth(mois.getMonth() - i);

        const invalidite = parseFloat(document.getElementById(`${role.toLowerCase()}_invaliditeM${4 - i}`).value) || 0;
        const salaires = parseFloat(document.getElementById(`${role.toLowerCase()}_salairesM${4 - i}`).value) || 0;
        const indemnites = parseFloat(document.getElementById(`${role.toLowerCase()}_indemnitesM${4 - i}`).value) || 0;
        const chomage = parseFloat(document.getElementById(`${role.toLowerCase()}_chomageM${4 - i}`).value) || 0;

        let customTotal = 0;
        customColumns.forEach((col, index) => {
            const customInput = parseFloat(document.getElementById(`${role.toLowerCase()}_custom${index}M${4 - i}`).value) || 0;
            customTotal += customInput;
        });

        const moisTotal = invalidite + salaires + indemnites + chomage + customTotal;
        total += moisTotal;
        totalSalaires += salaires;

        details.push({
            mois: mois.toLocaleString("fr-FR", { month: "long", year: "numeric" }),
            invalidite,
            salaires,
            indemnites,
            chomage,
            customTotal,
            moisTotal,
        });
    }

    return { total, salaires: totalSalaires, details };
}

function obtenirAbattement(dateEffet, statut, totalSalaires) {
    const annee = dateEffet.getFullYear();
    const abattement = abattements[annee]?.[statut] || 0;

    // Si les salaires totaux sont inférieurs ou égaux à l'abattement, on applique les salaires comme abattement
    return totalSalaires <= abattement ? totalSalaires : abattement;
}
function calculerASI() {
    const statut = document.getElementById("statut").value;
    const dateEffet = new Date(document.getElementById("dateEffet").value);

    if (!statut || isNaN(dateEffet.getTime())) {
        alert("Veuillez sélectionner un statut et une date d'effet valide.");
        return;
    }

    const plafondAnnuel = obtenirPlafond(dateEffet, statut);
    const plafondTrimestriel = plafondAnnuel / 4;

    const demandeurRessources = calculateRessources("Demandeur", dateEffet);
    const conjointRessources = statut === "couple" ? calculateRessources("Conjoint", dateEffet).total : 0;

    const totalRessourcesAvantAbattement = demandeurRessources.total + conjointRessources;

    // Calcul de l'abattement basé uniquement sur les salaires
    const salairesDemandeur = demandeurRessources.salaires;
    const salairesConjoint = statut === "couple" ? calculateRessources("Conjoint", dateEffet).salaires : 0;
    const totalSalaires = salairesDemandeur + salairesConjoint;

    const abattement = totalSalaires > 0 ? obtenirAbattement(dateEffet, statut, totalSalaires) : 0;
    const totalRessourcesApresAbattement = Math.max(0, totalRessourcesAvantAbattement - abattement);

    afficherResultats(
        dateEffet,
        plafondTrimestriel,
        totalRessourcesAvantAbattement,
        totalRessourcesApresAbattement,
        abattement,
        demandeurRessources.details,
        statut === "couple" ? calculateRessources("Conjoint", dateEffet).details : null
    );
}

function afficherResultats(
    dateEffet,
    plafondTrimestriel,
    ressourcesAvantAbattement,
    ressourcesApresAbattement,
    abattement,
    demandeurDetails,
    conjointDetails
) {
    const result = document.getElementById("result");
    result.innerHTML = `
        <h2>Droits ASI au ${dateEffet.toLocaleDateString("fr-FR")}</h2>
    `;

    // Détails mois par mois pour le demandeur
    result.innerHTML += `<h3>Détails des ressources</h3>`;
    result.innerHTML += generateMonthlyDetails(demandeurDetails, "Demandeur");

    // Détails mois par mois pour le conjoint (si applicable)
    if (conjointDetails) {
        result.innerHTML += generateMonthlyDetails(conjointDetails, "Conjoint");
    }

    // Résumé des ressources
    result.innerHTML += `
        <h3>Résumé des ressources</h3>
        <table>
            <tr><td><strong>Total trimestriel avant abattement :</strong></td><td>${ressourcesAvantAbattement.toFixed(2)} €</td></tr>
            <tr><td><strong>Abattement appliqué :</strong></td><td>${abattement.toFixed(2)} €</td></tr>
            <tr><td><strong>Total trimestriel après abattement :</strong></td><td>${ressourcesApresAbattement.toFixed(2)} €</td></tr>
            <tr><td><strong>Plafond trimestriel applicable :</strong></td><td>${plafondTrimestriel.toFixed(2)} €</td></tr>
        </table>
    `;

    // Conclusion
    if (ressourcesApresAbattement > plafondTrimestriel) {
        result.innerHTML += `<p>Le total des ressources au cours du trimestre de référence, soit ${ressourcesApresAbattement.toFixed(2)} € étant supérieures au plafond trimestriel de ${plafondTrimestriel.toFixed(2)} €, l’allocation supplémentaire d’invalidité ne pouvait pas être attribuée à effet du ${dateEffet.toLocaleDateString("fr-FR")}.</p>`;
    } else {
        const montantASI = plafondTrimestriel - ressourcesApresAbattement;
        const montantMensuelASI = montantASI / 3;
        result.innerHTML += `<p>Le montant trimestriel de l’allocation supplémentaire à servir était donc de ${montantASI.toFixed(2)} € (${plafondTrimestriel.toFixed(2)} € [plafond] – ${ressourcesApresAbattement.toFixed(2)} € [ressources]). Seuls des arrérages d’un montant mensuel de ${montantMensuelASI.toFixed(2)} € étaient dus à compter du ${dateEffet.toLocaleDateString("fr-FR")}.</p>`;
    }
}
