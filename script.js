// Conexão com o Socket.io
const socket = io();
let fotoBase64 = "";

// 1. COMPRESSÃO E PRÉ-VISUALIZAÇÃO DA FOTO DE PERFIL
const fotoInput = document.getElementById("foto-input");
if (fotoInput) {
  fotoInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.src = e.target.result;
      img.onload = function () {
        // Redimensiona para 150x150 para não sobrecarregar a memória nem a rede
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = 150;
        canvas.height = 150;
        ctx.drawImage(img, 0, 0, 150, 150);
        fotoBase64 = canvas.toDataURL("image/jpeg", 0.7);

        const preview = document.getElementById("preview-foto");
        if (preview) preview.src = fotoBase64;
      };
    };
    reader.readAsDataURL(file);
  });
}

// 2. BOTÃO DE ENTRAR NO GAME
const btnEntrar = document.getElementById("btn-entrar");
if (btnEntrar) {
  btnEntrar.onclick = function () {
    const nomeInput = document.getElementById("nome").value;
    const escolaInput = document.getElementById("escola").value;

    if (!nomeInput.trim()) {
      alert("Por favor, digite seu nome antes de entrar!");
      return;
    }

    // Dispara registro para o server.js
    socket.emit("entrar_quiz", {
      nome: nomeInput,
      escola: escolaInput,
      foto: fotoBase64
    });

    // Troca de tela
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("game-screen").style.display = "block";
  };
}

// 3. RECEBER NOVA PERGUNTA
socket.on("nova_pergunta", (q) => {
  const statusEl = document.getElementById("status");
  const feedbackEl = document.getElementById("feedback");
  const container = document.getElementById("options-aluno");
  const questionContainer = document.getElementById("question-container");
  const questionText = document.getElementById("aluno-question");
  const temaText = document.getElementById("aluno-tema");
  const cronometroText = document.getElementById("aluno-cronometro");

  if (statusEl) statusEl.textContent = "";
  if (feedbackEl) feedbackEl.textContent = "";
  if (container) container.innerHTML = "";

  if (q) {
    if (temaText) temaText.textContent = q.tema || "Conhecimentos Gerais";
    if (cronometroText) cronometroText.textContent = `⏱️ ${q.tempo || '--'}s`;

    if (q.question) {
      if (questionText) {
        questionText.textContent = `${q.numero ? q.numero + '. ' : ''}${q.question}`;
      }
      if (questionContainer) questionContainer.style.display = "block";
    } else if (questionContainer) {
      questionContainer.style.display = "none";
    }

    if (q.options && container) {
      q.options.forEach((opt, index) => {
        const btn = document.createElement("button");
        btn.className = `option-btn opt-${index % 4}`;
        btn.dataset.index = index; // <--- ACRESCENTADO: Salva o índice do botão
        btn.textContent = opt;

        btn.onclick = () => {
          // Envia o índice escolhido (0, 1, 2 ou 3)
          socket.emit("enviar_resposta", index);
          
          // Trava todos os botões após responder
          container.querySelectorAll("button").forEach(b => {
            b.disabled = true;
            b.classList.remove("selected"); // <--- ACRESCENTADO
          });
          btn.classList.add("selected"); // <--- ACRESCENTADO: Marca a escolha do aluno

          if (statusEl) statusEl.textContent = "Resposta enviada! Aguarde...";
        };

        container.appendChild(btn);
      });
    }
  }
});

// 4. ATUALIZAÇÃO DO CRONÔMETRO
socket.on("tick_tempo", (tempo) => {
  const cronometroText = document.getElementById("aluno-cronometro");
  if (cronometroText) {
    cronometroText.textContent = `⏱️ ${tempo}s`;
  }
});

// 5. RESULTADO DA RESPOSTA (Feedback individual)
socket.on("resultado_resposta", (data) => {
  const fb = document.getElementById("feedback");
  const placar = document.getElementById("placar-total");

  // <--- ACRESCENTADO: Destaca os botões correto/errado
  const buttons = document.querySelectorAll("#options-aluno .option-btn");
  buttons.forEach(btn => {
    const btnIndex = parseInt(btn.dataset.index);
    if (data.respostaCorreta !== undefined && btnIndex === data.respostaCorreta) {
      btn.classList.add("correct-answer");
    } else if (btn.classList.contains("selected") && !data.correto) {
      btn.classList.add("wrong-answer");
    }
  });

  if (fb) {
    if (data.correto) {
      fb.textContent = `✅ VOCÊ ACERTOU! (+${data.pontos || 0} pts)`;
      fb.style.color = "#00ff66";
    } else {
      fb.textContent = "❌ RESPOSTA ERRADA!";
      fb.style.color = "#ff4444";
    }
  }

  // Se o servidor retornar o total acumulado, exibe
  if (placar && data.totalPontos !== undefined) {
    placar.textContent = `Pontuação Total: ${data.totalPontos} pts`;
  }
});

// <--- ACRESCENTADO: Revela a resposta correta caso venha um evento de revelação do servidor
socket.on("revelar_resposta", (data) => {
  const buttons = document.querySelectorAll("#options-aluno .option-btn");
  buttons.forEach(btn => {
    btn.disabled = true;
    if (data.respostaCorreta !== undefined && parseInt(btn.dataset.index) === data.respostaCorreta) {
      btn.classList.add("correct-answer");
    }
  });
});

// 6. TEMPO ESGOTADO
socket.on("tempo_esgotado", () => {
  const cronometroText = document.getElementById("aluno-cronometro");
  if (cronometroText) cronometroText.textContent = "⌛ ESGOTADO!";

  // Bloqueia qualquer clique restante
  document.querySelectorAll("#options-aluno button").forEach(b => b.disabled = true);

  const fb = document.getElementById("feedback");
  if (fb && !fb.textContent) {
    fb.textContent = "⏰ O tempo acabou!";
    fb.style.color = "#ffaa00";
  }
});

// 7. QUIZ REINICIADO PELO TELÃO
socket.on("quiz_reiniciado", () => {
  const statusEl = document.getElementById("status");
  const container = document.getElementById("options-aluno");
  const questionContainer = document.getElementById("question-container");
  const fb = document.getElementById("feedback");
  const placar = document.getElementById("placar-total");

  if (statusEl) statusEl.textContent = "Aguardando o professor iniciar...";
  if (container) container.innerHTML = "";
  if (questionContainer) questionContainer.style.display = "none";
  if (fb) fb.textContent = "";
  if (placar) placar.textContent = "";
});
