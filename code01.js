// ==UserScript==
// @name         Auto Reload 10M
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Script Master que carrega automaticamente as atualizações de scripts futuros diretamente do GitHub ou Dropbox.
// @author       Você
// @match        *://*/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/Gazeleiro/projetoalbertenobre/refs/heads/main/code01.js
// @downloadURL  https://raw.githubusercontent.com/Gazeleiro/projetoalbertenobre/refs/heads/main/code01.js
// ==/UserScript==
(function() {
    'use strict';

    setTimeout(() => {
        location.reload();
    }, 600000); // 600000 ms = 10 minutos
})();
