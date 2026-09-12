const challenges = [
  {
    title: "Le mail impossible",
    situation: "Vous devez annoncer un changement de planning qui entraîne des changements de poste pour plusieurs professionnels. La décision est nécessaire, mais elle risque de générer de la tension et un sentiment d’injustice.",
    mission: "Construisez un prompt RCTF permettant à votre IA de rédiger un message clair qui explique la décision, limite les tensions et préserve la confiance de l’équipe."
  },
  {
    title: "Le briefing d’équipe",
    situation: "Des tensions apparaissent dans l’équipe autour de la charge de travail et de la répartition des tâches. Plusieurs professionnels disent ne pas se sentir entendus.",
    mission: "Demandez à l’IA de préparer votre prochain briefing : objectifs, déroulé, questions à poser, points de vigilance et manière de faire émerger des solutions avec l’équipe."
  },
  {
    title: "Le boss final",
    situation: "Vous devez préparer un entretien avec un professionnel compétent et apprécié, mais dont les retards répétés ont désormais un impact sur l’organisation du service.",
    mission: "Obtenez une préparation d’entretien comprenant les objectifs, une formulation pour aborder le problème, des questions ouvertes, les réactions défensives possibles, vos réponses de manager et les pièges à éviter."
  }
];

const teamColors = ["#183f59", "#f36f32", "#f2c94c", "#a94c58", "#2f7d68", "#6c63a8", "#557785", "#d98f4e"];
const state = { team: 1, round: 0, seconds: 300, running: false, timerId: null };

const screens = [...document.querySelectorAll('.screen')];
function showScreen(id) {
  screens.forEach(s => s.classList.toggle('active', s.id === id));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('[data-go]').forEach(btn => {
  btn.addEventListener('click', () => showScreen(btn.dataset.go));
});

function buildTeams() {
  const grid = document.getElementById('teamGrid');
  const trainer = document.getElementById('trainerTeams');
  grid.innerHTML = '';
  trainer.innerHTML = '';
  for (let i = 1; i <= 8; i++) {
    const btn = document.createElement('button');
    btn.className = 'team-card';
    btn.type = 'button';
    btn.style.setProperty('--team-color', teamColors[i - 1]);
    btn.innerHTML = `<span class="team-dot"></span><div><strong>Équipe ${i}</strong><small>Appuyez pour rejoindre</small></div>`;
    btn.addEventListener('click', () => selectTeam(i));
    grid.appendChild(btn);

    const row = document.createElement('div');
    row.className = 'trainer-team';
    row.innerHTML = `<span><i class="team-dot" style="background:${teamColors[i-1]}"></i>Équipe ${i}</span><span class="state-wait">En attente</span>`;
    trainer.appendChild(row);
  }
}

function selectTeam(i) {
  state.team = i;
  document.getElementById('currentTeamBadge').textContent = `Équipe ${i}`;
  loadRound();
  showScreen('battle');
}

function loadRound() {
  const c = challenges[state.round];
  document.getElementById('roundLabel').textContent = `MANCHE ${state.round + 1} / 3`;
  document.getElementById('challengeTitle').textContent = c.title;
  document.getElementById('challengeSituation').textContent = c.situation;
  document.getElementById('challengeMission').textContent = c.mission;
  document.getElementById('trainerRound').textContent = `${state.round + 1}/3`;
  document.getElementById('promptInput').value = '';
  document.getElementById('resultInput').value = '';
  document.getElementById('saveState').textContent = 'Non soumis';
  resetTimer();
}

function resetTimer() {
  clearInterval(state.timerId);
  state.running = false;
  state.seconds = 300;
  document.getElementById('timerToggle').textContent = 'Démarrer';
  renderTimer();
}

function renderTimer() {
  const min = String(Math.floor(state.seconds / 60)).padStart(2, '0');
  const sec = String(state.seconds % 60).padStart(2, '0');
  document.getElementById('timer').textContent = `${min}:${sec}`;
}

document.getElementById('timerToggle').addEventListener('click', () => {
  state.running = !state.running;
  document.getElementById('timerToggle').textContent = state.running ? 'Pause' : 'Reprendre';
  if (state.running) {
    state.timerId = setInterval(() => {
      if (state.seconds > 0) {
        state.seconds--;
        renderTimer();
      } else {
        clearInterval(state.timerId);
        state.running = false;
        document.getElementById('timerToggle').textContent = 'Terminé';
      }
    }, 1000);
  } else {
    clearInterval(state.timerId);
  }
});

document.getElementById('rctfToggle').addEventListener('click', () => {
  const help = document.getElementById('rctfHelp');
  help.classList.toggle('hidden');
  document.getElementById('rctfToggle').textContent = help.classList.contains('hidden') ? 'Afficher le rappel RCTF' : 'Masquer le rappel RCTF';
});

document.getElementById('submitRound').addEventListener('click', () => {
  const prompt = document.getElementById('promptInput').value.trim();
  if (!prompt) {
    alert('Ajoutez au moins votre prompt avant de soumettre la manche.');
    return;
  }
  clearInterval(state.timerId);
  state.running = false;
  document.getElementById('saveState').textContent = '✓ Soumis localement';
  showScreen('selfcheck');
});

const scoreItems = [
  ["Pertinence", "Le résultat répond-il réellement au problème posé ?"],
  ["Précision", "La demande limite-t-elle les réponses vagues ou génériques ?"],
  ["Contexte", "Les informations données permettent-elles une réponse adaptée ?"],
  ["Utilité managériale", "Pourriez-vous réellement vous appuyer sur ce résultat ?"]
];

function buildScores() {
  const grid = document.getElementById('scoreGrid');
  grid.innerHTML = scoreItems.map((item, index) => `
    <article class="score-card">
      <h3>${item[0]}</h3>
      <p>${item[1]}</p>
      <select class="score-select" aria-label="${item[0]}">
        ${[1,2,3,4,5].map(n => `<option value="${n}" ${n === 3 ? 'selected' : ''}>${n} / 5</option>`).join('')}
      </select>
    </article>
  `).join('');
  document.querySelectorAll('.score-select').forEach(s => s.addEventListener('change', updateTotal));
  updateTotal();
}

function updateTotal() {
  const total = [...document.querySelectorAll('.score-select')].reduce((sum, el) => sum + Number(el.value), 0);
  document.getElementById('selfTotal').textContent = total;
}

document.getElementById('nextRound').addEventListener('click', () => {
  if (state.round < challenges.length - 1) {
    state.round++;
    loadRound();
    buildScores();
    showScreen('battle');
  } else {
    showScreen('final');
  }
});

function buildLeaderboard() {
  const scores = [18.5, 17, 16.5, 15, 14.5, 13, 12.5, 11];
  document.getElementById('leaderboard').innerHTML = scores.map((score, i) => `
    <div class="leader-row"><strong>${i + 1}</strong><span>Équipe ${i + 1}</span><span>${score}/20</span></div>
  `).join('');
}

document.getElementById('publishRanking').addEventListener('click', e => {
  e.currentTarget.textContent = e.currentTarget.textContent === 'Publier' ? 'Publié ✓' : 'Publier';
});

buildTeams();
buildScores();
buildLeaderboard();
loadRound();
