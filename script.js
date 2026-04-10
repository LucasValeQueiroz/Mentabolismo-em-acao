// --- Game Data ---
const nodes = [
    // Glicólise Path (0-4) -> Citosol 
    // Descemos o Y de 25 para 35 para limpar o texto superior esquerdo perfeitamente!
    { id: 0, x: 8, y: 35, name: "Glicose", desc: "Entra na célula", zone: "citosol", type: "normal" },
    { id: 1, x: 20, y: 35, name: "Investimento", desc: "Hexoquinase: Gasto de -2 ATP", zone: "citosol", effect: { atp: -2 }, type: "normal" },
    { id: 2, x: 32, y: 35, name: "Clivagem", desc: "Surgem trioses (Aldolase)", zone: "citosol", type: "normal" },
    { id: 3, x: 32, y: 45, name: "Pagamento", desc: "Gera energia: +4 ATP, +2 NADH", zone: "citosol", effect: { atp: 4, nadh: 2 }, type: "normal" },
    { id: 4, x: 42, y: 52, name: "Piruvato", desc: "Produto final glicolítico", zone: "citosol", type: "event" },

    // Beta-Oxidação Path (5-9) -> Citosol e Mitocôndria
    { id: 5, x: 8, y: 80, name: "Ácido Graxo", desc: "Quebra de lipídio", zone: "citosol", type: "normal" },
    { id: 6, x: 20, y: 80, name: "Ativação", desc: "Uso de Acil-CoA: -2 ATP", zone: "citosol", effect: { atp: -2 }, type: "normal" },
    { id: 7, x: 34, y: 80, name: "Carnitina", desc: "Translocação mitocondrial", zone: "mitocondria", type: "event" },
    { id: 8, x: 46, y: 80, name: "Beta-Ox 1", desc: "Primeiro turno: +1 NADH, +1 FADH₂", zone: "mitocondria", effect: { nadh: 1, fadh: 1 }, type: "normal" },
    { id: 9, x: 53, y: 66, name: "Beta-Ox 2", desc: "Ciclos seguintes: +1 NADH, +1 FADH₂", zone: "mitocondria", effect: { nadh: 1, fadh: 1 }, type: "normal" },

    // Encruzilhada (10) -> Posicionado exatamente na entrada visual da Mitocôndria
    { id: 10, x: 53, y: 52, name: "Acetil-CoA", desc: "Interseção universal", zone: "mitocondria", type: "normal" },

    // Krebs Cycle (11-14) -> Matriz Mitocondrial
    // Citrato posicionado do outro lado da membrana, formando a "ponte"
    // Descarboxilação (12) desceu para Y:38 para não atropelar o texto superior direito
    { id: 11, x: 63, y: 52, name: "Citrato", desc: "Condensação inicial", zone: "mitocondria", type: "normal" },
    { id: 12, x: 72, y: 38, name: "Descarboxilação", desc: "Isocitrato para alfa-KG: +2 NADH", zone: "mitocondria", effect: { nadh: 2 }, type: "normal" },
    { id: 13, x: 82, y: 52, name: "Fosforilação", desc: "Succinil-CoA > Succinato: +1 ATP", zone: "mitocondria", effect: { atp: 1 }, type: "event" },
    { id: 14, x: 72, y: 68, name: "Malato", desc: "Regeneração final: +1 FADH₂, +1 NADH", zone: "mitocondria", effect: { fadh: 1, nadh: 1 }, type: "normal" },

    // Cadeia Respiratória e Fim (15-16) -> Encaixados nas cristas
    { id: 15, x: 92, y: 68, name: "Cadeia", desc: "Fosforilação Oxidativa", zone: "mitocondria", effect: "exchange", type: "event" },
    { id: 16, x: 92, y: 52, name: "FIM", desc: "Contagem de rentabilidade", zone: "mitocondria", effect: "end", type: "end" },
];


// Paths definition matching the ID sequence
const paths = {
    p1: [0, 1, 2, 3, 4, 10, 11, 12, 13, 14, 15, 16], // Glicose -> AcetilCoA -> Krebs -> Cadeia
    p2: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] // AG -> AcetilCoA -> Krebs -> Cadeia
};


