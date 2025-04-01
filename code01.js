// ==UserScript==
// @name         Auto Reload 10M
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Script Master que carrega automaticamente as atualizações de scripts futuros diretamente do GitHub ou Dropbox.
// @author       Você
// @match        https://*.tribalwars.com.br/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/Gazeleiro/projetoalbertenobre/refs/heads/main/code01.js
// @downloadURL  https://raw.githubusercontent.com/Gazeleiro/projetoalbertenobre/refs/heads/main/code01.js
// ==/UserScript==
(function() {
    'use strict';

    // Simular rolagem a cada 5 minutos
    setInterval(() => {
        window.scrollBy(0, 1);  // Rola a página para baixo
    }, 300000); // 300000 ms = 5 minutos
})();
