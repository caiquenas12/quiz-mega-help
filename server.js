const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  pingTimeout: 60000,   // Tolera até 60s sem resposta (ideal para oscilações no celular)
  pingInterval: 25000
});

// Serve arquivos estáticos da pasta atual (imagens, css, js)
app.use(express.static(__dirname));

// =====================================================
// ROTAS DOS LINKS (TELÃO / PROFESSOR E ALUNOS)
// =====================================================

app.get('/professor', (req, res) => {
  res.sendFile(path.join(__dirname, 'professor.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'aluno.html'));
});

// =====================================================
// BASE DE DADOS COMPLETA DO WORD (200+ PERGUNTAS)
// =====================================================
const bancoDePerguntasCompleto = [
  // --- GEOGRAFIA ---
  { tema: "Geografia", question: "Qual é o rio mais extenso do mundo?", options: ["Rio Nilo", "Rio Amazonas", "Rio Yangtzé", "Rio Mississipi"], correct: 1, tempo: 20 },
  { tema: "Geografia", question: "Qual é o maior país do mundo em extensão territorial?", options: ["Canadá", "China", "Rússia", "Estados Unidos"], correct: 2, tempo: 20 },
  { tema: "Geografia", question: "Em qual continente está localizado o deserto do Saara?", options: ["Ásia", "África", "América do Sul", "Oceania"], correct: 1, tempo: 20 },
  { tema: "Geografia", question: "Qual é o país mais populoso do planeta?", options: ["Brasil", "China", "Índia", "Estados Unidos"], correct: 2, tempo: 20 },
  { tema: "Geografia", question: "Qual é a capital do Japão?", options: ["Kyoto", "Osaka", "Tóquio", "Hiroshima"], correct: 2, tempo: 20 },
  { tema: "Geografia", question: "Qual é o menor país do mundo em território?", options: ["Mônaco", "Vaticano", "San Marino", "Maldivas"], correct: 1, tempo: 20 },
  { tema: "Geografia", question: "Qual é a capital da Argentina?", options: ["Córdoba", "Buenos Aires", "Mendoza", "Rosário"], correct: 1, tempo: 20 },
  { tema: "Geografia", question: "Qual é a capital da França?", options: ["Marselha", "Lyon", "Paris", "Nice"], correct: 2, tempo: 20 },
  { tema: "Geografia", question: "Qual é o maior oceano do mundo?", options: ["Atlântico", "Pacífico", "Índico", "Ártico"], correct: 1, tempo: 20 },
  { tema: "Geografia", question: "Qual é o maior país da América do Sul?", options: ["Argentina", "Brasil", "Chile", "Peru"], correct: 1, tempo: 20 },
  { tema: "Geografia", question: "Qual é a capital da Itália?", options: ["Veneza", "Milão", "Roma", "Florença"], correct: 2, tempo: 20 },
  { tema: "Geografia", question: "Qual é o país que tem a maior floresta tropical do mundo?", options: ["Brasil", "Congo", "Indonésia", "Peru"], correct: 0, tempo: 20 },
  { tema: "Geografia", question: "Qual é a capital da Rússia?", options: ["São Petersburgo", "Moscou", "Novosibirsk", "Vladivostok"], correct: 1, tempo: 20 },
  { tema: "Geografia", question: "Qual país é atravessado pela Linha do Equador e pelo Trópico de Capricórnio?", options: ["Brasil", "México", "Indonésia", "Austrália"], correct: 0, tempo: 20 },
  { tema: "Geografia", question: "Qual é a capital mais alta do mundo em altitude?", options: ["Quito (Equador)", "La Paz (Bolívia)", "Bogotá (Colômbia)", "Katmandu (Nepal)"], correct: 1, tempo: 20 },
  { tema: "Geografia", question: "Qual é o mar conhecido por sua alta salinidade, onde é possível flutuar com facilidade?", options: ["Mar Mediterrâneo", "Mar Cáspio", "Mar Morto", "Mar Negro"], correct: 2, tempo: 20 },
  { tema: "Geografia", question: "Qual país possui três capitais oficiais?", options: ["África do Sul", "Nigéria", "Índia", "Austrália"], correct: 0, tempo: 20 },
  { tema: "Geografia", question: "Qual é o país que tem a maior quantidade de vulcões ativos?", options: ["Japão", "Indonésia", "Chile", "Islândia"], correct: 1, tempo: 20 },
  { tema: "Geografia", question: "Qual país é conhecido por ter mais pirâmides do que o Egito?", options: ["Sudão", "México", "Peru", "Índia"], correct: 0, tempo: 20 },
  { tema: "Geografia", question: "Qual país tem a maior produção de café do mundo?", options: ["Colômbia", "Brasil", "Vietnã", "Etiópia"], correct: 1, tempo: 20 },
  { tema: "Geografia", question: "Qual país é conhecido como 'a terra dos mil lagos'?", options: ["Canadá", "Finlândia", "Suécia", "Noruega"], correct: 1, tempo: 20 },
  { tema: "Geografia", question: "Qual é o país que possui a maior reserva de petróleo do mundo?", options: ["Arábia Saudita", "Venezuela", "Irã", "Estados Unidos"], correct: 1, tempo: 20 },
  { tema: "Geografia", question: "Qual país é conhecido por ter a maior quantidade de geleiras fora dos polos?", options: ["Canadá", "Rússia", "Chile", "Islândia"], correct: 2, tempo: 20 },
  { tema: "Geografia", question: "Qual país tem a maior costa marítima do mundo?", options: ["Austrália", "Canadá", "Rússia", "Estados Unidos"], correct: 1, tempo: 20 },
  { tema: "Geografia", question: "Qual é o país que possui a maior reserva de água doce superficial do mundo?", options: ["Canadá", "Brasil", "Rússia", "Estados Unidos"], correct: 1, tempo: 20 },

  // --- HISTÓRIA ---
  { tema: "História", question: "Qual navegante chegou ao Brasil em 1500?", options: ["Cristóvão Colombo", "Vasco da Gama", "Pedro Álvares Cabral", "Fernão de Magalhães"], correct: 2, tempo: 20 },
  { tema: "História", question: "Quem foi o último imperador do Brasil?", options: ["Pedro I", "Pedro II", "Dom João VI", "Tiradentes"], correct: 1, tempo: 20 },
  { tema: "História", question: "A Revolução Francesa começou em:", options: ["1492", "1789", "1815", "1917"], correct: 1, tempo: 20 },
  { tema: "História", question: "Qual cidade foi destruída por uma bomba atômica em 1945?", options: ["Tóquio", "Hiroshima", "Berlim", "Paris"], correct: 1, tempo: 20 },
  { tema: "História", question: "Onde nasceu a democracia?", options: ["Roma", "Atenas", "Paris", "Londres"], correct: 1, tempo: 20 },
  { tema: "História", question: "Qual civilização construiu as pirâmides?", options: ["Maias", "Egípcios", "Romanos", "Incas"], correct: 1, tempo: 20 },
  { tema: "História", question: "Em que ano ocorreu a Independência do Brasil?", options: ["1500", "1822", "1889", "1930"], correct: 1, tempo: 20 },
  { tema: "História", question: "Quem foi Tiradentes?", options: ["Líder da Inconfidência Mineira", "Imperador do Brasil", "Presidente da República", "Escritor"], correct: 0, tempo: 20 },
  { tema: "História", question: "Qual guerra ficou conhecida como 'Grande Guerra'?", options: ["Guerra Fria", "Primeira Guerra Mundial", "Segunda Guerra Mundial", "Guerra do Paraguai"], correct: 1, tempo: 20 },
  { tema: "História", question: "Quem foi Zumbi dos Palmares?", options: ["Escravo fugitivo e líder quilombola", "Senhor de engenho", "Escravo doméstico", "Missionário religioso"], correct: 0, tempo: 20 },
  { tema: "História", question: "Qual era o nome da primeira capital do Brasil?", options: ["Rio de Janeiro", "Salvador", "Brasília", "Recife"], correct: 1, tempo: 20 },
  { tema: "História", question: "Qual país iniciou a Revolução Industrial?", options: ["França", "Inglaterra", "Alemanha", "EUA"], correct: 1, tempo: 20 },
  { tema: "História", question: "Em que ano caiu o Muro de Berlim?", options: ["1961", "1989", "1945", "2001"], correct: 1, tempo: 20 },
  { tema: "História", question: "Qual era o nome da rainha que governou a Inglaterra no século XVI?", options: ["Elizabeth I", "Vitória", "Maria Antonieta", "Catarina"], correct: 0, tempo: 20 },
  { tema: "História", question: "Qual guerra envolveu Brasil, Argentina, Uruguai e Paraguai?", options: ["Guerra Fria", "Guerra do Paraguai", "Guerra dos Cem Anos", "Guerra Civil Espanhola"], correct: 1, tempo: 20 },
  { tema: "História", question: "Qual foi o principal marco da 1ª Revolução Industrial?", options: ["A invenção da eletricidade", "O uso de máquinas a vapor", "A criação da internet", "O desenvolvimento da energia nuclear"], correct: 1, tempo: 20 },
  { tema: "História", question: "Qual recurso natural foi essencial para as máquinas e indústrias na Inglaterra?", options: ["Petróleo", "Carvão e ferro", "Ouro e prata", "Madeira e água"], correct: 1, tempo: 20 },
  { tema: "História", question: "Qual foi uma das principais consequências sociais da 1ª Revolução Industrial?", options: ["Urbanização e crescimento das cidades", "Redução do trabalho infantil", "Fim das desigualdades sociais", "Aumento da qualidade de vida para todos"], correct: 0, tempo: 20 },
  { tema: "História", question: "Qual setor foi o primeiro a se industrializar?", options: ["Metalurgia", "Indústria Têxtil", "Agricultura", "Transporte"], correct: 1, tempo: 20 },
  { tema: "História", question: "Qual foi o tratado que encerrou a Primeira Guerra Mundial?", options: ["Tratado de Versalhes", "Tratado de Tordesilhas", "Tratado de Paris", "Tratado de Viena"], correct: 0, tempo: 20 },
  { tema: "História", question: "Em que ano ocorreu a queda de Constantinopla, marcando o fim da Idade Média?", options: ["1204", "1453", "1492", "1517"], correct: 1, tempo: 20 },
  { tema: "História", question: "Qual foi a principal causa da Guerra Fria?", options: ["Disputa territorial na África", "Rivalidade ideológica entre EUA e URSS", "Conflito religioso na Europa", "Expansão marítima portuguesa"], correct: 1, tempo: 20 },
  { tema: "História", question: "Quem foi o líder militar francês que se tornou imperador?", options: ["Luís XIV", "Napoleão Bonaparte", "Robespierre", "Carlos Magno"], correct: 1, tempo: 20 },
  { tema: "História", question: "Qual foi o movimento cultural que marcou o fim da Idade Média e início da Idade Moderna?", options: ["Iluminismo", "Renascimento", "Barroco", "Romantismo"], correct: 1, tempo: 20 },
  { tema: "História", question: "Qual foi o principal objetivo das Cruzadas na Idade Média?", options: ["Expandir o comércio europeu", "Conquistar Jerusalém", "Descobrir novas terras", "Converter povos indígenas"], correct: 1, tempo: 20 },
  { tema: "História", question: "Qual foi o nome do período de perseguição política no Brasil entre 1964 e 1985?", options: ["Ditadura Militar", "Estado Novo", "República Velha", "Nova República"], correct: 0, tempo: 20 },
  { tema: "História", question: "Qual foi a principal rota comercial que ligava a Europa à Ásia na Idade Média?", options: ["Rota do Atlântico", "Rota da Seda", "Rota do Ouro", "Rota das Índias"], correct: 1, tempo: 20 },
  { tema: "História", question: "Qual presidente brasileiro ficou conhecido pelo lema '50 anos em 5'?", options: ["Juscelino Kubitschek", "Getúlio Vargas", "João Goulart", "Tancredo Neves"], correct: 0, tempo: 20 },
  { tema: "História", question: "Em que ano a escravidão foi abolida no Brasil?", options: ["1822", "1888", "1889", "1930"], correct: 1, tempo: 20 },

  // --- MATEMÁTICA ---
  { tema: "Matemática", question: "Qual é o valor de 5²?", options: ["10", "15", "20", "25"], correct: 3, tempo: 20 },
  { tema: "Matemática", question: "Qual é o perímetro de um quadrado com lado de 5 cm?", options: ["15 cm", "20 cm", "25 cm", "30 cm"], correct: 1, tempo: 20 },
  { tema: "Matemática", question: "Qual é a área de um quadrado com lado de 7 cm?", options: ["42 cm²", "49 cm²", "56 cm²", "63 cm²"], correct: 1, tempo: 20 },
  { tema: "Matemática", question: "Qual é a área de um triângulo com base de 10 cm e altura de 6 cm?", options: ["30 cm²", "40 cm²", "50 cm²", "60 cm²"], correct: 0, tempo: 20 },
  { tema: "Matemática", question: "Qual é a soma dos ângulos internos de um triângulo?", options: ["90°", "180°", "270°", "360°"], correct: 1, tempo: 20 },
  { tema: "Matemática", question: "Se você jogar um dado comum, qual é a probabilidade de sair o número 4?", options: ["1/6", "2/6", "3/6", "4/6"], correct: 0, tempo: 20 },
  { tema: "Matemática", question: "Se x + 7 = 27, qual é o valor de x?", options: ["20", "27", "31", "35"], correct: 0, tempo: 20 },
  { tema: "Matemática", question: "Um produto custa R$200 e está com 10% de desconto. Qual será o preço final?", options: ["R$150", "R$180", "R$170", "R$175"], correct: 1, tempo: 20 },
  { tema: "Matemática", question: "Qual é o próximo número da sequência: 2, 4, 8, 16, ...?", options: ["24", "30", "32", "36"], correct: 2, tempo: 20 },
  { tema: "Matemática", question: "Qual é o valor da raiz quadrada de 225?", options: ["10", "12", "15", "20"], correct: 2, tempo: 20 },
  { tema: "Matemática", question: "Qual é o valor de 81 / 27?", options: ["2", "3", "4", "5"], correct: 1, tempo: 20 },
  { tema: "Matemática", question: "Qual é o próximo número da sequência: 5, 10, 20, 40, ...?", options: ["60", "70", "80", "100"], correct: 2, tempo: 20 },
  { tema: "Matemática", question: "O que caracteriza um número primo?", options: ["É múltiplo de 2", "Só é divisível por 1 e por ele mesmo", "É sempre ímpar", "É maior que 10"], correct: 1, tempo: 20 },
  { tema: "Matemática", question: "Um ângulo reto mede:", options: ["45°", "60°", "90°", "120°"], correct: 2, tempo: 20 },
  { tema: "Matemática", question: "Qual é o nome da função que representa uma linha reta?", options: ["Quadrática", "Linear", "Exponencial", "Logarítmica"], correct: 1, tempo: 20 },
  { tema: "Matemática", question: "Qual é o nome da figura com 6 faces quadradas iguais?", options: ["Pirâmide", "Cubo", "Prisma", "Esfera"], correct: 1, tempo: 20 },
  { tema: "Matemática", question: "Quantos graus tem um círculo completo?", options: ["90°", "180°", "270°", "360°"], correct: 3, tempo: 20 },
  { tema: "Matemática", question: "A função f(x) = ax² + bx + c é chamada de:", options: ["Linear", "Quadrática", "Exponencial", "Logarítmica"], correct: 1, tempo: 20 },
  { tema: "Matemática", question: "Qual é a probabilidade de sair cara em um lançamento de moeda?", options: ["0", "1/4", "1/2", "1"], correct: 2, tempo: 20 },
  { tema: "Matemática", question: "Quando multiplicamos dois números negativos, o resultado será:", options: ["Sempre negativo", "Sempre positivo", "Sempre zero", "Sempre indefinido"], correct: 1, tempo: 20 },
  { tema: "Matemática", question: "Qualquer número diferente de zero elevado a zero resulta em:", options: ["0", "1", "Depende do número", "Indefinido"], correct: 1, tempo: 20 },
  { tema: "Matemática", question: "Quando podemos afirmar que um número é complexo?", options: ["Quando é formado apenas por números inteiros", "Quando possui uma parte real e uma parte imaginária", "Quando é sempre positivo", "Quando é múltiplo de 10"], correct: 1, tempo: 20 },
  { tema: "Matemática", question: "O que significa dizer que um número é binário?", options: ["É um número formado apenas por múltiplos de 10", "É um número que utiliza apenas os dígitos 0 e 1", "É um número que sempre representa valores negativos", "É um número que só pode ser usado em frações"], correct: 1, tempo: 20 },

  // --- QUÍMICA ---
  { tema: "Química", question: "Qual gás é essencial para que o fogo continue aceso?", options: ["Nitrogênio", "Oxigênio", "Hidrogênio", "Dióxido de carbono"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual é o único metal que é líquido em temperatura ambiente?", options: ["Ferro", "Mercúrio", "Alumínio", "Zinco"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual é o gás essencial para a respiração dos seres vivos?", options: ["Nitrogênio", "Oxigênio", "Dióxido de carbono", "Hélio"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual é o metal mais maleável e dúctil conhecido?", options: ["Ferro", "Ouro", "Prata", "Cobre"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual é o elemento químico responsável pelo cheiro característico dos fósforos?", options: ["Enxofre", "Cloro", "Fósforo", "Nitrogênio"], correct: 0, tempo: 20 },
  { tema: "Química", question: "Qual ácido está presente no estômago humano?", options: ["Ácido acético", "Ácido cítrico", "Ácido sulfúrico", "Ácido clorídrico"], correct: 3, tempo: 20 },
  { tema: "Química", question: "Qual a porcentagem aproximada de oxigênio presente na atmosfera terrestre?", options: ["10%", "15%", "21%", "30%"], correct: 2, tempo: 20 },
  { tema: "Química", question: "Qual é o gás usado em refrigerantes para formar bolhas?", options: ["Oxigênio", "Dióxido de carbono", "Hidrogênio", "Nitrogênio"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual é o elemento químico que forma diamantes quando submetido a alta pressão?", options: ["Carbono", "Oxigênio", "Silício", "Enxofre"], correct: 0, tempo: 20 },
  { tema: "Química", question: "Qual é o gás que protege a Terra dos raios ultravioleta do Sol?", options: ["Oxigênio", "Ozônio", "Nitrogênio", "Dióxido de carbono"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual é o gás responsável pelo efeito estufa em maior quantidade?", options: ["Oxigênio", "Dióxido de carbono", "Nitrogênio", "Hélio"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual é o metal mais leve da tabela periódica?", options: ["Alumínio", "Lítio", "Sódio", "Potássio"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual é o gás usado em lâmpadas fluorescentes?", options: ["Argônio", "Neônio", "Vapor de Mercúrio", "Hélio"], correct: 2, tempo: 20 },
  { tema: "Química", question: "Qual é o principal gás liberado na respiração celular dos seres vivos?", options: ["Oxigênio", "Dióxido de carbono", "Nitrogênio", "Hélio"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual é o metal mais usado na fabricação de fios elétricos?", options: ["Alumínio", "Ferro", "Cobre", "Ouro"], correct: 2, tempo: 20 },
  { tema: "Química", question: "Qual é o gás usado em hospitais como anestésico (gás do riso)?", options: ["Oxigênio", "Óxido nitroso", "Dióxido de carbono", "Hélio"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual é a fórmula química da água?", options: ["CO₂", "H₂O", "O₂", "H₂"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual é a fórmula química do sal de cozinha (cloreto de sódio)?", options: ["NaCl", "KCl", "CaCl₂", "MgCl₂"], correct: 0, tempo: 20 },
  { tema: "Química", question: "Qual é a fórmula química da amônia?", options: ["NH₃", "HNO₃", "NO₂", "N₂O"], correct: 0, tempo: 20 },
  { tema: "Química", question: "Qual é a fórmula química do ácido clorídrico?", options: ["H₂SO₄", "HCl", "HNO₃", "NaOH"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual é a fórmula química da glicose?", options: ["C₆H₁₂O₆", "C₆H₆", "CH₄", "C₂H₅OH"], correct: 0, tempo: 20 },
  { tema: "Química", question: "Qual é a fórmula química do ácido sulfúrico?", options: ["HCl", "H₂SO₄", "HNO₃", "NaOH"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual é o nome da reação que ocorre quando o ferro enferruja?", options: ["Combustão", "Oxidação", "Neutralização", "Fermentação"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual é a reação química que ocorre nas plantas para produzir glicose e oxigênio?", options: ["Respiração celular", "Fotossíntese", "Fermentação", "Neutralização"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual é a reação usada na produção de bebidas alcoólicas como vinho e cerveja?", options: ["Neutralização", "Fermentação alcoólica", "Oxidação", "Combustão"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual é o processo utilizado para separar a água do sal em uma solução salina?", options: ["Filtração", "Decantação", "Evaporação", "Destilação fracionada"], correct: 2, tempo: 20 },
  { tema: "Química", question: "O que é a água destilada?", options: ["Água com abundância de minerais", "Água purificada sem impurezas/sais", "Água retirada diretamente do mar", "Água usada apenas em bebidas"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual é o processo utilizado para separar o pó de café da água após o preparo?", options: ["Decantação", "Filtração", "Evaporação", "Destilação"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual reação química ocorre nas células para liberar energia a partir da glicose?", options: ["Fotossíntese", "Respiração celular", "Fermentação", "Neutralização"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual é o nome do processo que aumenta a temperatura da Terra ao reter calor na atmosfera?", options: ["Efeito estufa", "Fotossíntese", "Combustão", "Respiração celular"], correct: 0, tempo: 20 },

  // --- ARTE E CULTURA ---
  { tema: "Arte e Cultura", question: "Quem escreveu o livro O Guarani?", options: ["Machado de Assis", "José de Alencar", "Monteiro Lobato", "Carlos Drummond de Andrade"], correct: 1, tempo: 20 },
  { tema: "Arte e Cultura", question: "Qual artista é famoso por pintar a série dos 'Girassóis'?", options: ["Monet", "Van Gogh", "Picasso", "Dalí"], correct: 1, tempo: 20 },
  { tema: "Arte e Cultura", question: "Quem pintou o teto da Capela Sistina?", options: ["Leonardo da Vinci", "Michelangelo", "Rafael", "Botticelli"], correct: 1, tempo: 20 },
  { tema: "Arte e Cultura", question: "Quem criou o personagem 'Emília' do Sítio do Picapau Amarelo?", options: ["José de Alencar", "Monteiro Lobato", "Cecília Meireles", "Carlos Drummond de Andrade"], correct: 1, tempo: 20 },
  { tema: "Arte e Cultura", question: "Quem escreveu a peça Romeu e Julieta?", options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Oscar Wilde"], correct: 1, tempo: 20 },
  { tema: "Arte e Cultura", question: "Quem escreveu Memórias Póstumas de Brás Cubas?", options: ["José de Alencar", "Machado de Assis", "Monteiro Lobato", "Graciliano Ramos"], correct: 1, tempo: 20 },
  { tema: "Arte e Cultura", question: "Quem escreveu Vidas Secas?", options: ["Jorge Amado", "Graciliano Ramos", "José de Alencar", "Clarice Lispector"], correct: 1, tempo: 20 },
  { tema: "Arte e Cultura", question: "Quem escreveu Capitães da Areia?", options: ["Jorge Amado", "Clarice Lispector", "José de Alencar", "Machado de Assis"], correct: 0, tempo: 20 },
  { tema: "Arte e Cultura", question: "Qual país é considerado o berço do reggae?", options: ["Brasil", "Jamaica", "Cuba", "Estados Unidos"], correct: 1, tempo: 20 },
  { tema: "Arte e Cultura", question: "Quem escreveu Macunaíma, considerado o 'herói sem nenhum caráter'?", options: ["Jorge Amado", "Mário de Andrade", "Oswald de Andrade", "Graciliano Ramos"], correct: 1, tempo: 20 },
  { tema: "Arte e Cultura", question: "Qual artista pintou A Noite Estrelada?", options: ["Monet", "Van Gogh", "Dalí", "Renoir"], correct: 1, tempo: 20 },
  { tema: "Arte e Cultura", question: "Qual artista é conhecido por pintar A Última Ceia?", options: ["Michelangelo", "Leonardo da Vinci", "Rafael", "Botticelli"], correct: 1, tempo: 20 },
  { tema: "Arte e Cultura", question: "De qual obra vem a frase 'Aos vencedores, as batatas'?", options: ["Memórias Póstumas de Brás Cubas", "O Guarani", "Vidas Secas", "Macunaíma"], correct: 0, tempo: 20 },
  { tema: "Arte e Cultura", question: "Quem é o autor da frase 'Só sei que nada sei'?", options: ["Platão", "Aristóteles", "Sócrates", "Descartes"], correct: 2, tempo: 20 },
  { tema: "Arte e Cultura", question: "Qual é o nome verdadeiro do apresentador Silvio Santos?", options: ["José Abelardo Barbosa", "Senor Abravanel", "Fausto Corrêa da Silva", "Carlos Massa"], correct: 1, tempo: 20 },
  { tema: "Arte e Cultura", question: "Quem é conhecido mundialmente como o 'Rei do Futebol'?", options: ["Diego Maradona", "Pelé", "Zico", "Ronaldo"], correct: 1, tempo: 20 },
  { tema: "Arte e Cultura", question: "Qual cantor é conhecido como 'O Rei' da música romântica brasileira?", options: ["Roberto Carlos", "Erasmo Carlos", "Caetano Veloso", "Gilberto Gil"], correct: 0, tempo: 20 },
  { tema: "Arte e Cultura", question: "Quem é conhecido como o 'Rei do Baião'?", options: ["Luiz Gonzaga", "Dominguinhos", "Jackson do Pandeiro", "Gilberto Gil"], correct: 0, tempo: 20 },
  { tema: "Arte e Cultura", question: "O que representa o famoso Cavalo de Troia da mitologia grega?", options: ["Um presente de paz troiano", "Uma escultura dedicada a Zeus", "Uma estratégia militar dos gregos", "Um monumento histórico"], correct: 2, tempo: 20 },
  { tema: "Arte e Cultura", question: "Qual foi o motivo da Guerra de Troia segundo a mitologia?", options: ["Disputa por terras", "Sequestro de Helena", "Rivalidade entre deuses", "Comércio marítimo"], correct: 1, tempo: 20 },
  { tema: "Arte e Cultura", question: "Qual é o número que você deve discar para chamar o Corpo de Bombeiros no Brasil?", options: ["190", "192", "193", "199"], correct: 2, tempo: 20 },

  // --- ESPORTE ---
  { tema: "Esporte", question: "Qual é a duração oficial de uma partida de futebol profissional?", options: ["60 minutos", "70 minutos", "90 minutos", "100 minutos"], correct: 2, tempo: 20 },
  { tema: "Esporte", question: "Em qual esporte Michael Jordan se tornou uma lenda?", options: ["Beisebol", "Futebol Americano", "Basquete", "Atletismo"], correct: 2, tempo: 20 },
  { tema: "Esporte", question: "Quantos jogadores cada equipe deve ter em quadra no vôlei?", options: ["5", "7", "6", "8"], correct: 2, tempo: 20 },
  { tema: "Esporte", question: "Qual país é o maior vencedor da Copa do Mundo de Futebol Masculino?", options: ["Alemanha", "Itália", "Brasil", "Argentina"], correct: 2, tempo: 20 },
  { tema: "Esporte", question: "Qual é o esporte praticado na Fórmula 1?", options: ["Motociclismo", "Kart", "Automobilismo", "Rally"], correct: 2, tempo: 20 },
  { tema: "Esporte", question: "Qual é o nome do maior torneio de seleções de futebol da América do Sul?", options: ["Copa Ouro", "Copa América do Norte", "Copa América", "Copa Panamericana"], correct: 2, tempo: 20 },
  { tema: "Esporte", question: "Quantos jogadores cada equipe deve ter em campo no futebol profissional?", options: ["10", "12", "11", "9"], correct: 2, tempo: 20 },
  { tema: "Esporte", question: "Qual é o esporte praticado em uma piscina dividida por raias?", options: ["Polo aquático", "Saltos ornamentais", "Natação", "Canoagem"], correct: 2, tempo: 20 },
  { tema: "Esporte", question: "Qual país é tradicionalmente um dos maiores vencedores do vôlei masculino olímpico?", options: ["Itália", "Rússia", "Brasil", "França"], correct: 2, tempo: 20 },
  { tema: "Esporte", question: "Qual país sediou a Copa do Mundo de Futebol de 2014?", options: ["Alemanha", "Brasil", "Rússia", "África do Sul"], correct: 1, tempo: 20 },
  { tema: "Esporte", question: "Qual país é conhecido mundialmente como a terra do sumô?", options: ["China", "Coreia do Sul", "Japão", "Índia"], correct: 2, tempo: 20 },

  // --- FÍSICA ---
  { tema: "Física", question: "Qual é a unidade de medida de força no Sistema Internacional (SI)?", options: ["Joule", "Watt", "Newton", "Pascal"], correct: 2, tempo: 20 },
  { tema: "Física", question: "Quem formulou a Lei da Gravitação Universal?", options: ["Einstein", "Newton", "Galileu", "Tesla"], correct: 1, tempo: 20 },
  { tema: "Física", question: "O que mede um termômetro?", options: ["Massa", "Temperatura", "Pressão", "Força"], correct: 1, tempo: 20 },
  { tema: "Física", question: "Qual é o valor aproximado da aceleração da gravidade na Terra?", options: ["5,8 m/s²", "9,8 m/s²", "12 m/s²", "15 m/s²"], correct: 1, tempo: 20 },
  { tema: "Física", question: "O que mede um cronômetro?", options: ["Massa", "Tempo", "Temperatura", "Pressão"], correct: 1, tempo: 20 },
  { tema: "Física", question: "Segundo a Física, a energia não pode ser criada nem destruída, apenas:", options: ["Destruída", "Transformada", "Anulada", "Aumentada"], correct: 1, tempo: 20 },
  { tema: "Física", question: "Qual partícula atômica possui carga elétrica negativa?", options: ["Próton", "Nêutron", "Elétron", "Fóton"], correct: 2, tempo: 20 },
  { tema: "Física", question: "Qual é a principal razão física para o uso do cinto de segurança?", options: ["Gravidade", "Força centrípeta", "Inércia", "Energia potencial"], correct: 2, tempo: 20 },
  { tema: "Física", question: "Segundo a Primeira Lei de Newton, um corpo em repouso tende a ficar em...?", options: ["Movimento", "Rotação", "Repouso", "Expansão"], correct: 2, tempo: 20 },
  { tema: "Física", question: "Qual força invisível mantém os planetas em órbita ao redor do Sol?", options: ["Magnética", "Elétrica", "Gravitacional", "Nuclear"], correct: 2, tempo: 20 },
  { tema: "Física", question: "A Segunda Lei de Newton estabelece que Força é igual a:", options: ["Massa × Velocidade", "Massa × Aceleração", "Massa / Tempo", "Energia / Tempo"], correct: 1, tempo: 20 },
  { tema: "Física", question: "Quando o ônibus freia de repente, seu corpo tende a continuar em frente devido à:", options: ["Gravidade", "Inércia", "Atrito", "Rotação"], correct: 1, tempo: 20 },
  { tema: "Física", question: "O que realmente determina quanto um aparelho elétrico vai gastar de energia?", options: ["Tensão (Volts)", "Tomada", "Potência elétrica (Watts)", "Espessura do fio"], correct: 2, tempo: 20 },

  // --- PORTUGUÊS ---
  { tema: "Português", question: "Qual é o plural correto da palavra 'cão'?", options: ["Cãos", "Cãoses", "Cães", "Caozes"], correct: 2, tempo: 20 },
  { tema: "Português", question: "Qual é o tempo verbal da frase 'Eu estudei ontem'?", options: ["Presente", "Futuro", "Passado", "Gerúndio"], correct: 2, tempo: 20 },
  { tema: "Português", question: "Qual é o sujeito da frase 'Os alunos estudam'?", options: ["Estudam", "Frase", "Os alunos", "Nenhum"], correct: 2, tempo: 20 },
  { tema: "Português", question: "Qual é o gênero gramatical da palavra 'mesa'?", options: ["Masculino", "Neutro", "Feminino", "Indefinido"], correct: 2, tempo: 20 },
  { tema: "Português", question: "Qual é o diminutivo de 'flor'?", options: ["Florão", "Floreira", "Florzinha", "Florada"], correct: 2, tempo: 20 },
  { tema: "Português", question: "Qual é o aumentativo de 'casa'?", options: ["Casinha", "Casota", "Casona", "Casita"], correct: 2, tempo: 20 },
  { tema: "Português", question: "Qual é o verbo da frase 'Maria corre rápido'?", options: ["Maria", "Rápido", "Corre", "Frase"], correct: 2, tempo: 20 },
  { tema: "Português", question: "Qual é o adjetivo na frase 'O carro vermelho'?", options: ["Carro", "O", "Vermelho", "Frase"], correct: 2, tempo: 20 },
  { tema: "Português", question: "Qual é o sujeito da frase 'O cachorro corre'?", options: ["Corre", "O cachorro corre", "O cachorro", "O"], correct: 2, tempo: 20 },
  { tema: "Português", question: "Qual é o coletivo de chaves?", options: ["Grupo de chave", "Caixa de chave", "Molho de chaves", "Pacote de chave"], correct: 2, tempo: 20 },
  { tema: "Português", question: "Qual é o coletivo de lobos?", options: ["Bando", "Rebanho", "Alcateia", "Cardume"], correct: 2, tempo: 20 },
  { tema: "Português", question: "Qual é o coletivo de peixes?", options: ["Rebanho", "Bando", "Cardume", "Alcateia"], correct: 2, tempo: 20 },
  { tema: "Português", question: "Qual é o coletivo de bois?", options: ["Alcateia", "Cardume", "Rebanho / Boiada", "Bando"], correct: 2, tempo: 20 },
  { tema: "Português", question: "Qual é o coletivo de navios de guerra?", options: ["Rebanho", "Bando", "Frota / Esquadra", "Alcateia"], correct: 2, tempo: 20 },
  { tema: "Português", question: "Qual é o coletivo de estrelas?", options: ["Rebanho", "Bando", "Constelação", "Alcateia"], correct: 2, tempo: 20 },
  { tema: "Português", question: "Qual das palavras abaixo é um substantivo?", options: ["Feliz", "Rapidamente", "Escola", "Cantar"], correct: 2, tempo: 20 },
  { tema: "Português", question: "Qual palavra está grafada corretamente?", options: ["Excessão", "Exceção", "Eseção", "Exesão"], correct: 1, tempo: 20 },
  { tema: "Português", question: "Quantas letras possui o alfabeto oficial da língua portuguesa?", options: ["24", "25", "26", "27"], correct: 2, tempo: 20 },
  { tema: "Português", question: "Qual destas palavras é um adjetivo?", options: ["Beleza", "Correr", "Inteligente", "Escola"], correct: 2, tempo: 20 },
  { tema: "Português", question: "Qual destas palavras é um pronome pessoal?", options: ["Eles", "Livro", "Correr", "Bonito"], correct: 0, tempo: 20 },
  { tema: "Português", question: "Qual destas palavras funciona como um advérbio?", options: ["Rapidamente", "Menino", "Azul", "Comer"], correct: 0, tempo: 20 },
  { tema: "Português", question: "Qual é o antônimo (oposto) de 'claro'?", options: ["Escuro", "Branco", "Limpo", "Forte"], correct: 0, tempo: 20 },
  { tema: "Português", question: "Qual destas palavras é uma oxítona?", options: ["Café", "Árvore", "Lâmpada", "Fácil"], correct: 0, tempo: 20 },
  { tema: "Português", question: "Qual destas palavras é uma paroxítona?", options: ["Mesa", "Café", "Sabiá", "Cipó"], correct: 0, tempo: 20 },
  { tema: "Português", question: "Qual destas palavras é uma proparoxítona?", options: ["Música", "Sofá", "Papel", "Amor"], correct: 0, tempo: 20 },

  // --- INGLÊS ---
  { tema: "Inglês", question: "Em inglês, qual é a tradução de 'Dog'?", options: ["Gato", "Cachorro", "Cavalo", "Pássaro"], correct: 1, tempo: 20 },
  { tema: "Inglês", question: "Como se diz 'Obrigado' em inglês?", options: ["Please", "Sorry", "Thank you", "Hello"], correct: 2, tempo: 20 },
  { tema: "Inglês", question: "Em inglês, qual é a tradução de 'Book'?", options: ["Mesa", "Porta", "Livro", "Janela"], correct: 2, tempo: 20 },
  { tema: "Inglês", question: "Como se diz 'Água' em inglês?", options: ["Milk", "Juice", "Water", "Coffee"], correct: 2, tempo: 20 },
  { tema: "Inglês", question: "Em inglês, qual é a tradução de 'Apple'?", options: ["Banana", "Laranja", "Maçã", "Uva"], correct: 2, tempo: 20 },
  { tema: "Inglês", question: "Como se diz 'Bom dia' em inglês?", options: ["Good night", "Goodbye", "Good morning", "Good evening"], correct: 2, tempo: 20 },
  { tema: "Inglês", question: "Em inglês, qual é a tradução de 'Blue'?", options: ["Verde", "Vermelho", "Azul", "Amarelo"], correct: 2, tempo: 20 },
  { tema: "Inglês", question: "Como se diz 'Escola' em inglês?", options: ["Hospital", "School", "Market", "Church"], correct: 1, tempo: 20 },
  { tema: "Inglês", question: "Em inglês, qual é a tradução de 'Chair'?", options: ["Mesa", "Janela", "Cadeira", "Porta"], correct: 2, tempo: 20 },
  { tema: "Inglês", question: "Como se diz 'Gato' em inglês?", options: ["Dog", "Cat", "Bird", "Fish"], correct: 1, tempo: 20 },
  { tema: "Inglês", question: "Qual é a tradução de 'Car'?", options: ["Caminhão", "Avião", "Carro", "Barco"], correct: 2, tempo: 20 },
  { tema: "Inglês", question: "Como se diz 'Amigo' em inglês?", options: ["Family", "Brother", "Friend", "Teacher"], correct: 2, tempo: 20 },
  { tema: "Inglês", question: "Em inglês, Qual é a tradução de 'Window'?", options: ["Telhado", "Porta", "Janela", "Parede"], correct: 2, tempo: 20 },
  { tema: "Inglês", question: "Como se diz 'Pai' em inglês?", options: ["Uncle", "Brother", "Father", "Grandfather"], correct: 2, tempo: 20 },
  { tema: "Inglês", question: "Como se diz 'Comida' em inglês?", options: ["Water", "Food", "Drink", "Bread"], correct: 1, tempo: 20 },
  { tema: "Inglês", question: "Em inglês, Qual é a tradução de 'Bird'?", options: ["Peixe", "Pássaro", "Coelho", "Cavalo"], correct: 1, tempo: 20 },
  { tema: "Inglês", question: "Em inglês, qual é a tradução de 'Teacher'?", options: ["Médico", "Professor", "Engenheiro", "Advogado"], correct: 1, tempo: 20 },
  { tema: "Inglês", question: "Em inglês, qual é a tradução de 'Happy'?", options: ["Triste", "Bravo", "Feliz", "Cansado"], correct: 2, tempo: 20 },
  { tema: "Inglês", question: "Em inglês, Qual é a tradução da frase 'What is your name'?", options: ["Onde você mora", "Quem é você", "Qual é o seu nome", "Como você está"], correct: 2, tempo: 20 },
  { tema: "Inglês", question: "Em inglês, Qual é a tradução da frase 'How old are you'?", options: ["Onde você está", "Qual é o seu nome", "Quantos anos você tem", "O que você faz"], correct: 2, tempo: 20 },
  { tema: "Inglês", question: "Em inglês, Qual é a tradução da frase 'Where do you live'?", options: ["Quem é você", "Quantos anos você tem", "Onde você mora", "O que você faz"], correct: 2, tempo: 20 },
  { tema: "Inglês", question: "Em inglês, Qual é a tradução da expressão 'What time is it'?", options: ["Onde você mora", "Quem é você", "Que horas são", "Como você está"], correct: 2, tempo: 20 },
  { tema: "Inglês", question: "Em inglês, qual é a tradução da expressão 'See you'?", options: ["Olá", "Obrigado", "Até logo", "Bom dia"], correct: 2, tempo: 20 },
  { tema: "Inglês", question: "Em inglês, qual é a tradução de 'What is this'?", options: ["Quem é você", "Onde você mora", "O que é isto", "Como você está"], correct: 2, tempo: 20 },

  // --- BIOLOGIA ---
  { tema: "Biologia", question: "Qual é o maior órgão do corpo humano?", options: ["Coração", "Fígado", "Pele", "Pulmão"], correct: 2, tempo: 20 },
  { tema: "Biologia", question: "Qual órgão é responsável por bombear o sangue pelo corpo?", options: ["Estômago", "Coração", "Rim", "Pulmão"], correct: 1, tempo: 20 },
  { tema: "Biologia", question: "Onde ocorre a troca de oxigênio e gás carbônico nos pulmões?", options: ["Estômago", "Alvéolos pulmonares", "Fígado", "Intestino delgado"], correct: 1, tempo: 20 },
  { tema: "Biologia", question: "Qual é a função principal dos rins?", options: ["Produzir hormônios", "Filtrar o sangue", "Armazenar glicose", "Produzir bile"], correct: 1, tempo: 20 },
  { tema: "Biologia", question: "Qual parte do corpo humano possui o maior número de ossos?", options: ["Braço", "Pé", "Cabeça", "Mão"], correct: 3, tempo: 20 },
  { tema: "Biologia", question: "Qual é o nome da célula sanguínea responsável pelo transporte de oxigênio?", options: ["Glóbulo branco", "Glóbulo vermelho", "Plaqueta", "Neurônio"], correct: 1, tempo: 20 },
  { tema: "Biologia", question: "Qual é o maior osso do corpo humano?", options: ["Fêmur", "Úmero", "Tíbia", "Coluna vertebral"], correct: 0, tempo: 20 },
  { tema: "Biologia", question: "Qual órgão produz o hormônio insulina?", options: ["Pâncreas", "Fígado", "Estômago", "Baço"], correct: 0, tempo: 20 },
  { tema: "Biologia", question: "Qual é o nome da estrutura fibrosa que conecta os músculos aos ossos?", options: ["Ligamento", "Tendão", "Cartilagem", "Articulação"], correct: 1, tempo: 20 },
  { tema: "Biologia", question: "Qual parte do olho humano é responsável por regular a entrada de luz?", options: ["Retina", "Pupila", "Córnea", "Cristalino"], correct: 1, tempo: 20 },
  { tema: "Biologia", question: "Qual sistema é responsável pela defesa do corpo contra infecções?", options: ["Digestivo", "Nervoso", "Imunológico", "Respiratório"], correct: 2, tempo: 20 },
  { tema: "Biologia", question: "Qual órgão é gravemente prejudicado pelo consumo excessivo e contínuo de álcool?", options: ["Coração", "Fígado", "Pulmão", "Rins"], correct: 1, tempo: 20 },
  { tema: "Biologia", question: "Qual é a principal função da água no organismo humano?", options: ["Produzir hormônios", "Regular a temperatura corporal", "Aumentar músculos", "Fortalecer ossos"], correct: 1, tempo: 20 }
];

// =====================================================
// ESTADO GLOBAL DO SERVIDOR
// =====================================================
let perguntas = []; // Receberá as 20 perguntas sorteadas da rodada
let jogadores = {}; // Armazena por chave única do jogador
let socketParaJogadorKey = {}; // Mapeia socket.id -> chave do jogador
let perguntaAtualIndex = -1;
let tempoRestante = 0;
let timerInterval = null;
let quizFinalizado = false;
let isStartingQuestion = false;

// =====================================================
// FUNÇÃO DE SORTEIO INTELIGENTE (20 QUESTÕES SEM REPETIR TEMA)
// =====================================================
function sortear20PerguntasSemRepetirTema() {
  // 1. Agrupa o banco de dados por tema
  const porTema = {};
  bancoDePerguntasCompleto.forEach(q => {
    if (!porTema[q.tema]) porTema[q.tema] = [];
    // Faz uma cópia rasa para não alterar o array original
    porTema[q.tema].push({ ...q });
  });

  // Embaralha as perguntas dentro de cada tema
  Object.keys(porTema).forEach(tema => {
    porTema[tema].sort(() => Math.random() - 0.5);
  });

  const selecionadas = [];
  const temasDisponiveis = Object.keys(porTema);

  let cicloTemas = [...temasDisponiveis].sort(() => Math.random() - 0.5);

  // 2. Seleciona 20 perguntas alternando entre os temas
  while (selecionadas.length < 20) {
    if (cicloTemas.length === 0) {
      // Se usou todos os temas, reinicia o ciclo de temas de forma aleatória
      cicloTemas = [...temasDisponiveis].sort(() => Math.random() - 0.5);
    }

    const temaAtual = cicloTemas.pop();

    // Se ainda houver perguntas desse tema
    if (porTema[temaAtual] && porTema[temaAtual].length > 0) {
      const perguntaExtraida = porTema[temaAtual].pop();
      selecionadas.push(perguntaExtraida);
    }
  }

  // 3. Atualiza a numeração das perguntas sorteadas para ficar de 1 até 20
  selecionadas.forEach((q, index) => {
    q.numero = index + 1;
  });

  perguntas = selecionadas;
  console.log(`🎲 Sorteio realizado! 20 perguntas preparadas para o jogo com temas alternados.`);
}

// Executa o primeiro sorteio assim que o servidor inicia
sortear20PerguntasSemRepetirTema();

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

  // 1. REGISTRO / RECONEXÃO DO JOGADOR
  socket.on('entrar_quiz', (data = {}) => {
    const fotoPadrao = "https://cdn-icons-png.flaticon.com/512/847/847969.png";
    const nomeTratado = sanitizarEntrada(data.nome, 'Aluno');
    const escolaTratada = sanitizarEntrada(data.escola, 'Escola Geral');
    
    // Cria uma chave única baseada no nome e escola para preservar o progresso se mudar de aba
    const chaveJogador = `${nomeTratado.toLowerCase()}_${escolaTratada.toLowerCase()}`;

    socketParaJogadorKey[socket.id] = chaveJogador;

    if (jogadores[chaveJogador]) {
      // O jogador já existia! Atualiza apenas o socket.id sem perder pontos nem progresso
      jogadores[chaveJogador].socketId = socket.id;
      console.log(`🔄 Aluno reconectado: ${nomeTratado} (${escolaTratada})`);
    } else {
      // Novo cadastro
      jogadores[chaveJogador] = {
        socketId: socket.id,
        nome: nomeTratado,
        escola: escolaTratada,
        foto: (data.foto && typeof data.foto === 'string' && data.foto.trim() !== "" && data.foto !== "null")
          ? data.foto.trim()
          : fotoPadrao,
        pontos: 0,
        respondeu: false
      };
      console.log(`👤 Novo aluno registrado: ${nomeTratado} (${escolaTratada})`);
    }

    // Se o quiz já estiver em andamento, envia a pergunta atual para o aluno que reconectou
    if (perguntaAtualIndex >= 0 && perguntaAtualIndex < perguntas.length && !quizFinalizado) {
      socket.emit('nova_pergunta', perguntas[perguntaAtualIndex]);
    }
  });

  // 2. SOLICITAÇÃO DE RANKING OU TELA FINAL
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

      Object.keys(jogadores).forEach(key => {
        if (jogadores[key]) {
          jogadores[key].respondeu = false;
        }
      });

      console.log(`❓ Iniciando Pergunta ${perguntaAtualIndex + 1}/${perguntas.length} [Tema: ${q.tema}]: ${q.question}`);
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

    jogadores = {}; 
    socketParaJogadorKey = {};

    // Sortear um novo pacote de 20 perguntas para a próxima partida
    sortear20PerguntasSemRepetirTema();

    console.log("🔄 Quiz reiniciado com novo sorteio de perguntas.");
    io.emit('quiz_reiniciado');
    io.emit('resetar_aluno'); 
  });

  // 5. RECEBER RESPOSTA DO PARTICIPANTE
  socket.on('enviar_resposta', (index) => {
    const chave = socketParaJogadorKey[socket.id];
    const jogador = jogadores[chave];
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

  // 6. DESCONEXÃO MANUAL VIA BOTÃO NA TELA
  socket.on('aluno_desconectou_manual', () => {
    const chave = socketParaJogadorKey[socket.id];
    if (chave && jogadores[chave]) {
      console.log(`🚪 Aluno saiu manualmente: ${jogadores[chave].nome}`);
      delete jogadores[chave];
      delete socketParaJogadorKey[socket.id];
    }
  });

  // 7. DESCONEXÃO TEMPORÁRIA / PERDA DE SINAL
  socket.on('disconnect', () => {
    const chave = socketParaJogadorKey[socket.id];
    if (chave && jogadores[chave]) {
      console.log(`⚠️ Sinal oscilou para: ${jogadores[chave].nome} (${socket.id}). Dados preservados no servidor.`);
      delete socketParaJogadorKey[socket.id];
      // O jogador PERMANECE salvo em 'jogadores[chave]', mantendo pontos e nome
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
