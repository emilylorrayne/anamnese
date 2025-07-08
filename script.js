// Armazena as respostas do usuário
let repostaFormulario = {
  objetivo: '', sexo: '', idade: '', altura: '', peso: '', atividade: '', trabalho: '',
  doenca: [], cirurgia: [], medicamento: [], alergia: [], preferencia: [],
  doenca_neg: false, cirurgia_neg: false, medicamento_neg: false, alergia_neg: false,
  refeicao_principal: '', refeicoes: 3, comer_fora: '', comp_alimentar: '',
  dieta: '', sono: 7, dif_sono: '', alcool: "", frequencia_alcool: "", cafeina: "", bem_estar: ''
};

// Exibe apenas a tela do passo atual
function exibeTela(num) {
  for (let i = 1; i <= 16; i++) {
    const t = document.getElementById('tela' + i);
    if (t) t.style.display = 'none';
  }
  document.getElementById('tela' + num).style.display = 'flex';
}

function selectOption(tipo, valor, el) {
  repostaFormulario[tipo] = valor;
  // Marca visualmente a opção escolhida nas telas de botões
  let screen = document.querySelector('.wizard-screen[style*="display: flex"]');
  if (screen.querySelectorAll('.option-btn').length > 0) {
    screen.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('selected'));
    let idx = {
      ganhar_peso: 0, perder_peso: 1, manter_peso: 2, ganhar_massa: 3, feminino: 0, masculino: 1,
      pouco: 0, leve: 1, moderada: 2, intensa: 3, livre: 0, '40h': 1, turnos: 2,
      classica: 0, pescetariana: 1, vegetariana: 2, vegana: 3, estresse: 0, ansiedade: 1, depressao: 2, bem: 3
    }[valor];
    if (idx !== undefined) screen.querySelectorAll('.option-btn')[idx].classList.add('selected');
  }
  if (screen.querySelectorAll('.main-meal-option').length > 0 && el) {
    screen.querySelectorAll('.main-meal-option').forEach(opt => opt.classList.remove('selected'));
    el.classList.add('selected');
  }
}

function nextTela(num) {
  // Valida objetivo na tela 1
  if (num === 2 && !repostaFormulario.objetivo) { alert('Escolha seu objetivo.'); return; }
  // Valida sexo na tela 2
  if (num === 3 && !repostaFormulario.sexo) { alert('Escolha seu sexo.'); return; }
  // Valida idade na tela 3
  if (num === 4) {
    const val = document.getElementById('idade').value.trim();
    if (!val.match(/^\d{2}\/\d{2}\/\d{4}$/)) { alert('Digite uma data no formato DD/MM/AAAA.'); return; }

    // (Opcional) validar se a data é válida no calendário
    const partes = val.split('/');
    const dataObj = new Date(`${partes[2]}-${partes[1]}-${partes[0]}`);
    if (isNaN(dataObj)) {
      alert('Data inválida. Verifique o dia, mês e ano.');
      return;
    }

    // Armazena no repostaFormulario
    repostaFormulario.idade = val;
  }
  // Valida altura na tela 4
  if (num === 5) {
    const val = document.getElementById('altura').value.trim();
    if (!val || val < 40 || val > 272) { alert('Preencha uma altura válida (40 a 272 cm).'); return; }
    repostaFormulario.altura = val;
  }
  // Valida peso na tela 5
  if (num === 6) {
    const val = document.getElementById('peso').value.trim();
    if (!val || val < 1 || val > 595) { alert('Preencha um peso válido (1 a 595 kg).'); return; }
    repostaFormulario.peso = val;
  }
  // Valida atividade na tela 6
  if (num === 7 && !repostaFormulario.atividade) { alert('Selecione seu nível de atividade.'); return; }
  // Valida trabalho na tela 7
  if (num === 8 && !repostaFormulario.trabalho) { alert('Selecione seu horário de trabalho.'); return; }
  exibeTela(num);
}

function voltarTela(num) { exibeTela(num); }

// Listas múltiplas (doenças, cirurgias, medicamentos, alergias, preferências)
const multiData = {
  doenca: [], cirurgia: [], medicamento: [], alergia: [], preferencia: []
};

function addMultiItem(tipo) {
  const input = document.getElementById(tipo + 'Input');
  const val = input.value.trim();
  if (val && !multiData[tipo].includes(val)) {
    multiData[tipo].push(val);
    repostaFormulario[tipo + "_neg"] = false;
    renderMultiList(tipo);
    input.value = '';
    input.focus();
  }
  repostaFormulario[tipo] = multiData[tipo];
}