const events = [
    {
        title: "Jejum Prolongado", desc: "Gliconeogênese ativada no fígado! Se você é Glicose, volte 1 casa. Se é Ácido Graxo, avance 1 casa (energia focada na quebra de lipídios).", apply: (p) => {
            if (p.id === 'p1') { p.bonusMove = -1; return true; } // Bad
            else { p.bonusMove = 1; return false; } // Good
        }
    },
    {
        title: "Exercício Intenso!", desc: "Contração muscular rápida! A epinefrina mobiliza combustíveis. Ganhe +2 ATP imediatamente pelo esforço.", apply: (p) => {
            p.atp += 2; return false; // Good
        }
    },
    {
        title: "Diabetes Não Tratada", desc: "A insulina está em falta. A Glicose não consegue entrar na célula adequadamente: perca a próxima rodada! O Ácido Graxo produz corpos cetônicos (ganha +1 NADH extra).", apply: (p) => {
            if (p.id === 'p1') { p.skipTurn = true; return true; } // Bad
            else { p.nadh += 1; return false; } // Good
        }
    },
    {
        title: "Deficiência de Carnitina", desc: "Dificuldade na translocação de Acil-CoA para a mitocôndria! Se for Lipídio (Ácido Graxo), perca sua vez de jogar.", apply: (p) => {
            if (p.id === 'p2') { p.skipTurn = true; return true; } // Bad
            return false;
        }
    },
    {
        title: "Hipóxia Menor (Falta de O₂)", desc: "A cadeia respiratória reduz a velocidade. Seu poder redutor se acumula, perca 1 NADH ou 1 FADH₂ (oxidado sem geração de ATP na via).", apply: (p) => {
            if (p.nadh > 0) { p.nadh--; return true; } // Bad
            else if (p.fadh > 0) { p.fadh--; return true; } // Bad
            return true; // Bad
        }
    }
];


let players = {
    p1: { id: 'p1', name: "Glicose", pathIdx: 0, atp: 0, nadh: 0, fadh: 0, skipTurn: false, bonusMove: 0 },
    p2: { id: 'p2', name: "Ácido Graxo", pathIdx: 0, atp: 0, nadh: 0, fadh: 0, skipTurn: false, bonusMove: 0 }
};


let currentPlayer = 'p1';
let gameFinished = false;


// --- Rendering ---
const boardContainer = document.getElementById('board-nodes');


