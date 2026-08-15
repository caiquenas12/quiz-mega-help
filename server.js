const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// Serve arquivos estáticos da pasta atual (imagens, css, js)
app.use(express.static(__dirname));

// =====================================================
// ROTAS DOS LINKS (TELÃO / PROFESSOR E ALUNOS)
// =====================================================

// 1. LINK DO TELÃO DO PROFESSOR (https://seu-dominio.com/professor)
app.get('/professor', (req, res) => {
  res.sendFile(path.join(__dirname, 'professor.html'));
});

// 2. LINK DOS ALUNOS (https://seu-dominio.com/)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'aluno.html'));
});

// =====================================================
// BASE DE DADOS DAS PERGUNTAS
// =====================================================
const perguntas = [
  {
    numero: 1,
    tema: "Geografia",
    question: "Qual é o rio mais extenso do mundo? ",
    options: ["Rio Nilo ", "Rio Amazonas", "Rio Yangtzé ", "Rio Mississipi "],
    correct: 1,
    tempo: 20
  },
  {
    numero: 2,
    tema: "História",
    question: "Em que ano ocorreu a Independência do Brasil?",
    options: ["1500", "1822", "1889", "1930"],
    correct: 1,
    tempo: 20
  },
  {
    numero: 3,
    tema: "Matemática",
    question: "Qual é o perímetro de um quadrado com lado de 5 cm?",
    options: ["15cm", "20cm", "25cm", "30cm"],
    correct: 1,
    tempo: 20
  },
  {
    numero: 4,
    tema: "Português",
    question: "Na frase “Pedro estudou muito, portanto conseguiu uma boa nota”, a palavra “portanto” indica:",
    options: ["Conclusão", "Causa", "Oposição", "Condição"],
    correct: 0,
    tempo: 20
  },
  {
    numero: 5,
    tema: "Química",
    question: "Qual é o gás usado em refrigerantes para formar bolhas?",
    options: ["Oxigênio ", "Nitrogênio", "Hidrogênio", "Dióxido de carbono"],
    correct: 3,
    tempo: 20
  },
  {
    numero: 6,
    tema: "Biologia",
    question: "Qual órgão é responsável pela absorção da maior parte dos nutrientes?",
    options: ["Estômago ", "Fígado", "Intestino delgado", "Pâncreas"],
    correct: 2,
    tempo: 20
  },
  {
    numero: 7,
    tema: "Física",
    question: "Qual é o valor aproximado da aceleração da gravidade na superfície da Terra?",
    options: ["9,8/m/s² ", "5,4m/s²", "7m/s²", "8m/s²"],
    correct: 0,
    tempo: 20
  },
  {
    numero: 8,
    tema: "Português",
    question: "Na frase “Estou morrendo de fome”, qual figura de linguagem foi utilizada?",
    options: ["Metáfora", "Ironia", "Personificação", "Hipérbole"],
    correct: 0,
    tempo: 20
  },
  {
    numero: 9,
    tema: "Esporte",
    question: "Qual é o esporte praticado na Fórmula 1?",
    options: ["Motociclismo ", "Kart", "Automobilismo", "Rally"],
    correct: 2,
    tempo: 20
  },
  {
    numero: 10,
    tema: "Inglês",
    question: "Em inglês, qual é a tradução de Chair?",
    options: ["Cadeira ", "Mesa", "Janela", "Porta"],
    correct: 0,
    tempo: 20
  },
  {
    numero: 11,
    tema: "Geografia",
    question: "Qual é o maior país da América do Sul?  ",
    options: ["Argentina ", "Peru", "Chile", " Brasil"],
    correct: 3,
    tempo: 20
  },
  {
    numero: 12,
    tema: "Português",
    question: "Qual é o verbo da frase “Maria corre rápido”?  ",
    options: ["Maria", "Rápido", "Corre", "Nenhuma das alternativas"],
    correct: 2,
    tempo: 20
  },
  {
    numero: 13,
    tema: "História",
    question: "Qual civilização construiu as pirâmides? ",
    options: ["Maias ", "Romanos", "Egípcios", " Incas"],
    correct: 2,
    tempo: 20
  },
  {
    numero: 14,
    tema: "Matemática",
    question: "Qual é a área de um quadrado com lado de 7 cm? ",
    options: ["42cm² ", "49cm²", "56cm²", " 63cm²"],
    correct: 1,
    tempo: 20
  },
  {
    numero: 15,
    tema: "Química",
    question: "Qual gás é essencial para que o fogo continue aceso? ",
    options: ["Nitrogênio ", "Oxigênio", "Hidrogênio", " Dióxido de carbono"],
    correct: 1,
    tempo: 20
  },
  {
    numero: 16,
    tema: " Biologia",
    question: "Qual órgão é responsável pela filtração do sangue e formação da urina? ",
    options: ["Bexiga ", "Rins", "Uretra", " Estômago"],
    correct: 1,
    tempo: 20
  },
  {
    numero: 17,
    tema: " Fisica",
    question: "Ao fazer uma curva, qual é a força aparente que parece empurrar o motorista para fora? ",
    options: ["Força centrípeta ", "Força gravitacional", "Força de atrito", " Força centrífuga"],
    correct: 3,
    tempo: 20
  },
  {
    numero: 18,
    tema: " Português",
    question: "Qual é o tempo verbal da frase “Eu estudei ontem”? ",
    options: ["Presente ", "Futuro", "Passado", " Gerúndio"],
    correct: 2,
    tempo: 20
  }
];

