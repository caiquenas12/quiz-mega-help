{ tema: "Português", question: "Qual das palavras abaixo representa um sinônimo de 'alegre'?", options: ["Triste", "Contente", "Bravo", "Calmo"], correct: 1, tempo: 20 }
],

  // --- BIOLOGIA ---
  { tema: "Biologia", question: "Qual é a unidade fundamental e funcional da vida?", options: ["Átomo", "Tecido", "Célula", "Órgão"], correct: 2, tempo: 20 },
  { tema: "Biologia", question: "Qual organela celular é responsável pela produção de energia (ATP)?", options: ["Complexo de Golgi", "Mitocôndria", "Ribossomo", "Lisossomo"], correct: 1, tempo: 20 },
  { tema: "Biologia", question: "Qual pigmento confere a cor verde às plantas e capta a luz solar?", options: ["Caroteno", "Hemoglobina", "Clorofila", "Melanina"], correct: 2, tempo: 20 },
  { tema: "Biologia", question: "Qual vaso sanguíneo transporta o sangue do coração para o resto do corpo?", options: ["Veia", "Capilar", "Artéria", "Vênula"], correct: 2, tempo: 20 },
  { tema: "Biologia", question: "O DNA tem o formato característico de uma:", options: ["Fita simples", "Dupla hélice", "Esfera", "Cadeia linear simples"], correct: 1, tempo: 20 }
];

// =====================================================
// ESTADO DO JOGO EM MEMÓRIA
// =====================================================
let jogadores = {}; // { socketId: { id, nome, pontos, respostas: {} } }
let estadoJogo = {
  emAndamento: false,
  perguntasAtuais: [],
  indicePergunta: 0,
  tempoRestante: 0,
  respostasRecebidas: 0
};

let timerInterval = null;

// =====================================================
// EVENTOS DO SOCKET.IO (COMUNICAÇÃO EM TEMPO REAL)
// =====================================================
io.on('connection', (socket) => {
  console.log(`[CONEXÃO]: Novo usuário conectado: ${socket.id}`);

  // 1. Aluno entra na sala
  socket.on('entrar', (dados) => {
    const nome = dados.nome ? dados.nome.trim() : 'Jogador Anônimo';
    
    jogadores[socket.id] = {
      id: socket.id,
      nome: nome,
      pontos: 0,
      respostaNaRodada: null
    };

    // Notifica o professor e atualiza a lista no painel dele
    io.emit('atualizarJogadores', Object.values(jogadores));
    
    // Confirma entrada para o aluno
    socket.emit('sucessoEntrada', { id: socket.id, nome });
    
    // Se o jogo já estiver rolando, informa o aluno
    if (estadoJogo.emAndamento) {
      socket.emit('jogoEmAndamento');
    }
  });

  // 2. Professor Inicia o Jogo
  socket.on('iniciarJogo', (config) => {
    if (estadoJogo.emAndamento) return;

    const quantidade = (config && config.qtdPerguntas) ? config.qtdPerguntas : 10;
    
    // Sorteia/Embaralha as perguntas do banco de dados
    const perguntasEmbaralhadas = [...bancoDePerguntasCompleto].sort(() => 0.5 - Math.random());
    
    estadoJogo.perguntasAtuais = perguntasEmbaralhadas.slice(0, quantidade);
    estadoJogo.indicePergunta = 0;
    estadoJogo.emAndamento = true;

    // Zera os pontos de todos os jogadores
    Object.keys(jogadores).forEach(id => {
      jogadores[id].pontos = 0;
      jogadores[id].respostaNaRodada = null;
    });

    io.emit('jogoIniciado');
    enviarPerguntaAtual();
  });

  // 3. Aluno envia uma resposta
  socket.on('responder', (dados) => {
    if (!estadoJogo.emAndamento) return;

    const jogador = jogadores[socket.id];
    const perguntaAtual = estadoJogo.perguntasAtuais[estadoJogo.indicePergunta];

    if (jogador && jogador.respostaNaRodada === null && perguntaAtual) {
      jogador.respostaNaRodada = dados.opcaoSelecionada;

      // Calcula pontuação (Correta + Bônus de Tempo)
      if (dados.opcaoSelecionada === perguntaAtual.correct) {
        const bonusTempo = estadoJogo.tempoRestante * 10;
        jogador.pontos += 100 + bonusTempo;
      }

      estadoJogo.respostasRecebidas++;

      // Atualiza o painel do professor com o status das respostas
      io.emit('respostaRegistrada', {
        totalJogadores: Object.keys(jogadores).length,
        respostasRecebidas: estadoJogo.respostasRecebidas
      });

      // Se todos já responderam antes do tempo acabar, encerra a rodada
      if (estadoJogo.respostasRecebidas >= Object.keys(jogadores).length) {
        clearInterval(timerInterval);
        finalizarRodada();
      }
    }
  });

  // 4. Professor força o avanço para a próxima pergunta
  socket.on('proximaPergunta', () => {
    if (!estadoJogo.emAndamento) return;
    clearInterval(timerInterval);
    avancarOuFinalizar();
  });

  // 5. Desconexão
  socket.on('disconnect', () => {
    console.log(`[DESCONEXÃO]: Usuário desconectado: ${socket.id}`);
    delete jogadores[socket.id];
    io.emit('atualizarJogadores', Object.values(jogadores));
  });
});