function renderBoard() {
    // 1. Render Lines (SVG)
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.style.position = "absolute";
    svg.style.top = "0"; svg.style.left = "0";
    svg.style.width = "100%"; svg.style.height = "100%";
    svg.style.pointerEvents = "none";
    svg.style.zIndex = "1";
    boardContainer.appendChild(svg);


    function drawLine(n1, n2, glowColor) {
        if (!n1 || !n2) return;


        // Background thick outline (engraved look)
        const outline = document.createElementNS("http://www.w3.org/2000/svg", "line");
        outline.setAttribute("x1", n1.x + "%"); outline.setAttribute("y1", n1.y + "%");
        outline.setAttribute("x2", n2.x + "%"); outline.setAttribute("y2", n2.y + "%");
        outline.setAttribute("stroke", "#1e293b");
        outline.setAttribute("stroke-width", "16");
        outline.setAttribute("stroke-linecap", "round");


        // Inner actual track line (bottom shadow)
        const track = document.createElementNS("http://www.w3.org/2000/svg", "line");
        track.setAttribute("x1", n1.x + "%"); track.setAttribute("y1", n1.y + "%");
        track.setAttribute("x2", n2.x + "%"); track.setAttribute("y2", n2.y + "%");
        track.setAttribute("stroke", "#0f172a");
        track.setAttribute("stroke-width", "10");
        track.setAttribute("stroke-linecap", "round");


        // The colored path indicator line
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", n1.x + "%"); line.setAttribute("y1", n1.y + "%");
        line.setAttribute("x2", n2.x + "%"); line.setAttribute("y2", n2.y + "%");
        line.setAttribute("stroke", glowColor);
        line.setAttribute("stroke-width", "4");
        line.setAttribute("stroke-dasharray", "8,8");
        line.setAttribute("stroke-linecap", "round");
        line.setAttribute("opacity", "0.8");


        svg.appendChild(outline);
        svg.appendChild(track);
        svg.appendChild(line);
    }


    for (let i = 0; i < paths.p1.length - 1; i++) {
        drawLine(nodes[paths.p1[i]], nodes[paths.p1[i + 1]], "#38bdf8");
    }
    for (let i = 0; i < paths.p2.length - 1; i++) {
        drawLine(nodes[paths.p2[i]], nodes[paths.p2[i + 1]], "#f472b6");
    }
    // Fechar o ciclo de Krebs visualmente (Malato -> Citrato/Acetil-CoA)
    drawLine(nodes[14], nodes[11], "#475569");




    // 2. Render Nodes
    nodes.forEach(node => {
        const el = document.createElement('div');
        el.className = `node type-${node.type}`;
        el.style.left = `${node.x}%`;
        el.style.top = `${node.y}%`;
        el.id = `node-${node.id}`;


        // Show Icon or ID
        let content = node.id;
        if (node.type === 'event') content = "⚠️";
        if (node.type === 'end') content = "FIM";


        el.innerHTML = `
            ${content}
            <div class="node-label ${node.y >= 65 ? 'label-up' : ''}">
                <strong>${node.name}</strong>
                <span>${node.desc}</span>
            </div>
        `;
        boardContainer.appendChild(el);
    });


    // 3. Render Tokens
    const tk1 = document.createElement('div');
    tk1.className = 'player-token token-p1';
    tk1.id = 'token-p1';
    boardContainer.appendChild(tk1);


    const tk2 = document.createElement('div');
    tk2.className = 'player-token token-p2';
    tk2.id = 'token-p2';
    boardContainer.appendChild(tk2);


    updateTokenPositions();
}


function updateTokenPositions() {
    const node1 = nodes[paths.p1[players.p1.pathIdx]];
    const node2 = nodes[paths.p2[players.p2.pathIdx]];


    const tk1 = document.getElementById('token-p1');
    tk1.style.left = `${node1.x}%`; tk1.style.top = `${node1.y}%`;


    const tk2 = document.getElementById('token-p2');
    tk2.style.left = `${node2.x}%`; tk2.style.top = `${node2.y}%`;
}


function updateHUD() {
    document.getElementById('atp-p1').innerText = players.p1.atp;
    document.getElementById('nadh-p1').innerText = players.p1.nadh;
    document.getElementById('fadh-p1').innerText = players.p1.fadh;


    document.getElementById('atp-p2').innerText = players.p2.atp;
    document.getElementById('nadh-p2').innerText = players.p2.nadh;
    document.getElementById('fadh-p2').innerText = players.p2.fadh;


    const n1 = nodes[paths.p1[players.p1.pathIdx]];
    document.getElementById('pos-name-p1').innerText = n1.name;
    document.getElementById('pos-desc-p1').innerText = n1.desc;


    const n2 = nodes[paths.p2[players.p2.pathIdx]];
    document.getElementById('pos-name-p2').innerText = n2.name;
    document.getElementById('pos-desc-p2').innerText = n2.desc;


    document.getElementById('card-p1').classList.toggle('active', currentPlayer === 'p1');
    document.getElementById('card-p2').classList.toggle('active', currentPlayer === 'p2');


    document.getElementById('status-message').innerText = `Vez do Jogador: ${players[currentPlayer].name}`;
}


// --- Game Logic ---
function movePlayer(playerKey, steps) {
    if (gameFinished) return;
    const p = players[playerKey];
    const path = paths[playerKey];


    let newIdx = p.pathIdx + steps;
    if (newIdx >= path.length) newIdx = path.length - 1;
    if (newIdx < 0) newIdx = 0;


    p.pathIdx = newIdx;
    updateTokenPositions();
    handleNodeArrival(playerKey, newIdx, path);
}


