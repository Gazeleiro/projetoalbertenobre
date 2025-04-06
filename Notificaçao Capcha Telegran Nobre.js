// ==UserScript==
// @name         Notificação Captcha Telegram + Pagina Inicial
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Sempre carrega a versão mais recente do script do Dropbox para notificações de CAPTCHA no Telegram.
// @author       Nobre
// @match        https://*.tribalwars.com.br/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/Gazeleiro/projetoalbertenobre/refs/heads/main/Notifica%C3%A7ao%20Capcha%20Telegran%20Nobre.js
// @downloadURL  https://raw.githubusercontent.com/Gazeleiro/projetoalbertenobre/refs/heads/main/Notifica%C3%A7ao%20Capcha%20Telegran%20Nobre.js
// ==/UserScript==

(function () {
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
            enviarNotificacaoParaTelegram("⚠ CAPTCHA DETECTADO! ⚠");
            setTimeout(() => alert("⚠ CAPTCHA DETECTADO! Resolva para continuar."), 1000);
        }
    }

    function verificarExpiracaoPagina() {
        console.log("🔎 Verificando erro de expiração...");

        let textoPagina = document.body.innerText.toLowerCase();

        let paginaExpirou = textoPagina.includes("não é possível acessar esse site") ||
            textoPagina.includes("err_connection_closed") ||
            textoPagina.includes("encerrou a conexão inesperadamente") ||
            textoPagina.includes("verificar a conexão") ||
            textoPagina.includes("verificar o proxy e o firewall");

        if (paginaExpirou && !paginaExpirada) {
            paginaExpirada = true;
            console.log("❌ Página expirada detectada! Enviando alerta...");
            enviarNotificacaoParaTelegram("❌ PÁGINA EXPIRADA! ❌");
            setTimeout(() => alert("❌ PÁGINA EXPIRADA! Atualize a página."), 1000);
        }
    }

    // 🔔 Envia notificação para o Telegram
    function enviarNotificacaoParaTelegram(mensagemAlerta) {
        console.log("📤 Enviando notificação para Telegram...");

        const jogador = window.TribalWars?.getGameData()?.player || { name: "Desconhecido", id: "N/A" };
        const nomeJogador = jogador.name;
        const idJogador = jogador.id;
        const horarioNotificacao = new Date().toLocaleString();

        const titulo = mensagemAlerta;
        const mensagem = `👤 CONTA: ${nomeJogador} \n🕒 Horário: ${horarioNotificacao}`;

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

    // Verifica CAPTCHA e erro de expiração ao carregar
    verificarCaptcha();
    verificarExpiracaoPagina();

    // Verificação da permanência na página inicial
    let tempoNaPaginaInicial = null;
    const INTERVALO_VERIFICACAO = 10000; // 10 segundos
    const TEMPO_MINIMO_EM_MS = 5 * 60 * 1000; // 5 minutos

    function verificarPermanenciaNaPaginaInicial() {
        const urlAtual = window.location.href;

        if (urlAtual === "https://www.tribalwars.com.br/") {
            if (!tempoNaPaginaInicial) {
                tempoNaPaginaInicial = Date.now(); // Começa a contar o tempo
                console.log("🕒 Página inicial detectada. Aguardando 5 minutos antes de notificar...");
            } else if (Date.now() - tempoNaPaginaInicial >= TEMPO_MINIMO_EM_MS) {
                console.log("⏰ Permanência de 5 minutos na página inicial detectada. Notificando...");
                enviarNotificacaoParaTelegram("⚠ CONTA ESTÁ NA PÁGINA INICIAL HÁ 5 MINUTOS ⚠");
                tempoNaPaginaInicial = null; // Reseta para evitar spam
            }
        } else {
            tempoNaPaginaInicial = null; // Saiu da página inicial, reseta o contador
        }
    }

    setInterval(verificarPermanenciaNaPaginaInicial, INTERVALO_VERIFICACAO);

})();
