// ==UserScript==
// @name         Notificação Captcha Telegram
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Sempre carrega a versão mais recente do script do Dropbox para notificações de CAPTCHA no Telegram.
// @author       Nobre
// @match        https://*.tribalwars.com.br/*
// @grant        none
// @require      https://raw.githubusercontent.com/Gazeleiro/Tribalwars/refs/heads/main/Notifica%C3%A7ao%20Capcha%20Telegran%20Nobre.js?token=GHSAT0AAAAAADAX2JILRLXKU73HR4RAJY2MZ6Z6NFQ
// @updateURL    https://raw.githubusercontent.com/Gazeleiro/Tribalwars/refs/heads/main/Notifica%C3%A7ao%20Capcha%20Telegran%20Nobre.js?token=GHSAT0AAAAAADAX2JILRLXKU73HR4RAJY2MZ6Z6NFQ
// @downloadURL  https://raw.githubusercontent.com/Gazeleiro/Tribalwars/refs/heads/main/Notifica%C3%A7ao%20Capcha%20Telegran%20Nobre.js?token=GHSAT0AAAAAADAX2JILRLXKU73HR4RAJY2MZ6Z6NFQ
// ==/UserScript==

(function() {
    'use strict';

    let captchaAtivo = false;
    let paginaExpirada = false;

    // Configurações do Telegram
    const BOT_TOKEN = '7362150939:AAHeetiLt3AJh0FMmp3auVULM0INJcNNDqA';
    const CHAT_ID = '-4736602903';

    function verificarCaptcha() {
        console.log("🔎 Verificando a presença do CAPTCHA...");

        let captchaPresente = document.body.innerHTML.toLowerCase().includes("proteção contra bots") ||
                              document.querySelector('[id*="bot-protection"]') ||
                              document.querySelector('[class*="bot-protection-row"]');

        if (captchaPresente && !captchaAtivo) {
            captchaAtivo = true;
            console.log("🚨 CAPTCHA detectado! Chamando atenção...");
            piscarTitulo("⚠ CAPTCHA DETECTADO! ⚠");
            tocarSom();
            enviarNotificacaoParaTelegram("⚠ CAPTCHA DETECTADO! ⚠");
            setTimeout(() => alert("⚠ CAPTCHA DETECTADO! Resolva para continuar."), 1000);
        }
    }

    function verificarExpiracaoPagina() {
        console.log("🔎 Verificando erro de expiração...");

        let paginaExpirou = document.body.innerText.includes("Esta página não está funcionando") &&
                            document.body.innerText.includes("HTTP ERROR 407");

        if (paginaExpirou && !paginaExpirada) {
            paginaExpirada = true;
            console.log("❌ Página expirada detectada! Enviando alerta...");
            piscarTitulo("❌ PÁGINA EXPIRADA! ❌");
            tocarSom();
            enviarNotificacaoParaTelegram("❌ PÁGINA EXPIRADA! ❌");
            setTimeout(() => alert("❌ PÁGINA EXPIRADA! Atualize a página."), 1000);
        }
    }

    function piscarTitulo(mensagem) {
        let originalTitle = document.title;
        let visivel = true;

        setInterval(() => {
            document.title = visivel ? mensagem : originalTitle;
            visivel = !visivel;
        }, 1000);
    }

    function tocarSom() {
        let beep = new Audio("https://www.soundjay.com/button/beep-07.wav");
        beep.loop = false;
        beep.play().catch(e => console.log("🔇 Falha ao tocar som:", e));
    }

    function enviarNotificacaoParaTelegram(mensagemAlerta) {
        console.log("📤 Enviando notificação para Telegram...");

        const jogador = window.TribalWars?.getGameData()?.player || { name: "Desconhecido", id: "N/A" };
        const nomeJogador = jogador.name;
        const idJogador = jogador.id;
        const horarioNotificacao = new Date().toLocaleString();

        const titulo = mensagemAlerta;
        const mensagem = `${mensagemAlerta}\n👤 CONTA: ${nomeJogador} (ID: ${idJogador})\n🕒 Horário: ${horarioNotificacao}`;

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
    new MutationObserver(() => {
        verificarCaptcha();
        verificarExpiracaoPagina();
    }).observe(document.body, { childList: true, subtree: true });

    // Verifica CAPTCHA e erro de expiração assim que o script carregar
    verificarCaptcha();
    verificarExpiracaoPagina();

})();
