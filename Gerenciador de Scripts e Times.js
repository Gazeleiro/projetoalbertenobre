(function() {
    'use strict';

    // Criar janela de configurações
    function criarJanelaConfiguracao() {
        let divConfig = document.createElement("div");
        divConfig.id = "janelaConfiguracao";
        divConfig.style.position = "fixed";
        divConfig.style.top = "10%";
        divConfig.style.left = "50%";
        divConfig.style.transform = "translate(-50%, 0)";
        divConfig.style.background = "#f4e4bc";
        divConfig.style.border = "2px solid #a37b48";
        divConfig.style.padding = "15px";
        divConfig.style.zIndex = "10000";
        divConfig.style.fontSize = "14px";

        divConfig.innerHTML = `
            <h2 style="text-align:center;">Gerente de Scripts</h2>
            <button id="btnSalvarConfig" style="width:100%; background:#8B4513; color:white; padding:5px; border:none;">Salvar Configurações</button>
            <br><br>
            
            <label><input type="checkbox" id="ativarTroca" ${localStorage.getItem("ativarTroca") === "true" ? "checked" : ""}> Ativar Troca de Página</label>
            <br>
            <label>Tempo: 
                <select id="tempoTroca">
                    <option value="60000">1 Minuto</option>
                    <option value="120000">2 Minutos</option>
                    <option value="300000">5 Minutos</option>
                    <option value="600000">10 Minutos</option>
                </select>
            </label>
            <br>
            <button id="btnFecharConfig" style="margin-top:10px; width:100%;">Fechar</button>
        `;

        document.body.appendChild(divConfig);

        // Carregar configurações salvas
        document.getElementById("tempoTroca").value = localStorage.getItem("tempoTrocaPagina") || "60000";

        // Eventos dos botões
        document.getElementById("btnSalvarConfig").addEventListener("click", salvarConfiguracoes);
        document.getElementById("btnFecharConfig").addEventListener("click", () => {
            divConfig.style.display = "none";
        });
    }

    // Salvar configurações
    function salvarConfiguracoes() {
        localStorage.setItem("ativarTroca", document.getElementById("ativarTroca").checked);
        localStorage.setItem("tempoTrocaPagina", document.getElementById("tempoTroca").value);
        alert("Configurações Salvas!");
    }

    // Função para mudar página automaticamente
    function mudarPagina() {
        let ativarTroca = localStorage.getItem("ativarTroca") === "true";
        let intervalo = parseInt(localStorage.getItem("tempoTrocaPagina")) || 60000;

        if (ativarTroca) {
            setTimeout(() => {
                window.location.reload();
            }, intervalo);
        }
    }

    // Criar botão para abrir a janela de configuração
    let btnAbrirConfig = document.createElement("button");
    btnAbrirConfig.innerText = "Configurar";
    btnAbrirConfig.style.position = "fixed";
    btnAbrirConfig.style.top = "10px";
    btnAbrirConfig.style.right = "10px";
    btnAbrirConfig.style.background = "#8B4513";
    btnAbrirConfig.style.color = "white";
    btnAbrirConfig.style.padding = "5px";
    btnAbrirConfig.style.border = "none";
    btnAbrirConfig.style.zIndex = "10000";
    btnAbrirConfig.addEventListener("click", criarJanelaConfiguracao);

    document.body.appendChild(btnAbrirConfig);

    // Executar a troca de página se ativada
    mudarPagina();
})();