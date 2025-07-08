<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

// Conexão
$host = '160.20.22.99';
$user = 'aluno40';
$pass = 'a2sfHZc0FW0=';
$dbname = 'fasiclin';
$port = 3360;
$conn = new mysqli($host, $user, $pass, $dbname, $port);
if ($conn->connect_error) {
    die("❌ Erro na conexão: " . $conn->connect_error);
}

// Receber dados do frontend
$dadosJson = file_get_contents('php://input');
$dados = json_decode($dadosJson, true);

if (!$dados) {
    http_response_code(400);
    die("❌ JSON inválido: " . $dadosJson);
}


// IDs fixos
$idPaciente = 52;
$idProfissional = 57;
$autvisib = 1;
$statusfunc = 1;

// Inserir anamnese
$stmt = $conn->prepare("INSERT INTO ANAMNESE (ID_PACIENTE, ID_PROFISSIO, DATAANAM, AUTVISIB, STATUSFUNC) VALUES (?, ?, NOW(), ?, ?)");
$stmt->bind_param("iiii", $idPaciente, $idProfissional, $autvisib, $statusfunc);

if (!$stmt->execute()) {
    http_response_code(500);
    die("❌ Erro ao registrar ANAMNESE: " . $stmt->error);
}
$idAnamnese = $stmt->insert_id;
$stmt->close();


// Mapeamento HTML => IDPERGUNTA
$mapaPerguntas = [
    'objetivo' => 6, 'sexo' => 7, 'data_nascimento' => 8, 'altura' => 9,
    'peso' => 10, 'atividade' => 11, 'trabalho' => 12, 'doenca' => 13,
    'cirurgia' => 14, 'medicamento' => 15, 'alergia' => 16, 'preferencia' => 17,
    'refeicao_principal' => 18, 'refeicoes' => 19, 'comer_fora' => 20, 'comp_alimentar' => 21,
    'dieta' => 22, 'sono' => 23, 'dif_sono' => 24, 'alcool' => 25,
    'frequencia_alcool' => 26, 'cafeina' => 27, 'bem_estar' => 28
];

// Inserir respostas da anamnese
$stmtResp = $conn->prepare("INSERT INTO RESPOSTA (ID_PERGUNTA, ID_ANAMNESE, RESPSUBJET) VALUES (?, ?, ?)");
foreach ($mapaPerguntas as $campo => $idPergunta) {
    if (!isset($dados[$campo])) continue;
    $valor = is_array($dados[$campo]) ? implode(", ", $dados[$campo]) : $dados[$campo];
    $stmtResp->bind_param("iis", $idPergunta, $idAnamnese, $valor);
    $stmtResp->execute();
}
$stmtResp->close();
$conn->close();

echo "✅ Anamnese salva com sucesso! ID: $idAnamnese";
?>