// =====================================================
// ESTADO GLOBAL DO SERVIDOR
// =====================================================
let jogadores = {};
let perguntaAtualIndex = -1;
let tempoRestante = 0;
let timerInterval = null;
let quizFinalizado = false;
let isStartingQuestion = false;

// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

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

      console.log(`⏱️ Tempo esgotado na pergunta ${perguntaAtualIndex + 1}.`);

      io.emit("tempo_esgotado", {
        respostaCorreta: qAtual ? qAtual.correct : 0,
        ranking: todosOrdenados.slice(0, 12)
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

  // 1. REGISTRO DO JOGADOR / ALUNO
  socket.on('entrar_quiz', (data = {}) => {
    const fotoPadrao = "https://cdn-icons-png.flaticon.com/512/847/847969.png";

    jogadores[socket.id] = {
      id: socket.id,
      nome: sanitizarEntrada(data.nome, 'Aluno'),
      escola: sanitizarEntrada(data.escola, 'Escola Geral'),
      foto: (data.foto && typeof data.foto === 'string' && data.foto.trim() !== "" && data.foto !== "null")
        ? data.foto.trim()
        : fotoPadrao,
      pontos: 0,
      respondeu: false
    };

    console.log(`👤 Aluno registrado: ${jogadores[socket.id].nome} (${jogadores[socket.id].escola})`);
  });

  // 2. SOLICITAÇÃO DE RANKING OU TELA FINAL PELO TELÃO
  socket.on('obter_ranking', () => {
    const todosOrdenados = obterRankingOrdenado();

    if (perguntaAtualIndex >= perguntas.length - 1) {
      quizFinalizado = true;
      const top3 = todosOrdenados.slice(0, 3);
      console.log("🏆 ENVIANDO PÓDIO FINAL:", top3);
      io.emit("fim_quiz", { podium: top3 });
    } else {
      const rankingTop12 = todosOrdenados.slice(0, 12);
      console.log("📊 TOP 12 ENVIADO PARA O TELÃO:", rankingTop12.length, "participantes");
      io.emit('mostrar_ranking', { ranking: rankingTop12 });
    }
  });

  // 3. AVANÇAR PARA A PRÓXIMA PERGUNTA
  socket.on('proxima_pergunta', () => {
    if (quizFinalizado || isStartingQuestion) return;

    isStartingQuestion = true;
    perguntaAtualIndex++;

    if (perguntaAtualIndex < perguntas.length) {
      const q = perguntas[perguntaAtualIndex];
      tempoRestante = q.tempo;

      Object.keys(jogadores).forEach(id => {
        if (jogadores[id]) {
          jogadores[id].respondeu = false;
        }
      });

      console.log(`❓ Iniciando Pergunta ${perguntaAtualIndex + 1}/${perguntas.length}: ${q.question}`);
      io.emit('nova_pergunta', q);
      iniciarCronometro();
    } else {
      quizFinalizado = true;
      const top3 = obterRankingOrdenado().slice(0, 3);
      console.log("🏁 QUIZ FINALIZADO! ENVIANDO PÓDIO FINAL.");
      io.emit("fim_quiz", { podium: top3 });
    }

    isStartingQuestion = false;
  });

  // 4. REINICIAR QUIZ
  socket.on('reiniciar_quiz', () => {
    perguntaAtualIndex = -1;
    quizFinalizado = false;
    isStartingQuestion = false;
    clearInterval(timerInterval);

    jogadores = {}; // Alterado para resetar todos os jogadores da partida anterior

    console.log("🔄 Quiz reiniciado com sucesso.");
    io.emit('quiz_reiniciado');
  });

  // 5. RECEBER RESPOSTA DO PARTICIPANTE
  socket.on('enviar_resposta', (index) => {
    const jogador = jogadores[socket.id];
    const q = perguntas[perguntaAtualIndex];

    if (jogador && !jogador.respondeu && q && !quizFinalizado && tempoRestante > 0) {
      jogador.respondeu = true;

      if (Number(index) === q.correct) {
        const pontosGanhos = 10 + tempoRestante;
        jogador.pontos += pontosGanhos;

        socket.emit('resultado_resposta', {
          correto: true,
          pontos: pontosGanhos,
          totalPontos: jogador.pontos
        });
      } else {
        socket.emit('resultado_resposta', {
          correto: false,
          pontos: 0,
          totalPontos: jogador.pontos
        });
      }
    }
  });

  // 6. DESCONEXÃO DO CLIENTE
  socket.on('disconnect', () => {
    if (jogadores[socket.id]) {
      console.log(`❌ Cliente desconectado: ${jogadores[socket.id].nome} (${socket.id})`);
      delete jogadores[socket.id];
    } else {
      console.log(`❌ Cliente não registrado desconectado: ${socket.id}`);
    }
  });
});

// =====================================================
// INICIALIZAÇÃO DO SERVIDOR
// =====================================================
const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=====================================================`);
  console.log(`🚀 SERVIDOR MEGA HELP 2026 RODANDO EM http://localhost:${PORT}`);
  console.log(`=====================================================`);
});