// =====================================================
// FUNÇÕES AUXILIARES DE LÓGICA DO JOGO
// =====================================================

function enviarPerguntaAtual() {
  const pergunta = estadoJogo.perguntasAtuais[estadoJogo.indicePergunta];
  estadoJogo.tempoRestante = pergunta.tempo || 20;
  estadoJogo.respostasRecebidas = 0;

  // Reseta estado de resposta de cada jogador para a nova rodada
  Object.keys(jogadores).forEach(id => {
    jogadores[id].respostaNaRodada = null;
  });

  // Envia a pergunta para todos os clientes sem revelar a resposta correta no client do aluno
  const dadosPerguntaPublica = {
    numeroPergunta: estadoJogo.indicePergunta + 1,
    totalPerguntas: estadoJogo.perguntasAtuais.length,
    tema: pergunta.tema,
    question: pergunta.question,
    options: pergunta.options,
    tempo: estadoJogo.tempoRestante
  };

  io.emit('novaPergunta', dadosPerguntaPublica);

  // Inicia o cronômetro
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    estadoJogo.tempoRestante--;
    io.emit('tempoAtualizado', estadoJogo.tempoRestante);

    if (estadoJogo.tempoRestante <= 0) {
      clearInterval(timerInterval);
      finalizarRodada();
    }
  }, 1000);
}

function finalizarRodada() {
  const perguntaAtual = estadoJogo.perguntasAtuais[estadoJogo.indicePergunta];

  // Envia o gabarito e o ranking atualizado
  io.emit('fimDaRodada', {
    respostaCorreta: perguntaAtual.correct,
    ranking: obterRanking()
  });
}

function avancarOuFinalizar() {
  estadoJogo.indicePergunta++;

  if (estadoJogo.indicePergunta < estadoJogo.perguntasAtuais.length) {
    enviarPerguntaAtual();
  } else {
    // Fim do Jogo
    estadoJogo.emAndamento = false;
    io.emit('fimDoJogo', {
      rankingFinal: obterRanking()
    });
  }
}

function obterRanking() {
  return Object.values(jogadores)
    .sort((a, b) => b.pontos - a.pontos);
}

// =====================================================
// INICIALIZAÇÃO DO SERVIDOR
// =====================================================
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 Servidor rodando com sucesso!`);
  console.log(`📍 Telão/Professor: http://localhost:${PORT}/professor`);
  console.log(`📱 Alunos/Dispositivos: http://localhost:${PORT}/`);
  console.log(`==================================================\n`);
});
