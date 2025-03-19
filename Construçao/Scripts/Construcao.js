
// ==UserScript==
// @name         Gerenciador de Construção (Auto-Update)
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Carrega dinamicamente o script correto de construção baseado no ControleContrucao.js (JSON).
// @author       Nobre
// @match        https://*.tribalwars.com.br/*&screen=main
// @updateURL        https://raw.githubusercontent.com/Gazeleiro/projetoalbertenobre/refs/heads/main/Constru%C3%A7ao/Scripts/Construcao.js
// @downloadURL      https://raw.githubusercontent.com/Gazeleiro/projetoalbertenobre/refs/heads/main/Constru%C3%A7ao/Scripts/Construcao.js
// @grant        none
// ==/UserScript==

(async function() {
    console.log("🔄 Verificando script ativo...");

    // 🔹 URL do JSON de controle
    let controleURL = "https://dl.dropboxusercontent.com/scl/fi/rw23r7lei2kpgvvaj6yal/ControleContrucao.js?rlkey=gf6qv7aawc3wowqc2s8c46w69";

    // 🔹 Mapeamento dos scripts e seus links no Dropbox
    const scripts = {
        "Construcao Recursos.js": "https://dl.dropboxusercontent.com/scl/fi/1tup4y3wd9ewd6ezultlr/Construcao-Recursos.js?rlkey=lljaortify9tvdzu0bnubqzun",
        "Construcao Libera Coleta 4.js": "https://dl.dropboxusercontent.com/scl/fi/xa47n29b8oxq9pgsdckbf/Construcao-Libera-Coleta-4.js?rlkey=jr3p8xvten2t2l5t3gj3ke0gg",
        "Construcao Recursos + Mercado para pp.js": "https://dl.dropboxusercontent.com/scl/fi/nxgp97hcjwrz2v7oav620/Construcao-Recursos-Mercado-para-pp.js?rlkey=30pqryvvr2a4xj51c7mmxi7qa",
        "Construcaoautomatica.js": "https://dl.dropboxusercontent.com/scl/fi/958qqqjikqku4e2ciah9m/Construcaoautomatica.js?rlkey=hpneu0iwbvtc4tgiu3chpj33j",
        "Contrucao Depois Coleta 4.js": "https://dl.dropboxusercontent.com/scl/fi/v1c4zjupvrx522u9r8dyw/Contrucao-Depois-Coleta-4.js?rlkey=ohrhmjjmpl7m5anoracob6au6"
    };

    // 🔹 Obtém o mundo atual (br131, br132, etc.)
    let mundoAtual = window.location.href.match(/https:\/\/(\w+)\.tribalwars\.com\.br/);
    if (!mundoAtual || mundoAtual.length < 2) {
        console.error("❌ Não foi possível determinar o mundo do jogo.");
        return;
    }
    mundoAtual = mundoAtual[1];

    console.log(`🌍 Mundo detectado: ${mundoAtual}`);

    // 🔹 Obtém o JSON do ControleContrucao.js
    let scriptAtivo = "";
    try {
        let response = await fetch(controleURL);
        let controleJSON = await response.json(); // Agora tratamos como JSON
        scriptAtivo = controleJSON[mundoAtual]; // Pegamos o script correto para esse mundo
    } catch (error) {
        console.error("❌ Erro ao carregar ControleContrucao.js:", error);
        return;
    }

    if (!scriptAtivo || !(scriptAtivo in scripts)) {
        console.log("⚠️ Nenhum script válido encontrado para este mundo.");
        return;
    }

    console.log(`✅ Carregando script: ${scriptAtivo}`);

    // 🔹 Baixa e executa o script correto
    try {
        let scriptResponse = await fetch(scripts[scriptAtivo]);
        let scriptCode = await scriptResponse.text();
        eval(scriptCode);
    } catch (error) {
        console.error(`❌ Erro ao carregar ${scriptAtivo}:`, error);
    }

})();
