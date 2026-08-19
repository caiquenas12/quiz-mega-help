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
{ tema: "Geografia", question: "Qual estado fica ao sul de São Paulo?", options: ["Paraná", "Minas Gerais", "Goiás", "Bahia"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual estado fica ao norte de São Paulo?", options: ["Paraná", "Minas Gerais", "Santa Catarina", "Rio Grande do Sul"], correct: 1, tempo: 20 },
{ tema: "Geografia", question: "Qual estado fica entre São Paulo e Rio Grande do Sul?", options: ["Paraná", "Goiás", "Minas Gerais", "Mato Grosso"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual estado fica entre Paraná e Rio Grande do Sul?", options: ["Santa Catarina", "São Paulo", "Pará", "Mato Grosso"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual estado fica entre Minas Gerais e Bahia?", options: ["Espírito Santo", "Goiás", "Sergipe", "Alagoas"], correct: 1, tempo: 20 },
{ tema: "Geografia", question: "Qual estado fica entre Bahia e Pernambuco?", options: ["Ceará", "Piauí", "Alagoas", "Paraíba"], correct: 2, tempo: 20 },
{ tema: "Geografia", question: "Qual estado fica entre Pernambuco e Ceará?", options: ["Paraíba", "Piauí", "Bahia", "Alagoas"], correct: 1, tempo: 20 },
{ tema: "Geografia", question: "Qual estado fica entre Ceará e Maranhão?", options: ["Piauí", "Bahia", "Paraíba", "Pernambuco"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual estado fica ao sul de Minas Gerais?", options: ["Bahia", "São Paulo", "Goiás", "Espírito Santo"], correct: 1, tempo: 20 },
{ tema: "Geografia", question: "Qual estado fica a leste de Minas Gerais?", options: ["Goiás", "Bahia", "Espírito Santo", "Mato Grosso"], correct: 2, tempo: 20 },
{ tema: "Geografia", question: "Qual estado fica a oeste de Minas Gerais?", options: ["Espírito Santo", "Rio de Janeiro", "Goiás", "Bahia"], correct: 2, tempo: 20 },
{ tema: "Geografia", question: "Qual estado fica ao norte do Paraná?", options: ["Santa Catarina", "São Paulo", "Rio Grande do Sul", "Mato Grosso"], correct: 1, tempo: 20 },
{ tema: "Geografia", question: "Qual estado fica ao sul de Santa Catarina?", options: ["Paraná", "Rio Grande do Sul", "São Paulo", "Mato Grosso"], correct: 1, tempo: 20 },
{ tema: "Geografia", question: "Qual estado fica ao norte de Santa Catarina?", options: ["Paraná", "Rio Grande do Sul", "São Paulo", "Goiás"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual estado fica a oeste do Rio de Janeiro?", options: ["São Paulo", "Espírito Santo", "Bahia", "Paraná"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual estado fica ao norte do Rio de Janeiro?", options: ["São Paulo", "Espírito Santo", "Paraná", "Santa Catarina"], correct: 1, tempo: 20 },
{ tema: "Geografia", question: "Qual estado fica ao sul do Espírito Santo?", options: ["Bahia", "Minas Gerais", "Rio de Janeiro", "São Paulo"], correct: 2, tempo: 20 },
{ tema: "Geografia", question: "Qual estado fica a oeste da Bahia?", options: ["Pernambuco", "Goiás", "Sergipe", "Alagoas"], correct: 1, tempo: 20 },
{ tema: "Geografia", question: "Qual estado fica ao sul de Mato Grosso?", options: ["Goiás", "Mato Grosso do Sul", "Rondônia", "Pará"], correct: 1, tempo: 20 },
{ tema: "Geografia", question: "Qual estado fica ao norte de Mato Grosso do Sul?", options: ["Paraná", "Mato Grosso", "São Paulo", "Goiás"], correct: 1, tempo: 20 },
{ tema: "Geografia", question: "Qual estado fica a leste de Mato Grosso?", options: ["Goiás", "Rondônia", "Acre", "Amazonas"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual estado fica ao norte de Goiás?", options: ["Minas Gerais", "Tocantins", "São Paulo", "Bahia"], correct: 1, tempo: 20 },
{ tema: "Geografia", question: "Qual estado fica ao sul de Goiás?", options: ["Tocantins", "Minas Gerais", "Pará", "Maranhão"], correct: 1, tempo: 20 },
{ tema: "Geografia", question: "Qual estado fica a leste de Goiás?", options: ["Mato Grosso", "Bahia", "Tocantins", "Mato Grosso do Sul"], correct: 1, tempo: 20 },
{ tema: "Geografia", question: "Qual estado fica ao norte do Tocantins?", options: ["Goiás", "Pará", "Bahia", "Mato Grosso"], correct: 1, tempo: 20 },{ tema: "Geografia", question: "Qual estado fica a oeste do Maranhão?", options: ["Piauí", "Pará", "Ceará", "Tocantins"], correct: 1, tempo: 20 },
{ tema: "Geografia", question: "Qual estado fica a leste do Maranhão?", options: ["Pará", "Piauí", "Tocantins", "Amazonas"], correct: 1, tempo: 20 },
{ tema: "Geografia", question: "Qual estado brasileiro fica mais ao sul?", options: ["Paraná", "Santa Catarina", "Rio Grande do Sul", "São Paulo"], correct: 2, tempo: 20 },
{ tema: "Geografia", question: "Qual estado brasileiro fica mais ao norte?", options: ["Amapá", "Roraima", "Amazonas", "Pará"], correct: 1, tempo: 20 },
{ tema: "Geografia", question: "Qual estado brasileiro possui formato parecido com uma bota?", options: ["Ceará", "Bahia", "Pernambuco", "Rio Grande do Norte"], correct: 2, tempo: 20 },
  // --- E VOCÊ VIAJAR DE SÃO PAULO PARA ---

  // --- GEOGRAFIA: VIAGENS E LOCALIZAÇÃO ---
{ tema: "Geografia", question: "Se você viajar de São Paulo para Curitiba, estará indo principalmente para qual direção?", options: ["Sul", "Norte", "Leste", "Oeste"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Se você viajar de São Paulo para Belo Horizonte, estará indo principalmente para qual direção?", options: ["Sul", "Norte", "Leste", "Oeste"], correct: 1, tempo: 20 },
{ tema: "Geografia", question: "Se você viajar de São Paulo para Rio de Janeiro, estará indo principalmente para qual direção?", options: ["Oeste", "Leste", "Norte", "Sul"], correct: 1, tempo: 20 },
{ tema: "Geografia", question: "Se você viajar de São Paulo para Campo Grande, estará indo principalmente para qual direção?", options: ["Oeste", "Leste", "Norte", "Sul"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Se você viajar de São Paulo para Porto Alegre, estará indo principalmente para qual direção?", options: ["Norte", "Sul", "Leste", "Oeste"], correct: 1, tempo: 20 },
{ tema: "Geografia", question: "Se você viajar de São Paulo para Salvador, estará indo principalmente para qual direção?", options: ["Sudeste", "Nordeste", "Sul", "Centro-Oeste"], correct: 1, tempo: 20 },
{ tema: "Geografia", question: "Se você viajar de São Paulo para Brasília, estará indo principalmente para qual direção?", options: ["Noroeste", "Sudeste", "Sul", "Nordeste"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Se você viajar de São Paulo para Manaus, estará indo principalmente para qual região?", options: ["Sul", "Norte", "Nordeste", "Centro-Oeste"], correct: 1, tempo: 20 },
{ tema: "Geografia", question: "Se você sair de São Paulo em direção ao Paraná, qual estado encontrará primeiro?", options: ["Minas Gerais", "Paraná", "Bahia", "Goiás"], correct: 1, tempo: 20 },
{ tema: "Geografia", question: "Qual cidade fica mais ao sul?", options: ["Curitiba", "Salvador", "Brasília", "Manaus"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual cidade fica mais ao norte?", options: ["Porto Alegre", "Curitiba", "Manaus", "São Paulo"], correct: 2, tempo: 20 },
{ tema: "Geografia", question: "Qual cidade está localizada mais próxima do litoral?", options: ["Brasília", "São Paulo", "Goiânia", "Cuiabá"], correct: 1, tempo: 20 },
{ tema: "Geografia", question: "Qual destas capitais brasileiras fica na região Sul?", options: ["Curitiba", "Goiânia", "Salvador", "Recife"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual destas cidades fica na região Nordeste?", options: ["Curitiba", "Recife", "Goiânia", "Porto Alegre"], correct: 1, tempo: 20 },
{ tema: "Geografia", question: "Qual destas cidades fica na região Centro-Oeste?", options: ["Brasília", "Salvador", "Manaus", "Recife"], correct: 0, tempo: 20 },
 // --- DISTÂNCIA E LOCALIZAÇÃO ---

  // --- GEOGRAFIA: DISTÂNCIA E LOCALIZAÇÃO ---

{ tema: "Geografia", question: "Qual cidade está mais próxima do litoral?", options: ["Brasília", "Rio de Janeiro", "Goiânia", "Cuiabá"], correct: 1, tempo: 20 },
{ tema: "Geografia", question: "Qual capital brasileira está mais próxima da fronteira com a Argentina?", options: ["Porto Alegre", "Salvador", "Recife", "Manaus"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual cidade está localizada mais ao oeste?", options: ["Recife", "Brasília", "Rio Branco", "Salvador"], correct: 2, tempo: 20 },
{ tema: "Geografia", question: "Qual capital está mais próxima da Linha do Equador?", options: ["Macapá", "Porto Alegre", "Curitiba", "São Paulo"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual destas cidades está mais ao sul?", options: ["Manaus", "Salvador", "Porto Alegre", "Fortaleza"], correct: 2, tempo: 20 },
{ tema: "Geografia", question: "Qual destas cidades está mais ao norte?", options: ["Porto Alegre", "São Paulo", "Fortaleza", "Curitiba"], correct: 2, tempo: 20 },
{ tema: "Geografia", question: "Qual capital brasileira está localizada no interior do país?", options: ["Brasília", "Rio de Janeiro", "Salvador", "Recife"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual destas capitais fica diretamente no litoral?", options: ["Brasília", "Goiânia", "Salvador", "Cuiabá"], correct: 2, tempo: 20 },
{ tema: "Geografia", question: "Qual destas cidades fica mais próxima do Rio Grande do Sul?", options: ["Curitiba", "Manaus", "Salvador", "Recife"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual destas cidades está mais próxima da região amazônica?", options: ["Manaus", "Porto Alegre", "Curitiba", "Florianópolis"], correct: 0, tempo: 20 },

 // BIOMAS E ANIMAIS
  // --- GEOGRAFIA: BIOMAS E ANIMAIS ---
{ tema: "Geografia", question: "Qual é o maior bioma brasileiro?", options: ["Cerrado", "Amazônia", "Caatinga", "Pantanal"], correct: 1, tempo: 20 },
{ tema: "Geografia", question: "Qual bioma ocupa grande parte da região Nordeste?", options: ["Caatinga", "Pampa", "Pantanal", "Amazônia"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual bioma é predominante no Centro-Oeste?", options: ["Cerrado", "Pampa", "Caatinga", "Mata Atlântica"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual bioma é conhecido por suas grandes áreas alagadas?", options: ["Pantanal", "Caatinga", "Pampa", "Cerrado"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual bioma é encontrado principalmente no extremo sul do Brasil?", options: ["Amazônia", "Pampa", "Caatinga", "Pantanal"], correct: 1, tempo: 20 },
{ tema: "Geografia", question: "Qual bioma possui vegetação adaptada à falta de água?", options: ["Caatinga", "Pantanal", "Pampa", "Amazônia"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual bioma possui uma das maiores biodiversidades do planeta?", options: ["Amazônia", "Pampa", "Caatinga", "Pantanal"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual animal é muito associado ao Cerrado?", options: ["Lobo-guará", "Pinguim", "Urso-polar", "Canguru"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual animal é símbolo do Pantanal?", options: ["Tuiuiú", "Pinguim", "Canguru", "Urso"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual animal é encontrado na Amazônia?", options: ["Boto-cor-de-rosa", "Pinguim", "Urso-polar", "Canguru"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual animal é típico da Caatinga?", options: ["Carcará", "Pinguim", "Urso-polar", "Canguru"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual bioma sofre com longos períodos de seca?", options: ["Caatinga", "Pantanal", "Pampa", "Amazônia"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual bioma possui árvores geralmente baixas e retorcidas?", options: ["Cerrado", "Amazônia", "Pampa", "Pantanal"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual bioma brasileiro é conhecido pelos campos naturais?", options: ["Pampa", "Amazônia", "Caatinga", "Pantanal"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual bioma está muito presente na faixa litorânea brasileira?", options: ["Mata Atlântica", "Pampa", "Cerrado", "Caatinga"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual animal brasileiro é conhecido por mudar de cor para se camuflar?", options: ["Bicho-pau", "Arara", "Capivara", "Tucano"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual é o maior felino das Américas?", options: ["Onça-pintada", "Puma", "Lince", "Gato-do-mato"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual é o maior mamífero terrestre encontrado no Brasil?", options: ["Anta", "Capivara", "Tamanduá", "Onça"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual é o maior roedor do mundo, encontrado no Brasil?", options: ["Capivara", "Castor", "Preá", "Cutia"], correct: 0, tempo: 20 },

  //Clima

  // --- GEOGRAFIA: CLIMA ---
{ tema: "Geografia", question: "Qual clima predomina na maior parte da Amazônia?", options: ["Equatorial", "Polar", "Semiárido", "Subtropical"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual região brasileira apresenta áreas de clima semiárido?", options: ["Nordeste", "Sul", "Norte", "Centro-Oeste"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual região brasileira apresenta temperaturas mais baixas no inverno?", options: ["Sul", "Norte", "Nordeste", "Centro-Oeste"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Em qual região brasileira é mais comum ocorrer geada?", options: ["Sul", "Norte", "Nordeste", "Centro-Oeste"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "O que acontece com a temperatura, em geral, quando aumentamos a altitude?", options: ["Diminui", "Aumenta", "Não muda", "Dobra"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual fator climático está relacionado à distância de um lugar em relação ao Equador?", options: ["Latitude", "Altitude", "Vegetação", "Relevo"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual fator pode deixar uma cidade mais fria por estar em uma área elevada?", options: ["Altitude", "Longitude", "Vegetação", "Maré"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual fenômeno climático é associado ao aquecimento das águas do Pacífico?", options: ["El Niño", "La Niña", "Tsunami", "Furacão"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual fenômeno é associado ao resfriamento das águas do Pacífico?", options: ["El Niño", "La Niña", "Tornado", "Monção"], correct: 1, tempo: 20 },
{ tema: "Geografia", question: "Qual região brasileira é geralmente mais quente durante o ano?", options: ["Norte", "Sul", "Sudeste", "Centro-Oeste"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "O que é uma seca?", options: ["Período prolongado com pouca chuva", "Período com muita neve", "Aumento do nível do mar", "Formação de furacões"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "O que é uma enchente?", options: ["Transbordamento de água", "Falta de chuva", "Aumento da temperatura", "Formação de gelo"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual região brasileira é conhecida por possuir clima predominantemente tropical em grande parte de seu território?", options: ["Centro-Oeste", "Sul", "Norte", "Sudeste"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual região possui clima subtropical em grande parte de seu território?", options: ["Sul", "Norte", "Nordeste", "Centro-Oeste"], correct: 0, tempo: 20 },

  //RIOS, MARES, PRAIAS E RELEVO

  // --- GEOGRAFIA: RIOS, MARES, PRAIAS E RELEVO ---

{ tema: "Geografia", question: "Qual é o maior rio brasileiro em volume de água?", options: ["Amazonas", "São Francisco", "Paraná", "Tietê"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual rio é conhecido como 'Velho Chico'?", options: ["São Francisco", "Amazonas", "Paraná", "Tocantins"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual rio atravessa a cidade de São Paulo?", options: ["Tietê", "São Francisco", "Amazonas", "Paraná"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual rio passa pela cidade de Manaus?", options: ["Negro", "Tietê", "São Francisco", "Paraná"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "O Rio Negro está localizado principalmente em qual região?", options: ["Norte", "Sul", "Sudeste", "Nordeste"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual oceano banha o litoral brasileiro?", options: ["Atlântico", "Pacífico", "Índico", "Ártico"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual estado possui o litoral mais extenso do Brasil?", options: ["Bahia", "São Paulo", "Rio de Janeiro", "Ceará"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Em qual estado ficam as Cataratas do Iguaçu?", options: ["Paraná", "Santa Catarina", "São Paulo", "Rio Grande do Sul"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "As Cataratas do Iguaçu ficam na fronteira do Brasil com qual país?", options: ["Paraguai", "Argentina", "Uruguai", "Bolívia"], correct: 1, tempo: 20 },
{ tema: "Geografia", question: "Qual praia brasileira é famosa pelas águas cristalinas e fica em Fernando de Noronha?", options: ["Baía do Sancho", "Copacabana", "Boa Viagem", "Ipanema"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual cidade é famosa pela praia de Copacabana?", options: ["Rio de Janeiro", "Salvador", "Recife", "Fortaleza"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual é o nome dado ao encontro de um rio com o mar?", options: ["Foz", "Nascente", "Montanha", "Planície"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Onde um rio normalmente começa?", options: ["Nascente", "Foz", "Delta", "Praia"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "O que é uma ilha?", options: ["Porção de terra cercada por água", "Montanha muito alta", "Área coberta de areia", "Rio muito largo"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "O que é um arquipélago?", options: ["Conjunto de ilhas", "Conjunto de montanhas", "Grande rio", "Área desértica"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Fernando de Noronha pertence a qual estado?", options: ["Pernambuco", "Bahia", "Ceará", "Rio Grande do Norte"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual é uma das maiores bacias hidrográficas do mundo?", options: ["Bacia Amazônica", "Bacia do Tietê", "Bacia do Paraíba", "Bacia do Paraguaçu"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual tipo de relevo possui áreas mais baixas e relativamente planas?", options: ["Planície", "Montanha", "Serra", "Planalto"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual tipo de relevo possui áreas elevadas e geralmente mais planas no topo?", options: ["Planalto", "Planície", "Depressão", "Praia"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "O que é uma montanha?", options: ["Grande elevação natural do terreno", "Área sempre coberta por água", "Rio subterrâneo", "Área completamente plana"], correct: 0, tempo: 20 },


  // --- GEOGRAFIA: CAPITAIS E CIDADES ---

{ tema: "Geografia", question: "Qual é a capital de São Paulo?", options: ["São Paulo", "Campinas", "Santos", "Sorocaba"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual é a capital do Paraná?", options: ["Curitiba", "Londrina", "Maringá", "Foz do Iguaçu"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual é a capital de Santa Catarina?", options: ["Florianópolis", "Joinville", "Blumenau", "Chapecó"], correct: 0, tempo: 20 },{ tema: "Geografia", question: "Qual é a capital do Rio Grande do Sul?", options: ["Porto Alegre", "Caxias do Sul", "Pelotas", "Gramado"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual é a capital de Minas Gerais?", options: ["Belo Horizonte", "Uberlândia", "Juiz de Fora", "Ouro Preto"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual é a capital do Rio de Janeiro?", options: ["Rio de Janeiro", "Niterói", "Petrópolis", "Angra dos Reis"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual é a capital do Espírito Santo?", options: ["Vitória", "Vila Velha", "Serra", "Guarapari"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual é a capital da Bahia?", options: ["Salvador", "Ilhéus", "Porto Seguro", "Feira de Santana"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual é a capital de Pernambuco?", options: ["Recife", "Olinda", "Caruaru", "Petrolina"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual é a capital do Ceará?", options: ["Fortaleza", "Sobral", "Caucaia", "Juazeiro do Norte"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual é a capital do Maranhão?", options: ["São Luís", "Imperatriz", "Caxias", "Balsas"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual é a capital do Pará?", options: ["Belém", "Santarém", "Marabá", "Altamira"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual é a capital do Amazonas?", options: ["Manaus", "Parintins", "Tefé", "Itacoatiara"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual é a capital de Goiás?", options: ["Goiânia", "Anápolis", "Rio Verde", "Catalão"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual é a capital de Mato Grosso?", options: ["Cuiabá", "Rondonópolis", "Sinop", "Cáceres"], correct: 0, tempo: 20 },{ tema: "Geografia", question: "Qual é a capital de Mato Grosso do Sul?", options: ["Campo Grande", "Dourados", "Corumbá", "Três Lagoas"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual é a capital do Tocantins?", options: ["Palmas", "Araguaína", "Gurupi", "Porto Nacional"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual é a capital do Acre?", options: ["Rio Branco", "Cruzeiro do Sul", "Sena Madureira", "Tarauacá"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual é a capital de Rondônia?", options: ["Porto Velho", "Ji-Paraná", "Ariquemes", "Cacoal"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual é a capital de Roraima?", options: ["Boa Vista", "Caracaraí", "Pacaraima", "Rorainópolis"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual é a capital do Amapá?", options: ["Macapá", "Santana", "Oiapoque", "Laranjal do Jari"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual é a capital do Piauí?", options: ["Teresina", "Parnaíba", "Picos", "Floriano"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual é a capital de Alagoas?", options: ["Maceió", "Arapiraca", "Palmeira dos Índios", "Penedo"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual é a capital de Sergipe?", options: ["Aracaju", "Itabaiana", "Lagarto", "Estância"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual é a capital do Rio Grande do Norte?", options: ["Natal", "Mossoró", "Parnamirim", "Caicó"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual é a capital da Paraíba?", options: ["João Pessoa", "Campina Grande", "Patos", "Cabedelo"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual é a capital do Maranhão?", options: ["São Luís", "Imperatriz", "Caxias", "Bacabal"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual é a capital do Pará?", options: ["Belém", "Santarém", "Marabá", "Altamira"], correct: 0, tempo: 20 },
{ tema: "Geografia", question: "Qual é a capital do Brasil?", options: ["Brasília", "São Paulo", "Rio de Janeiro", "Salvador"], correct: 0, tempo: 20 },

 
  // --- GEOGRAFIA: CURIOSIDADES DO BRASIL ---


  // --- GEOGRAFIA: CURIOSIDADES DO BRASIL ---
  { tema: "Geografia", question: "Quantos estados possui o Brasil?", options: ["24", "25", "26", "27"], correct: 2, tempo: 20 },
  { tema: "Geografia", question: "Quantas regiões oficiais possui o Brasil?", options: ["4", "5", "6", "7"], correct: 1, tempo: 20 },
  { tema: "Geografia", question: "Qual é a maior região brasileira em extensão territorial?", options: ["Norte", "Nordeste", "Sudeste", "Sul"], correct: 0, tempo: 20 },
  { tema: "Geografia", question: "Qual região possui o maior número de estados?", options: ["Sul", "Nordeste", "Norte", "Sudeste"], correct: 1, tempo: 20 },
  { tema: "Geografia", question: "Qual é o maior estado brasileiro em área?", options: ["Amazonas", "Pará", "Mato Grosso", "Bahia"], correct: 0, tempo: 20 },
  { tema: "Geografia", question: "Qual é o menor estado brasileiro em área?", options: ["Sergipe", "Alagoas", "Espírito Santo", "Rio de Janeiro"], correct: 0, tempo: 20 },
  { tema: "Geografia", question: "Qual é a maior cidade do Brasil em população?", options: ["Rio de Janeiro", "São Paulo", "Brasília", "Salvador"], correct: 1, tempo: 20 },
  { tema: "Geografia", question: "Qual cidade é conhecida como Cidade Maravilhosa?", options: ["São Paulo", "Rio de Janeiro", "Salvador", "Recife"], correct: 1, tempo: 20 },

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
  { tema: "História", question: "Em que ano a escravidão foi abolida no Brasil?", options: ["1822", "1888", "1889", "1930"], correct: 1, tempo: 20 }


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

  { tema: "Química", question: "Qual partícula do átomo possui carga elétrica negativa?", options: ["Próton", "Nêutron", "Elétron", "Núcleo"], correct: 2, tempo: 20 },
  { tema: "Química", question: "Qual partícula do átomo não possui carga elétrica?", options: ["Próton", "Nêutron", "Elétron", "Íon"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual partícula determina o número atômico de um elemento?", options: ["Elétron", "Nêutron", "Próton", "Íon"], correct: 2, tempo: 20 },
  { tema: "Química", question: "Qual é o número atômico do carbono?", options: ["4", "6", "8", "12"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual é o símbolo químico do ferro?", options: ["Fe", "F", "Fr", "Fi"], correct: 0, tempo: 20 },
  { tema: "Química", question: "Qual é o símbolo químico do ouro?", options: ["O", "Au", "Ag", "Gd"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual é o símbolo químico da prata?", options: ["Pt", "Pr", "Ag", "Au"], correct: 2, tempo: 20 },
  { tema: "Química", question: "Qual elemento possui o símbolo Na?", options: ["Nitrogênio", "Sódio", "Neônio", "Níquel"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual elemento possui o símbolo K?", options: ["Cálcio", "Potássio", "Criptônio", "Carbono"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual elemento é representado pelo símbolo Ca?", options: ["Carbono", "Cálcio", "Cádmio", "Cobalto"], correct: 1, tempo: 20 },

  { tema: "Química", question: "Qual elemento é conhecido por formar o gás utilizado nos balões para fazê-los flutuar?", options: ["Oxigênio", "Hélio", "Nitrogênio", "Cloro"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual gás é mais abundante na atmosfera terrestre?", options: ["Oxigênio", "Nitrogênio", "Dióxido de carbono", "Hélio"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual elemento é essencial para a formação dos ossos e dentes?", options: ["Cálcio", "Ferro", "Sódio", "Cloro"], correct: 0, tempo: 20 },
  { tema: "Química", question: "Qual elemento é fundamental para o transporte de oxigênio no sangue?", options: ["Cálcio", "Ferro", "Potássio", "Magnésio"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual elemento químico está presente na grafite e no diamante?", options: ["Silício", "Carbono", "Ferro", "Enxofre"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual elemento é encontrado em grande quantidade nos oceanos na forma de sais?", options: ["Sódio", "Ouro", "Ferro", "Hélio"], correct: 0, tempo: 20 },
  { tema: "Química", question: "Qual é o elemento mais abundante no Universo?", options: ["Oxigênio", "Carbono", "Hidrogênio", "Hélio"], correct: 2, tempo: 20 },
  { tema: "Química", question: "Qual gás nobre é usado em letreiros luminosos de cor avermelhada?", options: ["Hélio", "Neônio", "Argônio", "Criptônio"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual gás nobre é frequentemente usado em lâmpadas para evitar a oxidação do filamento?", options: ["Argônio", "Oxigênio", "Cloro", "Hidrogênio"], correct: 0, tempo: 20 },
  { tema: "Química", question: "Em qual estado físico as partículas possuem maior liberdade de movimento?", options: ["Sólido", "Líquido", "Gasoso", "Cristalino"], correct: 2, tempo: 20 },

  { tema: "Química", question: "Quando o gelo derrete, ocorre uma mudança de estado chamada:", options: ["Fusão", "Vaporização", "Condensação", "Sublimação"], correct: 0, tempo: 20 },
  { tema: "Química", question: "Quando a água líquida passa para o estado gasoso, ocorre:", options: ["Fusão", "Solidificação", "Vaporização", "Condensação"], correct: 2, tempo: 20 },
  { tema: "Química", question: "Quando o vapor de água vira líquido, ocorre:", options: ["Fusão", "Condensação", "Sublimação", "Solidificação"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Quando a água líquida vira gelo, ocorre:", options: ["Vaporização", "Condensação", "Solidificação", "Sublimação"], correct: 2, tempo: 20 },
  { tema: "Química", question: "Qual mudança de estado ocorre quando o gelo seco passa diretamente para gás?", options: ["Fusão", "Sublimação", "Condensação", "Solidificação"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual fenômeno ocorre quando a roupa molhada seca no varal?", options: ["Condensação", "Vaporização", "Solidificação", "Fusão"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Por que o álcool colocado na pele provoca sensação de frio?", options: ["Porque congela rapidamente", "Porque evapora e absorve calor", "Porque libera oxigênio", "Porque aumenta a temperatura da pele"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual método é mais adequado para separar areia e água?", options: ["Filtração", "Destilação", "Evaporação", "Sublimação"], correct: 0, tempo: 20 },
  { tema: "Química", question: "Qual método pode ser usado para separar dois líquidos com diferentes pontos de ebulição?", options: ["Filtração", "Decantação", "Destilação", "Catação"], correct: 2, tempo: 20 },
  { tema: "Química", question: "Como podemos separar limalha de ferro de areia?", options: ["Filtração", "Imantação", "Destilação", "Evaporação"], correct: 1, tempo: 20 },

  { tema: "Química", question: "Uma solução com pH 7 é considerada:", options: ["Ácida", "Básica", "Neutra", "Corrosiva"], correct: 2, tempo: 20 },
  { tema: "Química", question: "Uma substância com pH menor que 7 é:", options: ["Ácida", "Básica", "Neutra", "Metálica"], correct: 0, tempo: 20 },
  { tema: "Química", question: "Uma substância com pH maior que 7 é:", options: ["Ácida", "Básica", "Neutra", "Radioativa"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual dessas substâncias é naturalmente ácida?", options: ["Suco de limão", "Sabão", "Água sanitária", "Bicarbonato de sódio"], correct: 0, tempo: 20 },
  { tema: "Química", question: "Qual substância é conhecida por ser uma base presente em muitos produtos de limpeza?", options: ["Vinagre", "Sabão", "Suco de limão", "Refrigerante"], correct: 1, tempo: 20 },
  { tema: "Química", question: "O vinagre contém principalmente qual ácido?", options: ["Ácido sulfúrico", "Ácido clorídrico", "Ácido acético", "Ácido nítrico"], correct: 2, tempo: 20 },
  { tema: "Química", question: "O bicarbonato de sódio é representado por qual fórmula?", options: ["NaCl", "NaHCO₃", "NaOH", "H₂CO₃"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual substância é usada para diminuir a acidez do estômago?", options: ["Antiácido", "Ácido sulfúrico", "Álcool", "Cloro"], correct: 0, tempo: 20 },
  { tema: "Química", question: "Uma reação entre um ácido e uma base geralmente produz:", options: ["Sal e água", "Apenas oxigênio", "Metal e gás", "Apenas carbono"], correct: 0, tempo: 20 },
  { tema: "Química", question: "Como é chamada a reação entre um ácido e uma base?", options: ["Combustão", "Neutralização", "Oxidação", "Fermentação"], correct: 1, tempo: 20 },

  { tema: "Química", question: "Qual gás é consumido durante uma combustão?", options: ["Nitrogênio", "Oxigênio", "Hélio", "Dióxido de carbono"], correct: 1, tempo: 20 },
  { tema: "Química", question: "O que geralmente é liberado em uma reação de combustão?", options: ["Energia", "Apenas água", "Nitrogênio puro", "Sal"], correct: 0, tempo: 20 },
  { tema: "Química", question: "Qual combustível é formado principalmente por hidrocarbonetos?", options: ["Gasolina", "Água", "Sal de cozinha", "Oxigênio"], correct: 0, tempo: 20 },
  { tema: "Química", question: "Qual elemento está presente em todos os hidrocarbonetos?", options: ["Oxigênio", "Carbono", "Cloro", "Sódio"], correct: 1, tempo: 20 },
  { tema: "Química", question: "O metano é formado por quais elementos?", options: ["Carbono e hidrogênio", "Carbono e oxigênio", "Sódio e cloro", "Nitrogênio e oxigênio"], correct: 0, tempo: 20 },
  { tema: "Química", question: "Qual é a fórmula do gás metano?", options: ["CH₄", "C₂H₆", "CO₂", "CH₃OH"], correct: 0, tempo: 20 },
  { tema: "Química", question: "Qual é a principal característica de uma reação exotérmica?", options: ["Absorve calor", "Libera calor", "Não envolve energia", "Sempre produz água"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Uma reação endotérmica:", options: ["Libera calor", "Absorve energia do ambiente", "Sempre produz luz", "Não sofre alteração de temperatura"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Quando uma substância libera luz e calor durante uma reação, isso pode indicar uma:", options: ["Combustão", "Filtração", "Decantação", "Fusão"], correct: 0, tempo: 20 },
  { tema: "Química", question: "A ferrugem do ferro é um exemplo de reação envolvendo principalmente:", options: ["Oxidação", "Neutralização", "Sublimação", "Fermentação"], correct: 0, tempo: 20 },

  { tema: "Química", question: "Qual substância é conhecida como água oxigenada?", options: ["H₂O", "H₂O₂", "CO₂", "O₃"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual é a fórmula do gás oxigênio presente no ar?", options: ["O", "O₂", "O₃", "CO₂"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual é a fórmula do ozônio?", options: ["O₂", "O₃", "CO₂", "H₂O"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual dessas substâncias é formada por dois átomos de hidrogênio e um de oxigênio?", options: ["H₂O", "CO₂", "H₂O₂", "O₂"], correct: 0, tempo: 20 },
  { tema: "Química", question: "Qual é a fórmula do dióxido de carbono?", options: ["CO", "CO₂", "C₂O", "C₂O₂"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual é a fórmula do gás hidrogênio?", options: ["H", "H₂", "H₂O", "HO₂"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual substância é formada pela combinação de sódio e cloro?", options: ["Água", "Sal de cozinha", "Açúcar", "Ácido acético"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual é a fórmula do hidróxido de sódio, conhecido como soda cáustica?", options: ["NaCl", "NaOH", "NaHCO₃", "HCl"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual é a fórmula do álcool etílico presente nas bebidas alcoólicas?", options: ["CH₄", "C₂H₅OH", "C₆H₁₂O₆", "CH₃COOH"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual é a fórmula molecular da sacarose, o açúcar comum?", options: ["C₆H₁₂O₆", "C₁₂H₂₂O₁₁", "CH₄", "C₂H₅OH"], correct: 1, tempo: 20 },

  { tema: "Química", question: "Qual propriedade indica a quantidade de matéria presente em um corpo?", options: ["Massa", "Densidade", "Volume", "Temperatura"], correct: 0, tempo: 20 },
  { tema: "Química", question: "Qual grandeza representa o espaço ocupado por um corpo?", options: ["Massa", "Volume", "Densidade", "Pressão"], correct: 1, tempo: 20 },
  { tema: "Química", question: "A densidade é calculada pela relação entre:", options: ["Massa e volume", "Temperatura e pressão", "Tempo e massa", "Volume e temperatura"], correct: 0, tempo: 20 },
  { tema: "Química", question: "Por que o óleo fica sobre a água em um recipiente?", options: ["Porque o óleo é mais denso", "Porque o óleo é menos denso", "Porque a água é gasosa", "Porque o óleo congela"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Qual unidade é muito utilizada para medir quantidade de matéria?", options: ["Newton", "Mol", "Joule", "Pascal"], correct: 1, tempo: 20 },
  { tema: "Química", question: "O número de Avogadro representa aproximadamente:", options: ["6,02 × 10²³ partículas", "9,8 × 10² partículas", "3,14 × 10⁶ partículas", "1,6 × 10⁻¹⁹ partículas"], correct: 0, tempo: 20 },
  { tema: "Química", question: "Qual é a unidade de massa mais utilizada no Sistema Internacional?", options: ["Grama", "Quilograma", "Tonelada", "Miligrama"], correct: 1, tempo: 20 },
  { tema: "Química", question: "Quando aumentamos a temperatura de um gás, mantendo o volume constante, sua pressão tende a:", options: ["Diminuir", "Aumentar", "Zerar", "Permanecer sempre igual"], correct: 1, tempo: 20 },
  { tema: "Química", question: "O que acontece com as partículas de uma substância quando sua temperatura aumenta?", options: ["Movimentam-se mais rapidamente", "Param de se mover", "Desaparecem", "Transformam-se sempre em elétrons"], correct: 0, tempo: 20 },
  { tema: "Química", question: "Qual fator geralmente aumenta a velocidade de uma reação química?", options: ["Diminuir a temperatura", "Aumentar a temperatura", "Retirar todos os reagentes", "Congelar os reagentes"], correct: 1, tempo: 20 },

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
{ tema: "Física", question: "Qual é a unidade de medida de energia no Sistema Internacional?", options: ["Newton", "Joule", "Watt", "Volt"], correct: 1, tempo: 20 },
{ tema: "Física", question: "Qual é a unidade de potência elétrica?", options: ["Volt", "Ampère", "Watt", "Ohm"], correct: 2, tempo: 20 },
{ tema: "Física", question: "Qual é a unidade de tensão elétrica?", options: ["Volt", "Watt", "Joule", "Newton"], correct: 0, tempo: 20 },
{ tema: "Física", question: "Qual é a unidade de corrente elétrica?", options: ["Ohm", "Volt", "Ampère", "Watt"], correct: 2, tempo: 20 },
{ tema: "Física", question: "Qual instrumento é usado para medir a corrente elétrica?", options: ["Voltímetro", "Amperímetro", "Termômetro", "Barômetro"], correct: 1, tempo: 20 },
{ tema: "Física", question: "Qual instrumento é usado para medir a tensão elétrica?", options: ["Amperímetro", "Voltímetro", "Dinamômetro", "Paquímetro"], correct: 1, tempo: 20 },
{ tema: "Física", question: "Qual é a unidade de resistência elétrica?", options: ["Ohm", "Volt", "Watt", "Ampère"], correct: 0, tempo: 20 },
{ tema: "Física", question: "Qual material é conhecido por ser um bom condutor de eletricidade?", options: ["Borracha", "Vidro", "Cobre", "Madeira"], correct: 2, tempo: 20 },
{ tema: "Física", question: "Qual destes materiais é um isolante elétrico?", options: ["Cobre", "Alumínio", "Ferro", "Borracha"], correct: 3, tempo: 20 },
{ tema: "Física", question: "O que acontece com a velocidade de um objeto quando ele acelera?", options: ["Sempre diminui", "Pode aumentar", "Fica sempre igual", "Desaparece"], correct: 1, tempo: 20 },
{ tema: "Física", question: "Qual é a unidade de velocidade no Sistema Internacional?", options: ["km/h", "m/s", "N/s", "m²/s"], correct: 1, tempo: 20 },
{ tema: "Física", question: "Se um carro percorre 100 metros em 10 segundos, qual é sua velocidade média?", options: ["5 m/s", "10 m/s", "20 m/s", "100 m/s"], correct: 1, tempo: 20 },
{ tema: "Física", question: "Qual força se opõe ao movimento entre duas superfícies em contato?", options: ["Gravitacional", "Magnética", "Atrito", "Elétrica"], correct: 2, tempo: 20 },
{ tema: "Física", question: "Por que é mais difícil empurrar uma caixa pesada do que uma caixa leve?", options: ["Porque a pesada possui maior massa", "Porque a leve possui mais gravidade", "Porque a pesada não possui inércia", "Porque a leve possui mais atrito"], correct: 0, tempo: 20 },
{ tema: "Física", question: "O que acontece com o peso de uma pessoa na Lua em comparação com a Terra?", options: ["Aumenta", "Diminui", "Fica exatamente igual", "Desaparece completamente"], correct: 1, tempo: 20 },
{ tema: "Física", question: "Qual é a principal causa das marés nos oceanos da Terra?", options: ["Vento", "Lua e Sol", "Chuva", "Rotação das nuvens"], correct: 1, tempo: 20 },
{ tema: "Física", question: "Por que conseguimos ver a Lua durante a noite?", options: ["Porque ela produz sua própria luz", "Porque reflete a luz do Sol", "Porque possui eletricidade", "Porque é feita de gás luminoso"], correct: 1, tempo: 20 },
{ tema: "Física", question: "Qual é a velocidade aproximada da luz no vácuo?", options: ["300 km/s", "3.000 km/s", "300.000 km/s", "3.000.000 km/s"], correct: 2, tempo: 20 },
{ tema: "Física", question: "Qual fenômeno ocorre quando a luz muda de direção ao passar de um meio para outro?", options: ["Reflexão", "Refração", "Difração", "Combustão"], correct: 1, tempo: 20 },
{ tema: "Física", question: "Qual fenômeno ocorre quando a luz bate em uma superfície e retorna?", options: ["Refração", "Reflexão", "Fusão", "Condução"], correct: 1, tempo: 20 },
{ tema: "Física", question: "Por que conseguimos enxergar nosso rosto em um espelho?", options: ["Porque o espelho produz luz", "Por causa da reflexão da luz", "Porque o vidro absorve a luz", "Por causa da gravidade"], correct: 1, tempo: 20 },
{ tema: "Física", question: "Qual objeto pode separar a luz branca em diferentes cores?", options: ["Prisma", "Ímã", "Espelho plano", "Lente opaca"], correct: 0, tempo: 20 },
{ tema: "Física", question: "Qual fenômeno natural está relacionado à separação da luz solar em várias cores?", options: ["Arco-íris", "Terremoto", "Maré", "Eclipse lunar"], correct: 0, tempo: 20 },
{ tema: "Física", question: "O som precisa de um meio material para se propagar?", options: ["Sim", "Não", "Somente no espaço", "Somente na água"], correct: 0, tempo: 20 },
{ tema: "Física", question: "Em qual destes meios o som geralmente se propaga mais rapidamente?", options: ["Vácuo", "Ar", "Água", "Sólido"], correct: 3, tempo: 20 },
{ tema: "Física", question: "Qual característica da onda sonora está relacionada à sensação de som mais agudo ou mais grave?", options: ["Frequência", "Massa", "Pressão atmosférica", "Temperatura"], correct: 0, tempo: 20 },
{ tema: "Física", question: "O que diferencia principalmente um som forte de um som fraco?", options: ["Amplitude da onda", "Cor da onda", "Massa do objeto", "Temperatura"], correct: 0, tempo: 20 },
{ tema: "Física", question: "Qual fenômeno explica o retorno do som quando ele encontra uma superfície distante?", options: ["Eco", "Refração", "Fusão", "Condução"], correct: 0, tempo: 20 },
{ tema: "Física", question: "Qual forma de transferência de calor ocorre principalmente em líquidos e gases?", options: ["Condução", "Convecção", "Radiação", "Reflexão"], correct: 1, tempo: 20 },
{ tema: "Física", question: "Como o calor do Sol chega até a Terra?", options: ["Condução", "Convecção", "Radiação", "Atrito"], correct: 2, tempo: 20 },
{ tema: "Física", question: "Qual material costuma ser um bom condutor de calor?", options: ["Madeira", "Plástico", "Cobre", "Isopor"], correct: 2, tempo: 20 },
{ tema: "Física", question: "Por que usamos roupas de lã em dias frios?", options: ["Porque a lã produz calor", "Porque a lã ajuda a reduzir a perda de calor", "Porque a lã aumenta a gravidade", "Porque a lã absorve eletricidade"], correct: 1, tempo: 20 },
{ tema: "Física", question: "O que acontece com a maioria dos materiais quando são aquecidos?", options: ["Contraem", "Expandem", "Desaparecem", "Perdem massa automaticamente"], correct: 1, tempo: 20 },
{ tema: "Física", question: "Qual estado físico possui volume definido, mas não possui forma própria?", options: ["Sólido", "Líquido", "Gasoso", "Plasma"], correct: 1, tempo: 20 },
{ tema: "Física", question: "Qual estado físico não possui forma nem volume definidos?", options: ["Sólido", "Líquido", "Gasoso", "Congelado"], correct: 2, tempo: 20 },
{ tema: "Física", question: "O que acontece com a água quando ela passa do estado líquido para o gasoso?", options: ["Condensação", "Solidificação", "Vaporização", "Fusão"], correct: 2, tempo: 20 },
{ tema: "Física", question: "Como é chamado o processo em que o vapor de água se transforma em líquido?", options: ["Fusão", "Condensação", "Vaporização", "Sublimação"], correct: 1, tempo: 20 },
{ tema: "Física", question: "Por que sentimos frio quando saímos molhados de uma piscina?", options: ["Porque a água aumenta a gravidade", "Porque a evaporação retira calor do corpo", "Porque a água produz frio", "Porque o corpo perde massa"], correct: 1, tempo: 20 },
{ tema: "Física", question: "Qual força faz um objeto cair em direção ao chão?", options: ["Atrito", "Gravidade", "Força elétrica", "Força magnética"], correct: 1, tempo: 20 },
{ tema: "Física", question: "O que acontece com a energia potencial gravitacional de um objeto quando ele é elevado?", options: ["Diminui", "Aumenta", "Desaparece", "Fica sempre zero"], correct: 1, tempo: 20 },
{ tema: "Física", question: "Um objeto em movimento possui qual tipo de energia?", options: ["Energia cinética", "Energia nuclear", "Energia química", "Energia sonora"], correct: 0, tempo: 20 },
{ tema: "Física", question: "Qual tipo de energia está armazenada em uma mola comprimida?", options: ["Cinética", "Potencial elástica", "Térmica", "Nuclear"], correct: 1, tempo: 20 },
{ tema: "Física", question: "Qual máquina simples utiliza uma roda e uma corda para facilitar a elevação de objetos?", options: ["Polia", "Termômetro", "Bússola", "Bateria"], correct: 0, tempo: 20 },
{ tema: "Física", question: "Qual máquina simples é uma superfície inclinada usada para facilitar a subida de objetos?", options: ["Alavanca", "Plano inclinado", "Polia", "Engrenagem"], correct: 1, tempo: 20 },
{ tema: "Física", question: "Qual fenômeno explica por que um objeto parece mais leve dentro da água?", options: ["Empuxo", "Atrito", "Magnetismo", "Eletricidade"], correct: 0, tempo: 20 },
{ tema: "Física", question: "Por que alguns objetos flutuam na água?", options: ["Porque não possuem massa", "Porque o empuxo pode equilibrar ou superar seu peso", "Porque a água elimina a gravidade", "Porque possuem eletricidade"], correct: 1, tempo: 20 },
{ tema: "Física", question: "Qual instrumento é utilizado para indicar direções usando o campo magnético da Terra?", options: ["Bússola", "Termômetro", "Barômetro", "Amperímetro"], correct: 0, tempo: 20 },
{ tema: "Física", question: "Quais polos magnéticos são encontrados em um ímã?", options: ["Leste e Oeste", "Norte e Sul", "Positivo e Negativo", "Alto e Baixo"], correct: 1, tempo: 20 },
{ tema: "Física", question: "O que acontece quando aproximamos dois polos iguais de ímãs?", options: ["Eles se atraem", "Eles se repelem", "Eles desaparecem", "Eles ficam eletricamente neutros"], correct: 1, tempo: 20 },
{ tema: "Física", question: "O que acontece quando aproximamos polos magnéticos opostos?", options: ["Eles se atraem", "Eles se repelem", "Eles perdem o magnetismo", "Eles explodem"], correct: 0, tempo: 20 },
{ tema: "Física", question: "Qual fenômeno ocorre quando a Lua fica entre o Sol e a Terra?", options: ["Eclipse lunar", "Eclipse solar", "Solstício", "Equinócio"], correct: 1, tempo: 20 },
{ tema: "Física", question: "Qual fenômeno ocorre quando a Terra fica entre o Sol e a Lua?", options: ["Eclipse solar", "Eclipse lunar", "Aurora boreal", "Solstício"], correct: 1, tempo: 20 },
{ tema: "Física", question: "Por que os astronautas parecem flutuar dentro de uma estação espacial em órbita?", options: ["Porque não existe gravidade no espaço", "Porque estão em queda livre orbital", "Porque perderam massa", "Porque o ar os empurra"], correct: 1, tempo: 20 },
{ tema: "Física", question: "Qual é a principal fonte de energia que mantém a Terra aquecida?", options: ["Lua", "Sol", "Vento", "Campo magnético"], correct: 1, tempo: 20 },
{ tema: "Física", question: "O que é necessário para que uma lâmpada acenda em um circuito elétrico simples?", options: ["Circuito fechado", "Circuito aberto", "Somente um fio", "Somente uma tomada"], correct: 0, tempo: 20 },
{ tema: "Física", question: "Se uma lâmpada de maior potência fica ligada pelo mesmo tempo que uma de menor potência, qual tende a consumir mais energia?", options: ["A de menor potência", "A de maior potência", "As duas sempre consomem igual", "Nenhuma consome energia"], correct: 1, tempo: 20 },
{ tema: "Física", question: "Qual efeito ocorre quando uma corrente elétrica passa por um fio e produz calor?", options: ["Efeito Joule", "Efeito Doppler", "Efeito fotoelétrico", "Efeito estufa"], correct: 0, tempo: 20 },
{ tema: "Física", question: "Qual aparelho transforma principalmente energia elétrica em energia mecânica?", options: ["Motor elétrico", "Lâmpada", "Chuveiro", "Resistor"], correct: 0, tempo: 20 },
{ tema: "Física", question: "Qual aparelho transforma energia elétrica principalmente em energia luminosa?", options: ["Motor", "Lâmpada", "Ventilador", "Ferro de passar"], correct: 1, tempo: 20 },
{ tema: "Física", question: "Por que os pneus de um carro possuem ranhuras?", options: ["Para aumentar o atrito com o solo", "Para diminuir a massa do carro", "Para aumentar a velocidade da luz", "Para eliminar a gravidade"], correct: 0, tempo: 20 },
{ tema: "Física", question: "Quando um carro faz uma curva, qual força é necessária para mantê-lo em uma trajetória circular?", options: ["Força centrípeta", "Força nuclear", "Força elétrica", "Força de empuxo"], correct: 0, tempo: 20 },
{ tema: "Física", question: "Qual princípio explica por que uma pessoa é lançada para frente quando um carro freia bruscamente?", options: ["Inércia", "Empuxo", "Refração", "Condução"], correct: 0, tempo: 20 },
{ tema: "Física", question: "Qual lei de Newton é conhecida como Lei da Ação e Reação?", options: ["Primeira Lei", "Segunda Lei", "Terceira Lei", "Lei da Gravitação"], correct: 2, tempo: 20 },
{ tema: "Física", question: "Quando você empurra uma parede e sente uma força de volta, isso é um exemplo de qual lei?", options: ["Primeira Lei de Newton", "Segunda Lei de Newton", "Terceira Lei de Newton", "Lei de Ohm"], correct: 2, tempo: 20 },
{ tema: "Física", question: "Qual físico é conhecido pela famosa história da maçã associada à gravidade?", options: ["Albert Einstein", "Isaac Newton", "Galileu Galilei", "Michael Faraday"], correct: 1, tempo: 20 },
{ tema: "Física", question: "Quem desenvolveu a teoria da relatividade?", options: ["Isaac Newton", "Albert Einstein", "Nikola Tesla", "James Watt"], correct: 1, tempo: 20 },
{ tema: "Física", question: "Qual cientista realizou importantes estudos sobre a queda dos corpos e o movimento?", options: ["Galileu Galilei", "Darwin", "Mendel", "Pasteur"], correct: 0, tempo: 20 },
{ tema: "Física", question: "Qual fenômeno explica a mudança aparente da frequência de uma sirene quando uma ambulância passa por nós?", options: ["Efeito Doppler", "Efeito Joule", "Reflexão total", "Empuxo"], correct: 0, tempo: 20 },

  // --- PORTUGUÊS ---
{ tema: "Português", question: "Qual é o plural correto da palavra 'papel'?", options: ["Papels", "Papéis", "Papeis", "Papelões"], correct: 1, tempo: 20 },
{ tema: "Português", question: "Qual é o plural correto da palavra 'animal'?", options: ["Animais", "Animals", "Animalis", "Animalões"], correct: 0, tempo: 20 },
{ tema: "Português", question: "Qual é o plural correto da palavra 'mão'?", options: ["Mãos", "Mões", "Mães", "Mãoses"], correct: 0, tempo: 20 },
{ tema: "Português", question: "Qual é o plural correto da palavra 'pão'?", options: ["Pãos", "Pães", "Pões", "Pãoses"], correct: 1, tempo: 20 },
{ tema: "Português", question: "Qual é o plural correto da palavra 'cidadão'?", options: ["Cidadões", "Cidadãos", "Cidadães", "Cidadans"], correct: 1, tempo: 20 },
{ tema: "Português", question: "Qual é o feminino de 'cavaleiro'?", options: ["Cavalheira", "Cavaleira", "Cavalona", "Cavala"], correct: 1, tempo: 20 },
{ tema: "Português", question: "Qual é o feminino de 'ator'?", options: ["Atriz", "Atoresa", "Atora", "Atriza"], correct: 0, tempo: 20 },
{ tema: "Português", question: "Qual é o feminino de 'rei'?", options: ["Rainha", "Reia", "Raina", "Reina"], correct: 0, tempo: 20 },
{ tema: "Português", question: "Qual é o diminutivo de 'casa'?", options: ["Casão", "Casinha", "Casebre", "Casaria"], correct: 1, tempo: 20 },
{ tema: "Português", question: "Qual é o aumentativo de 'homem'?", options: ["Homenzinho", "Homenzarrão", "Hominal", "Homemito"], correct: 1, tempo: 20 },
{ tema: "Português", question: "Qual palavra é sinônimo de 'feliz'?", options: ["Triste", "Alegre", "Bravo", "Cansado"], correct: 1, tempo: 20 },
{ tema: "Português", question: "Qual palavra é sinônimo de 'rápido'?", options: ["Lento", "Veloz", "Fraco", "Pequeno"], correct: 1, tempo: 20 },
{ tema: "Português", question: "Qual é o antônimo de 'alto'?", options: ["Grande", "Baixo", "Forte", "Largo"], correct: 1, tempo: 20 },
{ tema: "Português", question: "Qual é o antônimo de 'alegre'?", options: ["Feliz", "Triste", "Animado", "Sorridente"], correct: 1, tempo: 20 },
{ tema: "Português", question: "Qual é o antônimo de 'fácil'?", options: ["Simples", "Difícil", "Rápido", "Curto"], correct: 1, tempo: 20 },
{ tema: "Português", question: "Qual palavra está escrita corretamente?", options: ["Açúcar", "Assúcar", "Açucar", "Asúcar"], correct: 0, tempo: 20 },
{ tema: "Português", question: "Qual palavra está escrita corretamente?", options: ["Coração", "Coraçâo", "Corassão", "Coraçao"], correct: 0, tempo: 20 },
{ tema: "Português", question: "Qual palavra está escrita corretamente?", options: ["Necessário", "Nescessário", "Necessareo", "Nesecário"], correct: 0, tempo: 20 },
{ tema: "Português", question: "Qual palavra está escrita corretamente?", options: ["Privilégio", "Previlegio", "Privilêgio", "Previlégio"], correct: 0, tempo: 20 },
{ tema: "Português", question: "Qual palavra está escrita corretamente?", options: ["Exagero", "Exagerro", "Ezagero", "Exajero"], correct: 0, tempo: 20 },
{ tema: "Português", question: "Qual destas palavras deve receber acento?", options: ["Cafe", "Mesa", "Livro", "Casa"], correct: 0, tempo: 20 },
{ tema: "Português", question: "Qual destas palavras está corretamente acentuada?", options: ["Lâmpada", "Lampada", "Lâmpâda", "Lampâda"], correct: 0, tempo: 20 },
{ tema: "Português", question: "Qual destas palavras é uma oxítona?", options: ["Café", "Médico", "Árvore", "Lâmpada"], correct: 0, tempo: 20 },
{ tema: "Português", question: "Qual destas palavras é uma paroxítona?", options: ["Café", "Mesa", "Sofá", "Cipó"], correct: 1, tempo: 20 },
{ tema: "Português", question: "Qual destas palavras é uma proparoxítona?", options: ["Música", "Café", "Papel", "Amor"], correct: 0, tempo: 20 },
{ tema: "Português", question: "Qual é a sílaba tônica da palavra 'computador'?", options: ["Com", "Pu", "Ta", "Dor"], correct: 3, tempo: 20 },
{ tema: "Português", question: "Qual é a sílaba tônica da palavra 'telefone'?", options: ["Te", "Le", "Fo", "Ne"], correct: 2, tempo: 20 },
{ tema: "Português", question: "Qual é a sílaba tônica da palavra 'árvore'?", options: ["Ár", "Vo", "Re", "Nenhuma"], correct: 0, tempo: 20 },
{ tema: "Português", question: "Na frase 'João comprou um livro', qual é o verbo?", options: ["João", "Comprou", "Livro", "Um"], correct: 1, tempo: 20 },
{ tema: "Português", question: "Na frase 'A menina é inteligente', qual é o adjetivo?", options: ["Menina", "É", "A", "Inteligente"], correct: 3, tempo: 20 },
{ tema: "Português", question: "Na frase 'Pedro correu rapidamente', qual é o advérbio?", options: ["Pedro", "Correu", "Rapidamente", "Nenhum"], correct: 2, tempo: 20 },
{ tema: "Português", question: "Na frase 'Meu cachorro dorme muito', qual é o sujeito?", options: ["Dorme", "Muito", "Meu cachorro", "Cachorro dorme"], correct: 2, tempo: 20 },
{ tema: "Português", question: "Na frase 'As crianças brincam no parque', qual é o verbo?", options: ["Crianças", "Brincam", "Parque", "As"], correct: 1, tempo: 20 },
{ tema: "Português", question: "Qual classe de palavra dá nome a pessoas, lugares, objetos ou sentimentos?", options: ["Verbo", "Adjetivo", "Substantivo", "Advérbio"], correct: 2, tempo: 20 },
{ tema: "Português", question: "Qual classe de palavra indica uma ação ou estado?", options: ["Substantivo", "Verbo", "Adjetivo", "Pronome"], correct: 1, tempo: 20 },
{ tema: "Português", question: "Qual classe de palavra caracteriza um substantivo?", options: ["Verbo", "Adjetivo", "Artigo", "Preposição"], correct: 1, tempo: 20 },
{ tema: "Português", question: "Qual destas palavras é um verbo?", options: ["Bonito", "Correr", "Casa", "Rapidamente"], correct: 1, tempo: 20 },
{ tema: "Português", question: "Qual destas palavras é um substantivo?", options: ["Amarelo", "Cantar", "Escola", "Rapidamente"], correct: 2, tempo: 20 },
{ tema: "Português", question: "Qual destas palavras é um pronome pessoal?", options: ["Eu", "Casa", "Bonito", "Correr"], correct: 0, tempo: 20 },
{ tema: "Português", question: "Qual destas palavras é um artigo definido?", options: ["Um", "Uma", "O", "Algum"], correct: 2, tempo: 20 },
{ tema: "Português", question: "Qual destas palavras é um artigo indefinido?", options: ["O", "A", "Os", "Uma"], correct: 3, tempo: 20 },
{ tema: "Português", question: "Qual sinal de pontuação é usado normalmente no final de uma pergunta?", options: [".", "!", "?", ","], correct: 2, tempo: 20 },
{ tema: "Português", question: "Qual sinal de pontuação indica surpresa ou emoção?", options: [".", "!", "?", ":"], correct: 1, tempo: 20 },
{ tema: "Português", question: "Qual sinal de pontuação é usado para separar elementos de uma lista?", options: ["Vírgula", "Ponto final", "Interrogação", "Exclamação"], correct: 0, tempo: 20 },
{ tema: "Português", question: "Qual sinal de pontuação indica uma pausa maior no final de uma frase?", options: ["Vírgula", "Ponto final", "Dois-pontos", "Parênteses"], correct: 1, tempo: 20 },
{ tema: "Português", question: "Qual é o plural de 'lápis'?", options: ["Lápises", "Lápis", "Lápizes", "Lápiss"], correct: 1, tempo: 20 },
{ tema: "Português", question: "Qual é o plural de 'mês'?", options: ["Mês", "Meses", "Mêzes", "Mêss"], correct: 1, tempo: 20 },
{ tema: "Português", question: "Qual é o plural de 'fácil'?", options: ["Fácils", "Fáceis", "Fácies", "Fácilis"], correct: 1, tempo: 20 },
{ tema: "Português", question: "Qual é o plural de 'jardim'?", options: ["Jardims", "Jardins", "Jardimes", "Jardinz"], correct: 1, tempo: 20 },
{ tema: "Português", question: "Qual é o coletivo de abelhas?", options: ["Enxame", "Cardume", "Alcateia", "Rebanho"], correct: 0, tempo: 20 },
{ tema: "Português", question: "Qual é o coletivo de estrelas?", options: ["Constelação", "Cardume", "Enxame", "Rebanho"], correct: 0, tempo: 20 },
{ tema: "Português", question: "Qual é o coletivo de cães?", options: ["Matilha", "Cardume", "Alcateia", "Rebanho"], correct: 0, tempo: 20 },
{ tema: "Português", question: "Qual é o coletivo de lobos?", options: ["Manada", "Alcateia", "Matilha", "Cardume"], correct: 1, tempo: 20 },
{ tema: "Português", question: "Qual é o significado da palavra 'efêmero'?", options: ["Que dura pouco tempo", "Que é muito grande", "Que é muito antigo", "Que é impossível"], correct: 0, tempo: 20 },
{ tema: "Português", question: "Qual é o significado de 'benevolente'?", options: ["Que demonstra bondade", "Que demonstra raiva", "Que é muito rápido", "Que é muito inteligente"], correct: 0, tempo: 20 },
{ tema: "Português", question: "Qual palavra significa o mesmo que 'começar'?", options: ["Terminar", "Iniciar", "Parar", "Esquecer"], correct: 1, tempo: 20 },
{ tema: "Português", question: "Qual palavra significa o mesmo que 'bonito'?", options: ["Feio", "Belo", "Triste", "Difícil"], correct: 1, tempo: 20 },
{ tema: "Português", question: "Qual palavra significa o mesmo que 'rápido'?", options: ["Veloz", "Lento", "Fraco", "Calmo"], correct: 0, tempo: 20 },
{ tema: "Português", question: "Qual palavra significa o mesmo que 'feliz'?", options: ["Alegre", "Triste", "Bravo", "Cansado"], correct: 0, tempo: 20 },
{ tema: "Português", question: "Na frase 'O menino não foi à escola', qual palavra indica negação?", options: ["Menino", "Foi", "Escola", "Não"], correct: 3, tempo: 20 },
{ tema: "Português", question: "Qual frase está escrita corretamente?", options: ["Nós vai ao mercado.", "Nós vamos ao mercado.", "Nós fomos ao mercado amanhã.", "Nós vai no mercado."], correct: 1, tempo: 20 },
{ tema: "Português", question: "Qual frase está escrita corretamente?", options: ["A gente fomos ao parque.", "A gente foi ao parque.", "A gente foram ao parque.", "A gente iram ao parque."], correct: 1, tempo: 20 },
{ tema: "Português", question: "Qual palavra completa corretamente a frase: 'Eu ___ estudar amanhã.'?", options: ["vou", "fui", "foi", "foram"], correct: 0, tempo: 20 },
{ tema: "Português", question: "Qual palavra completa corretamente a frase: 'Ontem eu ___ ao cinema.'?", options: ["vou", "irei", "fui", "vou ir"], correct: 2, tempo: 20 },
{ tema: "Português", question: "Qual palavra completa corretamente a frase: 'Maria ___ muito bem.'?", options: ["canta", "cantam", "cantarão ontem", "cantando"], correct: 0, tempo: 20 },
{ tema: "Português", question: "Qual é o tempo verbal da frase 'Amanhã viajarei'?", options: ["Presente", "Passado", "Futuro", "Infinitivo"], correct: 2, tempo: 20 },
{ tema: "Português", question: "Qual é o tempo verbal da frase 'Eu estudo todos os dias'?", options: ["Passado", "Presente", "Futuro", "Gerúndio"], correct: 1, tempo: 20 },
{ tema: "Português", question: "Qual é o tempo verbal da frase 'Nós brincamos ontem'?", options: ["Presente", "Futuro", "Passado", "Infinitivo"], correct: 2, tempo: 20 },
{ tema: "Português", question: "Qual palavra apresenta um encontro vocálico?", options: ["Pato", "Saúde", "Casa", "Flor"], correct: 1, tempo: 20 },
{ tema: "Português", question: "Qual palavra apresenta um dígrafo?", options: ["Chuva", "Casa", "Pato", "Mesa"], correct: 0, tempo: 20 },
{ tema: "Português", question: "Qual palavra possui um encontro consonantal?", options: ["Prato", "Casa", "Amigo", "Avião"], correct: 0, tempo: 20 },
{ tema: "Português", question: "Qual palavra está escrita corretamente?", options: ["Xícara", "Chícara", "Xicara", "Chicára"], correct: 0, tempo: 20 },
{ tema: "Português", question: "Qual palavra está escrita corretamente?", options: ["Gelo", "Jelo", "Geilo", "Jeilo"], correct: 0, tempo: 20 },
{ tema: "Português", question: "Qual palavra está escrita corretamente?", options: ["Viagem", "Viajem", "Viajêm", "Viagém"], correct: 0, tempo: 20 },
{ tema: "Português", question: "Qual palavra está escrita corretamente?", options: ["Houveram muitos problemas.", "Houve muitos problemas.", "Houverão muitos problemas.", "Houveram problema."], correct: 1, tempo: 20 },
{ tema: "Português", question: "Qual frase apresenta uma comparação?", options: ["João correu para casa.", "Maria é rápida como um raio.", "Pedro chegou cedo.", "O cachorro dormiu."], correct: 1, tempo: 20 },
{ tema: "Português", question: "Qual figura de linguagem aparece em 'Estou morrendo de fome'?", options: ["Hipérbole", "Rima", "Onomatopeia", "Antítese"], correct: 0, tempo: 20 },
{ tema: "Português", question: "Qual figura de linguagem atribui características humanas a seres não humanos?", options: ["Metáfora", "Personificação", "Hipérbole", "Ironia"], correct: 1, tempo: 20 },
{ tema: "Português", question: "Na frase 'O tempo voa', qual figura de linguagem está presente?", options: ["Metáfora", "Onomatopeia", "Pleonasmo", "Rima"], correct: 0, tempo: 20 },

  // --- INGLÊS ---
  { tema: "Inglês", question: "Em inglês, qual é a tradução de 'Dog'?", options: ["Gato", "Cachorro", "Cavalo", "Pássaro"], correct: 1, tempo: 20 },
  { tema: "Inglês", question: "Em inglês, como se diz 'Obrigado'?", options: ["Please", "Sorry", "Thank you", "Hello"], correct: 2, tempo: 20 },
  { tema: "Inglês", question: "Em inglês, qual é a tradução de 'Book'?", options: ["Mesa", "Porta", "Livro", "Janela"], correct: 2, tempo: 20 },
  { tema: "Inglês", question: "Em inglês, como se diz 'Água'?", options: ["Milk", "Juice", "Water", "Coffee"], correct: 2, tempo: 20 },
  { tema: "Inglês", question: "Em inglês, qual é a tradução de 'Apple'?", options: ["Banana", "Laranja", "Maçã", "Uva"], correct: 2, tempo: 20 },
  { tema: "Inglês", question: "Em inglês, como se diz Bom dia'?", options: ["Good night", "Goodbye", "Good morning", "Good evening"], correct: 2, tempo: 20 },
  { tema: "Inglês", question: "Em inglês, qual é a tradução de 'Blue'?", options: ["Verde", "Vermelho", "Azul", "Amarelo"], correct: 2, tempo: 20 },
  { tema: "Inglês", question: "Em inglês, como se diz 'Escola'?", options: ["Hospital", "School", "Market", "Church"], correct: 1, tempo: 20 },
  { tema: "Inglês", question: "Em inglês, qual é a tradução de 'Chair'?", options: ["Mesa", "Janela", "Cadeira", "Porta"], correct: 2, tempo: 20 },
  { tema: "Inglês", question: "Em inglês, como se diz 'Gato'?", options: ["Dog", "Cat", "Bird", "Fish"], correct: 1, tempo: 20 },
  { tema: "Inglês", question: "Em inglês, Qual é a tradução de 'Car'?", options: ["Caminhão", "Avião", "Carro", "Barco"], correct: 2, tempo: 20 },
  { tema: "Inglês", question: "Em inglês, como se diz:'Amigo'?", options: ["Family", "Brother", "Friend", "Teacher"], correct: 2, tempo: 20 },
  { tema: "Inglês", question: "Em inglês, Qual é a tradução de 'Window'?", options: ["Telhado", "Porta", "Janela", "Parede"], correct: 2, tempo: 20 },
  { tema: "Inglês", question: "Em inglês, como se diz: 'Pai' em inglês?", options: ["Uncle", "Brother", "Father", "Grandfather"], correct: 2, tempo: 20 },
  { tema: "Inglês", question: "Em inglês, como se diz: 'Comida'?", options: ["Water", "Food", "Drink", "Bread"], correct: 1, tempo: 20 },
  { tema: "Inglês", question: "Em inglês, Qual é a tradução de 'Bird'?", options: ["Peixe", "Pássaro", "Coelho", "Cavalo"], correct: 1, tempo: 20 },
  { tema: "Inglês", question: "Em inglês, qual é a tradução de 'Teacher'?", options: ["Médico", "Professor", "Engenheiro", "Advogado"], correct: 1, tempo: 20 },
  { tema: "Inglês", question: "Em inglês, qual é a tradução de 'Happy'?", options: ["Triste", "Bravo", "Feliz", "Cansado"], correct: 2, tempo: 20 },
  { tema: "Inglês", question: "Em inglês, Qual é a tradução da frase 'What is your name'?", options: ["Onde você mora", "Quem é você", "Qual é o seu nome", "Como você está"], correct: 2, tempo: 20 },
  { tema: "Inglês", question: "Em inglês, Qual é a tradução da frase 'How old are you'?", options: ["Onde você está", "Qual é o seu nome", "Quantos anos você tem", "O que você faz"], correct: 2, tempo: 20 },
  { tema: "Inglês", question: "Em inglês, Qual é a tradução da frase 'Where do you live'?", options: ["Quem é você", "Quantos anos você tem", "Onde você mora", "O que você faz"], correct: 2, tempo: 20 },
  { tema: "Inglês", question: "Em inglês, Qual é a tradução da expressão 'What time is it'?", options: ["Onde você mora", "Quem é você", "Que horas são", "Como você está"], correct: 2, tempo: 20 },
  { tema: "Inglês", question: "Em inglês, qual é a tradução da expressão 'See you'?", options: ["Olá", "Obrigado", "Até logo", "Bom dia"], correct: 2, tempo: 20 },
  { tema: "Inglês", question: "Em inglês, qual é a tradução de 'What is this'?", options: ["Quem é você", "Onde você mora", "O que é isto", "Como você está"], correct: 2, tempo: 20 },
  { tema: "Inglês", question: "Em inglês, como se diz 'Mãe'?", options: ["Sister", "Mother", "Daughter", "Aunt"], correct: 1, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, qual é a tradução de 'House'?", options: ["Casa", "Escola", "Igreja", "Hospital"], correct: 0, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, como se diz 'Irmão'?", options: ["Father", "Brother", "Cousin", "Son"], correct: 1, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, qual é a tradução de 'Sun'?", options: ["Lua", "Estrela", "Sol", "Nuvem"], correct: 2, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, como se diz 'Lua'?", options: ["Moon", "Sun", "Star", "Sky"], correct: 0, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, qual é a tradução de 'Red'?", options: ["Azul", "Verde", "Vermelho", "Roxo"], correct: 2, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, qual é a tradução de 'Green'?", options: ["Amarelo", "Verde", "Preto", "Branco"], correct: 1, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, como se diz 'Preto'?", options: ["Black", "White", "Brown", "Gray"], correct: 0, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, como se diz 'Branco'?", options: ["Blue", "White", "Yellow", "Orange"], correct: 1, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, qual é a tradução de 'Yellow'?", options: ["Rosa", "Roxo", "Amarelo", "Marrom"], correct: 2, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, como se diz o número '10'?", options: ["Eight", "Nine", "Ten", "Twelve"], correct: 2, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, qual número significa 'Twenty'?", options: ["Doze", "Vinte", "Trinta", "Dez"], correct: 1, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, como se diz 'Segunda-feira'?", options: ["Sunday", "Monday", "Tuesday", "Friday"], correct: 1, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, qual é a tradução de 'Friday'?", options: ["Quinta-feira", "Sexta-feira", "Sábado", "Domingo"], correct: 1, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, como se diz 'Domingo'?", options: ["Saturday", "Sunday", "Monday", "Wednesday"], correct: 1, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, qual é a tradução de 'Morning'?", options: ["Noite", "Tarde", "Manhã", "Madrugada"], correct: 2, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, qual é a tradução de 'Night'?", options: ["Noite", "Manhã", "Tarde", "Dia"], correct: 0, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, como se diz 'Hoje'?", options: ["Tomorrow", "Yesterday", "Today", "Morning"], correct: 2, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, como se diz 'Amanhã'?", options: ["Today", "Yesterday", "Tomorrow", "Tonight"], correct: 2, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, qual é a tradução de 'Yesterday'?", options: ["Hoje", "Amanhã", "Ontem", "Agora"], correct: 2, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, como se diz 'Cachorro'?", options: ["Cat", "Dog", "Horse", "Cow"], correct: 1, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, qual é a tradução de 'Fish'?", options: ["Peixe", "Pássaro", "Rato", "Cobra"], correct: 0, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, como se diz 'Cavalo'?", options: ["Horse", "Sheep", "Cow", "Pig"], correct: 0, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, qual é a tradução de 'Elephant'?", options: ["Girafa", "Elefante", "Macaco", "Leão"], correct: 1, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, como se diz 'Leão'?", options: ["Tiger", "Lion", "Bear", "Wolf"], correct: 1, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, qual é a tradução de 'Eye'?", options: ["Boca", "Nariz", "Olho", "Orelha"], correct: 2, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, como se diz 'Boca'?", options: ["Mouth", "Nose", "Ear", "Hand"], correct: 0, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, qual é a tradução de 'Hand'?", options: ["Braço", "Mão", "Perna", "Pé"], correct: 1, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, como se diz 'Cabeça'?", options: ["Head", "Hair", "Face", "Neck"], correct: 0, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, qual é a tradução de 'Foot'?", options: ["Mão", "Braço", "Pé", "Perna"], correct: 2, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, qual é a tradução de 'Big'?", options: ["Pequeno", "Grande", "Alto", "Baixo"], correct: 1, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, qual é a tradução de 'Small'?", options: ["Grande", "Pequeno", "Rápido", "Forte"], correct: 1, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, como se diz 'Rápido'?", options: ["Slow", "Fast", "Strong", "Weak"], correct: 1, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, qual é a tradução de 'Beautiful'?", options: ["Bonito", "Feio", "Grande", "Pequeno"], correct: 0, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, como se diz 'Feliz'?", options: ["Sad", "Angry", "Happy", "Tired"], correct: 2, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, qual é a tradução de 'Sad'?", options: ["Feliz", "Triste", "Bravo", "Cansado"], correct: 1, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, como se diz 'Eu gosto de música'?", options: ["I play music", "I like music", "I hear music", "I make music"], correct: 1, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, qual é a tradução de 'I love you'?", options: ["Eu conheço você", "Eu gosto de você", "Eu amo você", "Eu vejo você"], correct: 2, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, qual é a tradução de 'I am hungry'?", options: ["Estou com sede", "Estou com fome", "Estou cansado", "Estou feliz"], correct: 1, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, qual é a tradução de 'I am thirsty'?", options: ["Estou com fome", "Estou com frio", "Estou com sede", "Estou com sono"], correct: 2, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, como se diz 'Eu não sei'?", options: ["I don't know", "I don't like", "I can't go", "I am fine"], correct: 0, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, qual é a tradução de 'Come here'?", options: ["Vá embora", "Venha aqui", "Sente-se", "Espere aqui"], correct: 1, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, qual é a tradução de 'Be careful'?", options: ["Tenha cuidado", "Venha rápido", "Fique quieto", "Boa sorte"], correct: 0, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, como se diz 'Boa sorte'?", options: ["Good job", "Good luck", "Good night", "Good idea"], correct: 1, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, qual é a tradução de 'Good job'?", options: ["Bom trabalho", "Boa noite", "Boa sorte", "Bom dia"], correct: 0, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, como se diz 'Desculpe'?", options: ["Please", "Sorry", "Thanks", "Welcome"], correct: 1, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, qual é a tradução de 'Please'?", options: ["Obrigado", "Desculpe", "Por favor", "Até logo"], correct: 2, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, qual é a tradução de 'You're welcome'?", options: ["Desculpe", "De nada", "Até amanhã", "Com licença"], correct: 1, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, como se pergunta 'Você fala inglês?'?", options: ["Do you speak English?", "Are you English?", "What is English?", "Where is English?"], correct: 0, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, qual é a tradução de 'How are you?'?", options: ["Qual é o seu nome?", "Onde você mora?", "Como você está?", "Quantos anos você tem?"], correct: 2, tempo: 20 },
{ tema: "Inglês", question: "Em inglês, qual resposta combina com 'How are you?'?", options: ["I'm fine, thanks", "My name is John", "I'm 15 years old", "I live in Brazil"], correct: 0, tempo: 20 },

  // --- BIOLOGIA ---
  { tema: "Biologia", question: "Qual organela celular é conhecida como a 'usina de energia' da célula?", options: ["Ribossomo", "Mitocôndria", "Núcleo", "Lisossomo"], correct: 1, tempo: 20 },
{ tema: "Biologia", question: "Qual é o processo pelo qual as plantas produzem seu próprio alimento?", options: ["Respiração", "Digestão", "Fotossíntese", "Fermentação"], correct: 2, tempo: 20 },
{ tema: "Biologia", question: "Qual gás as plantas absorvem principalmente durante a fotossíntese?", options: ["Oxigênio", "Nitrogênio", "Gás carbônico", "Hidrogênio"], correct: 2, tempo: 20 },
{ tema: "Biologia", question: "Qual é a molécula responsável por armazenar as informações genéticas dos seres vivos?", options: ["ATP", "DNA", "Glicose", "Água"], correct: 1, tempo: 20 },
{ tema: "Biologia", question: "Qual é a unidade básica que forma todos os seres vivos?", options: ["Tecido", "Órgão", "Célula", "Molécula"], correct: 2, tempo: 20 },
{ tema: "Biologia", question: "Qual animal é conhecido por conseguir mudar a cor da pele para se camuflar?", options: ["Golfinho", "Camaleão", "Pinguim", "Elefante"], correct: 1, tempo: 20 },
{ tema: "Biologia", question: "Qual é o maior animal conhecido do planeta?", options: ["Elefante-africano", "Tubarão-branco", "Baleia-azul", "Girafa"], correct: 2, tempo: 20 },
{ tema: "Biologia", question: "Qual animal possui três corações?", options: ["Polvo", "Cavalo", "Tartaruga", "Pinguim"], correct: 0, tempo: 20 },
{ tema: "Biologia", question: "Qual animal é conhecido por possuir uma das mordidas mais fortes entre os animais terrestres?", options: ["Leão", "Hipopótamo", "Cavalo", "Lobo"], correct: 1, tempo: 20 },
{ tema: "Biologia", question: "Qual é o único mamífero capaz de realizar um voo verdadeiro?", options: ["Esquilo-voador", "Morcego", "Macaco", "Gato"], correct: 1, tempo: 20 },
{ tema: "Biologia", question: "Qual grupo de animais possui penas?", options: ["Mamíferos", "Répteis", "Aves", "Anfíbios"], correct: 2, tempo: 20 },
{ tema: "Biologia", question: "Qual animal passa por uma transformação chamada metamorfose durante seu desenvolvimento?", options: ["Borboleta", "Cachorro", "Cavalo", "Elefante"], correct: 0, tempo: 20 },
{ tema: "Biologia", question: "Como são chamados os animais que possuem uma coluna vertebral?", options: ["Invertebrados", "Vertebrados", "Moluscos", "Artrópodes"], correct: 1, tempo: 20 },
{ tema: "Biologia", question: "Qual grupo de animais inclui sapos, rãs e salamandras?", options: ["Répteis", "Mamíferos", "Anfíbios", "Aves"], correct: 2, tempo: 20 },
{ tema: "Biologia", question: "Qual grupo de animais inclui cobras, lagartos e tartarugas?", options: ["Anfíbios", "Répteis", "Mamíferos", "Peixes"], correct: 1, tempo: 20 },
{ tema: "Biologia", question: "Qual é o maior órgão interno do corpo humano?", options: ["Coração", "Fígado", "Pulmão", "Rim"], correct: 1, tempo: 20 },
{ tema: "Biologia", question: "Qual parte do cérebro está principalmente relacionada ao equilíbrio e à coordenação dos movimentos?", options: ["Cerebelo", "Hipotálamo", "Medula espinhal", "Hipófise"], correct: 0, tempo: 20 },
{ tema: "Biologia", question: "Qual estrutura conecta o cérebro ao restante do corpo e transmite impulsos nervosos?", options: ["Fêmur", "Medula espinhal", "Esôfago", "Traqueia"], correct: 1, tempo: 20 },
{ tema: "Biologia", question: "Qual vitamina é produzida pelo organismo com a ajuda da luz solar?", options: ["Vitamina A", "Vitamina B12", "Vitamina C", "Vitamina D"], correct: 3, tempo: 20 },
{ tema: "Biologia", question: "Qual componente do sangue ajuda principalmente na coagulação?", options: ["Hemácias", "Plaquetas", "Plasma", "Neurônios"], correct: 1, tempo: 20 },
{ tema: "Biologia", question: "Qual tipo sanguíneo é conhecido como doador universal de hemácias?", options: ["AB positivo", "A positivo", "O negativo", "B negativo"], correct: 2, tempo: 20 },
{ tema: "Biologia", question: "Qual é o nome do processo de divisão celular que origina duas células geneticamente semelhantes?", options: ["Mitose", "Meiose", "Fotossíntese", "Digestão"], correct: 0, tempo: 20 },
{ tema: "Biologia", question: "Qual estrutura controla a entrada e saída de substâncias da célula?", options: ["Núcleo", "Membrana plasmática", "Ribossomo", "Cromossomo"], correct: 1, tempo: 20 },
{ tema: "Biologia", question: "Onde fica armazenada a maior parte do material genético de uma célula eucariótica?", options: ["Núcleo", "Citoplasma", "Membrana", "Ribossomo"], correct: 0, tempo: 20 },
{ tema: "Biologia", question: "Qual organela é responsável pela produção de proteínas?", options: ["Mitocôndria", "Ribossomo", "Lisossomo", "Vacúolo"], correct: 1, tempo: 20 },
{ tema: "Biologia", question: "Qual processo permite que uma planta perca água principalmente pelas folhas?", options: ["Transpiração", "Digestão", "Germinação", "Fecundação"], correct: 0, tempo: 20 },
{ tema: "Biologia", question: "Qual estrutura da planta absorve água e sais minerais do solo?", options: ["Flor", "Folha", "Raiz", "Fruto"], correct: 2, tempo: 20 },
{ tema: "Biologia", question: "Qual parte da planta geralmente é responsável pela produção de sementes?", options: ["Raiz", "Flor", "Caule", "Folha"], correct: 1, tempo: 20 },
{ tema: "Biologia", question: "Como são chamados os seres vivos que produzem seu próprio alimento?", options: ["Consumidores", "Decompositores", "Autótrofos", "Parasitas"], correct: 2, tempo: 20 },
{ tema: "Biologia", question: "Qual grupo de seres vivos é responsável por decompor restos de matéria orgânica?", options: ["Produtores", "Decompositores", "Herbívoros", "Predadores"], correct: 1, tempo: 20 },
{ tema: "Biologia", question: "Em uma cadeia alimentar, qual organismo geralmente ocupa o primeiro nível trófico?", options: ["Produtor", "Carnívoro", "Decompositor", "Consumidor secundário"], correct: 0, tempo: 20 },
{ tema: "Biologia", question: "Qual relação ecológica ocorre quando um organismo se beneficia e o outro é prejudicado?", options: ["Mutualismo", "Comensalismo", "Parasitismo", "Cooperação"], correct: 2, tempo: 20 },
{ tema: "Biologia", question: "Qual relação ecológica ocorre quando dois organismos de espécies diferentes se beneficiam?", options: ["Mutualismo", "Predação", "Parasitismo", "Competição"], correct: 0, tempo: 20 },
{ tema: "Biologia", question: "Qual é o nome dado à variedade de seres vivos existentes em uma determinada região?", options: ["Biodiversidade", "Fotossíntese", "Evolução", "Mutação"], correct: 0, tempo: 20 },
{ tema: "Biologia", question: "Qual processo explica a mudança das características das populações ao longo das gerações?", options: ["Digestão", "Evolução", "Respiração", "Circulação"], correct: 1, tempo: 20 },
{ tema: "Biologia", question: "Quem é conhecido por desenvolver a teoria da evolução por seleção natural?", options: ["Gregor Mendel", "Charles Darwin", "Louis Pasteur", "Isaac Newton"], correct: 1, tempo: 20 },
{ tema: "Biologia", question: "Qual cientista é conhecido por seus estudos sobre hereditariedade usando ervilhas?", options: ["Charles Darwin", "Gregor Mendel", "Robert Hooke", "Alexander Fleming"], correct: 1, tempo: 20 },
{ tema: "Biologia", question: "Qual estrutura presente nas células contém os genes?", options: ["Cromossomos", "Ribossomos", "Lisossomos", "Centríolos"], correct: 0, tempo: 20 },
{ tema: "Biologia", question: "Qual doença é causada pela deficiência de insulina ou pela dificuldade do organismo em utilizá-la adequadamente?", options: ["Diabetes", "Gripe", "Anemia", "Catapora"], correct: 0, tempo: 20 },
{ tema: "Biologia", question: "Qual é a principal função dos glóbulos brancos?", options: ["Transportar oxigênio", "Combater agentes infecciosos", "Coagular o sangue", "Transportar nutrientes"], correct: 1, tempo: 20 },
{ tema: "Biologia", question: "Qual microorganismo é utilizado na produção de pão e de algumas bebidas fermentadas?", options: ["Vírus", "Bactéria", "Levedura", "Protozoário"], correct: 2, tempo: 20 }
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

