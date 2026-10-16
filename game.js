// ==========================================
// PLAK JOUW POKÉMON DATABASE HIERBOVEN
// ==========================================

// --- 1. GLOBALE VARIABELEN ---
let userTeam = { ST: null, WG: null, AM: null, CM: null, FB: null, CB: null, GK: null };
let playerStats = {}; 
let currentDraftPos = null;
let currentDraftRole = null;
let currentRolledOptions = [];
let rerollsLeft = 1;
let actionPoints = 3; // NIEUW: Action Points systeem
let isTransferWindow = false;
let currentSeason = 1;
let gameMode = 'classic'; 
// (Zorg dat je overige variabelen zoals selectedGens, etc. hier ook staan als je die had)

// --- 2. UI & MODAL LOGICA ---

function handleModalClick(event) {
    const wrapper = document.getElementById('draft-content-wrapper');
    const modal = document.getElementById('draft-modal');
    // Sluit als we buiten de content klikken, maar niet als we op de 'X' klikken (die regelt zichzelf)
    if (event.target === modal || (wrapper && !wrapper.contains(event.target) && event.target.id !== 'btn-floating-close')) {
        closeModal();
    }
}

function closeModal() {
    const modal = document.getElementById('draft-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

// Check of de speler door mag naar het volgende seizoen
function checkOffSeasonActions() {
    const btn = document.getElementById('btn-finish-transfers');
    if (!btn) return;
    
    if (actionPoints <= 0) {
        btn.innerHTML = "Start Next Season &rarr;";
        btn.classList.remove('bg-slate-800', 'text-slate-200');
        btn.classList.add('bg-green-600', 'text-white', 'border-green-500', 'shadow-[0_0_15px_rgba(22,163,74,0.5)]');
    } else {
        btn.innerHTML = "Skip Remaining Actions &rarr;";
        btn.classList.add('bg-slate-800', 'text-slate-200');
        btn.classList.remove('bg-green-600', 'text-white', 'border-green-500', 'shadow-[0_0_15px_rgba(22,163,74,0.5)]');
    }
}

// --- 3. OFF-SEASON LOGICA (TRANSFERS & TRAINING) ---

function startTransferWindow() {
    isTransferWindow = true;
    actionPoints = 3; // Reset Action Points
    
    const actionCountEl = document.getElementById('action-count');
    if(actionCountEl) actionCountEl.innerText = actionPoints;
    
    const banner = document.getElementById('transfer-banner');
    const finishBtn = document.getElementById('btn-finish-transfers');
    
    if(banner) { banner.classList.remove('hidden'); banner.classList.add('flex'); }
    if(finishBtn) { finishBtn.classList.remove('hidden'); }
    
    checkOffSeasonActions();
    renderPitch();
}

window.confirmTransferOut = async function(role, displayPos) {
    if (actionPoints <= 0) {
        alert("You have no Action Points left this season!");
        return;
    }
    
    actionPoints--; // Betaal het actiepunt
    const actionCountEl = document.getElementById('action-count');
    if(actionCountEl) actionCountEl.innerText = actionPoints;
    checkOffSeasonActions();

    currentDraftPos = displayPos;
    currentDraftRole = role;
    
    // Jouw bestaande filter- en roll-logica
    const validPool = filterValidPokemon(role); 
    currentRolledOptions = rollOptions(validPool, 3);
    showGacha(currentRolledOptions, role, displayPos);
}

function selectPokemonByIndex(idx) {
    const pData = currentRolledOptions[idx];
    if (!pData || !currentDraftPos) return;

    userTeam[currentDraftPos] = pData;

    if(!playerStats[pData.id]) {
        playerStats[pData.id] = { p: pData, goals: 0, seasonGoals: 0, cleanSheets: 0, perfScore: 0, seasonPerfScore: 0 };
    }

    closeModal();
    renderPitch();
    updateScores();
}

window.trainStat = function(posId, statKey, role, displayPos) {
    if (actionPoints <= 0) {
        alert("You have no Action Points left this season!");
        return;
    }

    const pData = userTeam[posId];
    if (!pData) return;

    let boost = 0;
    const currentVal = pData.normStats[statKey];
    
    // Snellere training voor zwakke stats (Robin Hood stijl)
    if (currentVal < 70) boost = Math.floor(Math.random() * 4) + 3; // +3 tot +6
    else if (currentVal < 85) boost = Math.floor(Math.random() * 3) + 2; // +2 tot +4
    else if (currentVal < 95) boost = Math.floor(Math.random() * 2) + 1; // +1 tot +2
    else boost = 1;

    if (currentVal + boost > 99) boost = 99 - currentVal;
    pData.normStats[statKey] += boost;
    
    actionPoints--; 
    const actionCountEl = document.getElementById('action-count');
    if(actionCountEl) actionCountEl.innerText = actionPoints;
    checkOffSeasonActions();

    closeModal();
    renderPitch();
    updateScores();
    
    if (typeof confetti === 'function') {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 }, colors: ['#22c55e', '#4ade80'] });
    }
}

// --- 4. MATCH ENGINE (AANGEPAST VOOR MINDER 1-1) ---

function simulateMatchday(opponent) {
    // ... Jouw bestaande setup logica ...
    const uPoss = myTeamEnginePools.poss || 0;
    const cPoss = opponent.pools.poss || 0;
    
    // AANGEPAST: Meer kansen en sterkere beloning voor dominant balbezit
    const totalChances = 13; 
    const possRatio = (Math.pow(uPoss, 1.5)) / (Math.pow(uPoss, 1.5) + Math.pow(cPoss, 1.5));
    
    let uChances = 0; let cChances = 0;
    for(let i=0; i<totalChances; i++){
        if(Math.random() < possRatio) uChances++;
        else cChances++;
    }

    // ... Rest van jouw engine (creatie, afwerking, muur-fase) ...
}

// Let op: Vergeet niet jouw resterende functies (zoals startSeasonSimulation, renderPitch, updateScores, etc.) 
// onderaan dit bestand te plakken uit je originele script!
