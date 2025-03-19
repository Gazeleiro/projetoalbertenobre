// ==UserScript==
// @name         Notificação Captcha Telegram
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Sempre carrega a versão mais recente do script do Dropbox para notificações de CAPTCHA no Telegram.
// @author       Nobre
// @match        https://*.tribalwars.com.br/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/Gazeleiro/projetoalbertenobre/refs/heads/main/NotificaTelegran.js
// @downloadURL  https://raw.githubusercontent.com/Gazeleiro/projetoalbertenobre/refs/heads/main/NotificaTelegran.js
// ==/UserScript==
(function() {
    'use strict';

    let captchaAtivo = false;

    // Configurações do Telegram
    const BOT_TOKEN = '7362150939:AAHeetiLt3AJh0FMmp3auVULM0INJcNNDqA';
    const CHAT_ID = '-4782949650';

    function verificarCaptcha() {
        console.log("🔎 Verificando a presença do CAPTCHA...");

        // Verifica se há referência ao CAPTCHA (Proteção contra Bots)
        let captchaPresente = document.body.innerHTML.toLowerCase().includes("proteção contra bots") ||
                              document.querySelector('[id*="bot-protection"]') ||
                              document.querySelector('[class*="bot-protection-row"]');

        if (captchaPresente && !captchaAtivo) {
            captchaAtivo = true;
            console.log("🚨 CAPTCHA detectado! Chamando atenção...");
            piscarTitulo();
            tocarSom();
            enviarNotificacaoParaTelegram();
            setTimeout(() => alert("⚠ CAPTCHA DETECTADO! Resolva para continuar."), 1000);
        }
    }

    function piscarTitulo() {
        let originalTitle = document.title;
        let alerta = "⚠ CAPTCHA DETECTADO! ⚠";
        let visivel = true;

        setInterval(() => {
            document.title = visivel ? alerta : originalTitle;
            visivel = !visivel;
        }, 1000);
    }

    function tocarSom() {
        let beep = new Audio("https://www.soundjay.com/button/beep-07.wav");
        beep.loop = false;
        beep.play().catch(e => console.log("🔇 Falha ao tocar som:", e));
    }

    function enviarNotificacaoParaTelegram() {
        console.log("📤 Enviando notificação para Telegram...");

        // Pegando dados do jogo
        const jogador = window.TribalWars?.getGameData()?.player || { name: "Desconhecido", id: "N/A" };
        const nomeJogador = jogador.name;
        const idJogador = jogador.id;
        const horarioNotificacao = new Date().toLocaleString();
        const urlPagina = window.location.href; // URL da página

        // Extrair o prefixo do mundo da URL
        const mundoMatch = urlPagina.match(/https:\/\/(br\d+)\.tribalwars\.com\.br/);
        const mundo = mundoMatch ? mundoMatch[1] : 'Desconhecido';

        const titulo = "🚨 CAPTCHA Ativo no Tribal Wars! 🚨";
        const mensagem = `⚠️ **Atenção!**\n\n🔹 **Verificação de bot detectada!**\n\n👤 **Jogador:** ${nomeJogador} (ID: ${idJogador})\n🌍 **Mundo:** ${mundo}\n🕒 **Horário:** ${horarioNotificacao}\n🔗 **URL da Página:** ${urlPagina}`;

        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(`${titulo}\n\n${mensagem}`)}`;

        fetch(url)
            .then(response => {
                if (response.ok) {
                    console.log("✅ Notificação enviada para o Telegram!");
                } else {
                    console.error("❌ Falha ao enviar a notificação para o Telegram.");
                }
            })
            .catch(error => {
                console.error("❌ Erro ao enviar notificação para o Telegram:", error);
            });
    }

    // Observador para detectar mudanças na página
    new MutationObserver(() => verificarCaptcha())
        .observe(document.body, { childList: true, subtree: true });

    // Verifica CAPTCHA assim que o script carregar
    verificarCaptcha();

})();
