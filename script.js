const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.static('public')); // Servindo arquivos estáticos

// =====================================================
// BANCO E ESTADO DO QUIZ
// =====================================================
let perguntas = []; // Sorteio de perguntas
let jogadores = {}; 
let socketParaJogadorKey = {}; 
let perguntaAtualIndex = -1;
let tempoRestante = 0;
let timerInterval = null;
let quizFinalizado = false;
let isStartingQuestion = false;

let rodadaAtual = 1;
let finalistasChaves = []; 
let jogadoresEliminados = new Set(); 

// Exemplo de Banco de Perguntas (substitua pelo seu completo)
const bancoDePerguntasCompleto = [
  { tema: "História", question: "Em que ano ocorreu a Independência do Brasil?", options: ["1822", "1889", "1500", "1988"], correct: 0, tempo: 15 },
  { tema: "Ciências", question: "Qual é o símbolo químico da água?", options: ["CO2", "H2O", "NaCl", "O2"], correct: 1, tempo: 15 }
];

function sortearPerguntasSemRepetirTema() {
  const TOTAL_QUESTOES = 18; 
  const porTema = {};

  bancoDePerguntasCompleto.forEach(q => {
    if (!porTema[q.tema]) porTema[q.tema] = [];
    porTema[q.tema].push({ ...q });
  });

  Object.keys(porTema).forEach(tema => {
    porTema[tema].sort(() => Math.random() - 0.5);
  });

  const selecionadas = [];
  const temasDisponiveis = Object.keys(porTema);
  let cicloTemas = [...temasDisponiveis].sort(() => Math.random() - 0.5);

  while (selecionadas.length < TOTAL_QUESTOES && temasDisponiveis.length > 0) {
    if (cicloTemas.length === 0) {
      cicloTemas = [...temasDisponiveis].sort(() => Math.random() - 0.5);
    }

    const temaAtual = cicloTemas.pop();

    if (porTema[temaAtual] && porTema[temaAtual].length > 0) {
      const perguntaExtraida = porTema[temaAtual].pop();
      selecionadas.push(perguntaExtraida);
    }
  }

  selecionadas.forEach((q, index) => {
    q.numero = index + 1;
  });

  perguntas = selecionadas;
  console.log(`🎲 Sorteio realizado! ${perguntas.length} perguntas preparadas.`);
}

sortearPerguntasSemRepetirTema();

function obterRankingOrdenado() {
  return Object.values(jogadores).sort((a, b) => b.pontos - a.pontos);
}

function iniciarCronometro() {
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    tempoRestante--;
    io.emit("tick_tempo", tempoRestante);

    if (tempoRestante <= 0) {
      clearInterval(timerInterval);

      const todosOrdenados = obterRankingOrdenado();
      const qAtual = perguntas[perguntaAtualIndex];
      const limiteRanking = (rodadaAtual === 2) ? 4 : 12;

      console.log(`⏱️ Tempo esgotado na pergunta ${perguntaAtualIndex + 1}.`);

      io.emit("tempo_esgotado", {
        respostaCorreta: qAtual ? qAtual.correct : 0,
        ranking: todosOrdenados.slice(0, limiteRanking),
        rodada: rodadaAtual,
        limite: limiteRanking
      });
    }
  }, 1000);
}

function sanitizarEntrada(texto, fallback) {
  if (typeof texto !== "string" || !texto.trim()) return fallback;
  return texto.trim().substring(0, 40);
}