function handleNodeArrival(playerKey, pathIdx, path) {
    const p = players[playerKey];
    const node = nodes[path[pathIdx]];


    // 1. Resolve passive effects
    if (node.effect === "exchange") {
        // Cadeia respiratória
        const atpGain = (p.nadh * 3) + (p.fadh * 2);
        p.atp += atpGain;
        p.nadh = 0;
        p.fadh = 0;
        showModal("Fosforilação Oxidativa!", `Oxidação concluída na cadeia respiratória! Seus transportadores viraram ATP.<br><br>Ganho de <strong>${atpGain} ATPs</strong>.`, () => {
            updateHUD();
            nextTurn();
        });
        return;
    } else if (node.effect === "end") {
        updateHUD();
        nextTurn();
        return;
    } else if (typeof node.effect === "object") {
        if (node.effect.atp) p.atp += node.effect.atp;
        if (node.effect.nadh) p.nadh += node.effect.nadh;
        if (node.effect.fadh) p.fadh += node.effect.fadh;
    }


    // 2. Process Trigger Events
    if (node.type === "event") {
        const ev = events[Math.floor(Math.random() * events.length)];
        const isBad = ev.apply(p);


        if (isBad) {
            sfxBad.currentTime = 0;
            sfxBad.play().catch(e => console.log("Áudio ruim bloqueado:", e));
        }


        showModal(`Evento: ${ev.title}`, ev.desc, () => {
            updateHUD();
            if (p.bonusMove !== 0) {
                const moves = p.bonusMove;
                p.bonusMove = 0;
                movePlayer(playerKey, moves); // Recursive via bonus move
            } else {
                nextTurn();
            }
        });
    } else {
        updateHUD();
        nextTurn();
    }
}


const sfxWin = new Audio('../ElevenLabs_ambiente_de_celebração_animada,_grupo_de_mulheres_elegantes_aplaudindo_e_torcendo_com_entusiasmo,_ri.mp3');
const sfxDice = new Audio('../ElevenLabs_rolando_dados.mp3');
const sfxBad = new Audio('../universfield-ooh-123103.mp3');
const sfxMenu = new Audio('../starostin-comedy-cartoon-funny-background-music-492540.mp3');
sfxMenu.loop = true;


function checkGameEnd() {
    if (players.p1.pathIdx === paths.p1.length - 1 || players.p2.pathIdx === paths.p2.length - 1) {
        gameFinished = true;
        sfxWin.play().catch(e => console.log("Áudio bloqueado pelo navegador:", e));


        // Auto-convert any remaining NADH/FADH2 to ATP to ensure a fair final score NA HORA
        const p1Bonus = (players.p1.nadh * 3) + (players.p1.fadh * 2);
        players.p1.atp += p1Bonus; players.p1.nadh = 0; players.p1.fadh = 0;


        const p2Bonus = (players.p2.nadh * 3) + (players.p2.fadh * 2);
        players.p2.atp += p2Bonus; players.p2.nadh = 0; players.p2.fadh = 0;


        updateHUD();


        let winnerText = "Empate Metabólico!";
        if (players.p1.atp > players.p2.atp) winnerText = "🏆 Glicose Venceu! O Carboidrato dominou o final.";
        if (players.p2.atp > players.p1.atp) winnerText = "🏆 Ácido Graxo Venceu! O Lipídio explodiu de energia.";


        showModal(
            "Jogo Encerrado! 🏁",
            `Uma das moléculas cruzou a linha de chegada encerrando o jogo!<br>
            <i>(Todo o poder redutor residual foi convertido automaticamente)</i><br><br>
            Placar Final de Energia:<br>
            <b style="color:#38bdf8;">Glicose: ${players.p1.atp} ATP</b><br>
            <b style="color:#a855f7;">Ácido Graxo: ${players.p2.atp} ATP</b><br><br>
            <strong style="font-size:1.3rem;">${winnerText}</strong>`,
            () => {
                document.getElementById('btn-roll').style.display = 'none';
                document.getElementById('btn-reset').style.display = 'inline-block';
            }
        );
        return true;
    }
    return false;
}