function removeMultiItem(tipo, idx) {
  multiData[tipo].splice(idx, 1);
  renderMultiList(tipo);
  repostaFormulario[tipo] = multiData[tipo];
}

function renderMultiList(tipo) {
  const ul = document.getElementById(tipo + 'List');
  ul.innerHTML = '';
  multiData[tipo].forEach((item, idx) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${item}</span>
      <button type="button" onclick="removeMultiItem('${tipo}',${idx})">Remover</button>`;
    ul.appendChild(li);
  });
}

function countChange(tipo, delta) {
  let min = tipo === 'refeicoes' ? 1 : 3, max = tipo === 'refeicoes' ? 10 : 15;
  let el = document.getElementById(tipo === 'refeicoes' ? 'refeicoesCount' : 'sonoCount');
  let val = parseInt(el.innerText) + delta;
  if (val < min) val = min;
  if (val > max) val = max;
  el.innerText = val;
  repostaFormulario[tipo] = val;
}

// Tela 14: Álcool - Mostra/oculta frequência
function alteraAlcool(valor) {
  let freq = document.getElementById('alcool_frequencia');
  repostaFormulario.alcool = valor;
  if (valor === "sim") {
    freq.style.display = "block";
  } else {
    freq.style.display = "none";
    repostaFormulario.frequencia_alcool = "";
    document.querySelectorAll('input[name="frequencia_alcool"]').forEach(r => r.checked = false);
  }
}

function alteraFreqAlcool(valor) {
  repostaFormulario.frequencia_alcool = valor;
}
function alteraCafeina(valor) {
  repostaFormulario.cafeina = valor;
}

// FUNÇÃO DE ENVIO PARA O PHP
function enviarAnamnese() {
  console.log("Conteúdo de repostaFormulario antes de enviar:", repostaFormulario); // Adicione esta linha AQUI
  console.log("Função enviarAnamnese() foi chamada!"); // Adicione esta linha
  const dados = {
    objetivo: repostaFormulario.objetivo,
    sexo: repostaFormulario.sexo,
    data_nascimento: repostaFormulario.idade,
    altura: repostaFormulario.altura,
    peso: repostaFormulario.peso,
    atividade: repostaFormulario.atividade,
    trabalho: repostaFormulario.trabalho,
    doenca: repostaFormulario.doenca || [],      // CORRIGIDO de 'doencas' para 'doenca'
    cirurgia: repostaFormulario.cirurgia || [],    // CORRIGIDO de 'cirurgias' para 'cirurgia'
    medicamento: repostaFormulario.medicamento || [], // CORRIGIDO de 'medicamentos' para 'medicamento'
    alergia: repostaFormulario.alergia || [],    // CORRIGIDO de 'alergias' para 'alergia'
    preferencia: repostaFormulario.preferencia || [], // CORRIGIDO de 'preferencias' para 'preferencia'
    refeicao_principal: repostaFormulario.refeicao_principal,
    refeicoes: repostaFormulario.refeicoes,
    comer_fora: repostaFormulario.comer_fora,
    comp_alimentar: repostaFormulario.comp_alimentar,
    dieta: repostaFormulario.dieta,
    sono: repostaFormulario.sono,
    dif_sono: repostaFormulario.dif_sono,
    alcool: repostaFormulario.alcool,
    frequencia_alcool: repostaFormulario.frequencia_alcool,
    cafeina: repostaFormulario.cafeina,
    bem_estar: repostaFormulario.bem_estar
  };
  console.log("JSON enviado:", JSON.stringify(dados, null, 2));

  fetch('salvar_anamnese.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  })
    .then(r => r.text())
    .then(msg => {
      alert(msg);
      nextTela(16);
    })
    .catch(err => alert("Erro: " + err));
}

document.addEventListener("DOMContentLoaded", function () {
  // Máscara no campo de data
  const input = document.getElementById('idade');
  input.addEventListener('input', function (e) {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 8) v = v.slice(0, 8);

    let result = '';
    if (v.length >= 1) result += v.substring(0, 2);
    if (v.length >= 3) result += '/' + v.substring(2, 4);
    if (v.length >= 5) result += '/' + v.substring(4, 8);

    e.target.value = result;
  });

  // Inicializa contadores
  document.getElementById('refeicoesCount').innerText = repostaFormulario.refeicoes;
  document.getElementById('sonoCount').innerText = repostaFormulario.sono;
});

// Inicializa os contadores padrão ao carregar a página
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById('refeicoesCount').innerText = repostaFormulario.refeicoes;
  document.getElementById('sonoCount').innerText = repostaFormulario.sono;
  exibeTela(1);
});