// =====================================================
// EVENTOS DO SOCKET.IO
// =====================================================
io.on('connection', (socket) => {
  console.log(`🔌 Novo cliente conectado: ${socket.id}`);

  // 1. REGISTRO / RECONEXÃO DO JOGADOR
  socket.on('entrar_quiz', (data = {}) => {
    const fotoPadrao = "https://cdn-icons-png.flaticon.com/512/847/847969.png";
    const nomeTratado = sanitizarEntrada(data.nome, 'Aluno');
    const escolaTratada = sanitizarEntrada(data.escola, 'Escola Geral');
    
    const chaveJogador = `${nomeTratado.toLowerCase()}_${escolaTratada.toLowerCase()}`;
    socketParaJogadorKey[socket.id] = chaveJogador;

    if (jogadoresEliminados.has(chaveJogador)) {
      socket.emit('eliminado_retornar_inicio', { mensagem: 'Sua entrada foi recusada.' });
      return;
    }

    if (jogadores[chaveJogador]) {
      jogadores[chaveJogador].socketId = socket.id;
      console.log(`🔄 Aluno reconectado: ${nomeTratado}`);
    } else {
      if (perguntaAtualIndex >= 0) {
        socket.emit('eliminado_retornar_inicio', { mensagem: 'O jogo já começou!' });
        return;
      }

      jogadores[chaveJogador] = {
        socketId: socket.id,
        chave: chaveJogador,
        nome: nomeTratado,
        escola: escolaTratada,
        foto: (data.foto && typeof data.foto === 'string' && data.foto.trim() !== "")
          ? data.foto.trim()
          : fotoPadrao,
        pontos: 0,
        respondeu: false
      };
      console.log(`👤 Novo aluno registrado: ${nomeTratado}`);
    }

    if (perguntaAtualIndex >= 0 && perguntaAtualIndex < perguntas.length && !quizFinalizado) {
      if (rodadaAtual === 1 || finalistasChaves.includes(chaveJogador)) {
        socket.emit('nova_pergunta', perguntas[perguntaAtualIndex]);
      }
    }
  });

  // 2. RECEBER RESPOSTA DO PARTICIPANTE
  socket.on('enviar_resposta', (index) => {
    const chave = socketParaJogadorKey[socket.id];
    const jogador = jogadores[chave];
    const q = perguntas[perguntaAtualIndex];

    if (rodadaAtual === 2 && !finalistasChaves.includes(chave)) return;

    if (jogador && !jogador.respondeu && q && !quizFinalizado && tempoRestante > 0) {
      jogador.respondeu = true;
      const acertou = Number(index) === q.correct;

      if (acertou) {
        const pontosGanhos = 10 + tempoRestante;
        jogador.pontos += pontosGanhos;

        socket.emit('resultado_resposta', {
          correto: true,
          pontos: pontosGanhos,
          totalPontos: jogador.pontos,
          respostaCorreta: q.correct
        });
      } else {
        socket.emit('resultado_resposta', {
          correto: false,
          pontos: 0,
          totalPontos: jogador.pontos,
          respostaCorreta: q.correct
        });
      }
    }
  });

  // 3. AVANÇAR PARA A PRÓXIMA PERGUNTA
  socket.on('proxima_pergunta', () => {
    if (quizFinalizado || isStartingQuestion) return;

    isStartingQuestion = true;
    perguntaAtualIndex++;

    if (perguntaAtualIndex === 10 && rodadaAtual === 1) {
      rodadaAtual = 2;
      const ranking = obterRankingOrdenado();
      finalistasChaves = ranking.slice(0, 4).map(j => j.chave);

      Object.values(jogadores).forEach(j => {
        if (j.socketId) {
          if (!finalistasChaves.includes(j.chave)) {
            // Elimina apenas quem NÃO ficou no TOP 4
            io.to(j.socketId).emit('eliminado_retornar_inicio', {
              mensagem: 'Você não avançou para o TOP 4.'
            });
            delete jogadores[j.chave];
          }
        }
      });

      io.emit('anunciar_top4', { 
        mensagem: "2ª rodada para os 4 primeiros colocados",
        top4: ranking.slice(0, 4),
        limite: 4
      });

      perguntaAtualIndex = 9;
      isStartingQuestion = false;
      return;
    }

    if (perguntaAtualIndex < perguntas.length) {
      const q = perguntas[perguntaAtualIndex];
      tempoRestante = q.tempo;

      Object.keys(jogadores).forEach(key => {
        if (jogadores[key]) jogadores[key].respondeu = false;
      });

      io.emit('nova_pergunta', q);
      iniciarCronometro();
    } else {
      quizFinalizado = true;
      const top3 = obterRankingOrdenado().slice(0, 3);
      io.emit("fim_quiz", { podium: top3 });
    }

    isStartingQuestion = false;
  });

  // 4. OBTER RANKING
  socket.on('obter_ranking', () => {
    const todosOrdenados = obterRankingOrdenado();
    if (perguntaAtualIndex >= perguntas.length - 1) {
      quizFinalizado = true;
      io.emit("fim_quiz", { podium: todosOrdenados.slice(0, 3) });
    } else {
      const limiteRanking = (rodadaAtual === 2) ? 4 : 12;
      io.emit('mostrar_ranking', { 
        ranking: todosOrdenados.slice(0, limiteRanking), 
        rodada: rodadaAtual,
        limite: limiteRanking
      });
    }
  });

  // 5. REINICIAR QUIZ
  socket.on('reiniciar_quiz', () => {
    perguntaAtualIndex = -1;
    rodadaAtual = 1;
    finalistasChaves = [];
    jogadoresEliminados.clear();
    quizFinalizado = false;
    isStartingQuestion = false;
    clearInterval(timerInterval);

    jogadores = {}; 
    socketParaJogadorKey = {};

    sortearPerguntasSemRepetirTema();

    console.log("🔄 Quiz reiniciado!");
    io.emit('quiz_reiniciado');
  });

  // 6. DESCONEXÃO
  socket.on('disconnect', () => {
    const chave = socketParaJogadorKey[socket.id];
    if (chave) delete socketParaJogadorKey[socket.id];
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