function nextTurn() {
    if (checkGameEnd()) return;


    // Switch player
    currentPlayer = currentPlayer === 'p1' ? 'p2' : 'p1';
    const p = players[currentPlayer];


    updateHUD();


    // Player finished? Skip him.
    if (p.pathIdx === paths[currentPlayer].length - 1) {
        currentPlayer = currentPlayer === 'p1' ? 'p2' : 'p1'; // Switch back
        updateHUD();
        // If the other player is also finished, checkGameEnd has just handled it (because it checks both).
    } else if (p.skipTurn) {
        showModal("Vez Perdida ❌", `${p.name} perdeu esta rodada devido a um efeito clínico anterior!`, () => {
            p.skipTurn = false;
            nextTurn();
        });
        return;
    }
}


function rollDice() {
    if (gameFinished) return;


    // Toca o som de rolar dados
    sfxDice.currentTime = 0;
    sfxDice.play().catch(e => console.log("Áudio bloqueado pelo navegador:", e));


    // Dice 1-3 to ensure players interact with paths and events
    const result = Math.floor(Math.random() * 3) + 1;


    const diceEl = document.getElementById('dice-result');
    diceEl.innerText = result;


    // Animate dice slightly
    diceEl.style.transform = 'scale(1.5)';
    setTimeout(() => { diceEl.style.transform = 'scale(1)'; }, 200);


    const btn = document.getElementById('btn-roll');
    btn.disabled = true;


    // Wait a brief moment before moving to make it feel natural
    setTimeout(() => {
        btn.disabled = false;
        movePlayer(currentPlayer, result);
    }, 600);
}


// Modal Handling
function showModal(title, desc, callback) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-desc').innerHTML = desc;


    const overlay = document.getElementById('event-modal');
    overlay.classList.remove('hidden');


    const btn = document.getElementById('btn-modal-close');
    btn.onclick = () => {
        overlay.classList.add('hidden');
        if (callback) callback();
    };
}


// Event Listeners
let isMenuAudioStarted = false;
const playMenuMusic = () => {
    if (!isMenuAudioStarted && document.getElementById('start-menu').style.display !== 'none') {
        sfxMenu.play().then(() => {
            isMenuAudioStarted = true;
        }).catch(e => {
            // Ignora silenciosamente até o navegador liberar (política de autoplay)
        });
    }
};


window.addEventListener('load', playMenuMusic);
document.body.addEventListener('click', playMenuMusic);
document.body.addEventListener('mousemove', playMenuMusic);
document.body.addEventListener('keydown', playMenuMusic);


document.getElementById('btn-start').addEventListener('click', (e) => {
    e.stopPropagation(); // Impede o "borbulhamento" de reativar a música
    sfxMenu.pause(); // Para a música do menu ao iniciar
    document.getElementById('start-menu').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
});


document.getElementById('btn-menu-rules').addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('rules-modal').classList.remove('hidden');
    playMenuMusic(); // Tenta tocar caso ainda não tenha ativado
});


document.getElementById('btn-roll').addEventListener('click', rollDice);
document.getElementById('btn-reset').addEventListener('click', () => {
    players.p1 = { id: 'p1', name: "Glicose", pathIdx: 0, atp: 0, nadh: 0, fadh: 0, skipTurn: false, bonusMove: 0 };
    players.p2 = { id: 'p2', name: "Ácido Graxo", pathIdx: 0, atp: 0, nadh: 0, fadh: 0, skipTurn: false, bonusMove: 0 };
    currentPlayer = 'p1';
    gameFinished = false;
    updateTokenPositions();
    updateHUD();
    document.getElementById('btn-roll').style.display = 'inline-block';
    document.getElementById('btn-roll').disabled = false;
    document.getElementById('btn-reset').style.display = 'none';
    document.getElementById('dice-result').innerText = '-';
});
document.getElementById('btn-rules').addEventListener('click', () => {
    document.getElementById('rules-modal').classList.remove('hidden');
});
document.getElementById('btn-rules-close').addEventListener('click', () => {
    document.getElementById('rules-modal').classList.add('hidden');
});


// Initialization
renderBoard();
updateHUD();
