// ==UserScript==
// @name         Notificação Captcha Telegram
// @namespace    http://tampermonkey.net/
// @version      2.0
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

    // Telegram config
    const BOT_TOKEN = '7362150939:AAHeetiLt3AJh0FMmp3auVULM0INJcNNDqA';
    const CHAT_ID = '-4736602903';

    function verificarCaptcha() {
        console.log("🔎 Verificando CAPTCHA...");

        let captchaPresente = document.body.innerHTML.toLowerCase().includes("proteção contra bots") ||
            document.querySelector('[id*="bot-protection"]') ||
            document.querySelector('[class*="bot-protection-row"]');

        if (captchaPresente && !captchaAtivo) {
            captchaAtivo = true;
            console.log("🚨 CAPTCHA detectado!");
            enviarNotificacaoParaTelegram("⚠ CAPTCHA DETECTADO! ⚠");
            setTimeout(() => alert("⚠ CAPTCHA DETECTADO! Resolva para continuar."), 1000);
        }
    }

    function verificarExpiracaoPagina() {
        console.log("🔎 Verificando expiração...");

        let textoPagina = document.body.innerText.toLowerCase();

        let paginaExpirou = textoPagina.includes("não é possível acessar esse site") ||
            textoPagina.includes("err_connection_closed") ||
            textoPagina.includes("encerrou a conexão inesperadamente") ||
            textoPagina.includes("verificar a conexão") ||
            textoPagina.includes("verificar o proxy e o firewall");

        if (paginaExpirou && !paginaExpirada) {
            paginaExpirada = true;
            console.log("❌ Página expirada!");
            enviarNotificacaoParaTelegram("❌ PÁGINA EXPIRADA! ❌");
            setTimeout(() => alert("❌ Página expirada! Atualize a página."), 1000);
        }
    }

    function enviarNotificacaoParaTelegram(mensagemAlerta) {
        console.log("📤 Enviando para Telegram...");

        const jogador = window.TribalWars?.getGameData()?.player || { name: "Desconhecido", id: "N/A" };
        const nomeJogador = jogador.name;
        const idJogador = jogador.id;
        const horario = new Date().toLocaleString();

        const titulo = mensagemAlerta;
        const mensagem = `👤 CONTA: ${nomeJogador}\n🕒 Horário: ${horario}`;

        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(`${titulo}\n\n${mensagem}`)}`;

        fetch(url)
            .then(response => {
                if (response.ok) {
                    console.log("✅ Notificação enviada.");
                } else {
                    console.error("❌ Falha ao enviar notificação.");
                }
            })
            .catch(error => {
                console.error("❌ Erro ao enviar para Telegram:", error);
            });
    }

    // Página inicial: alerta após 5 minutos
    let tempoNaPaginaInicial = null;
    const INTERVALO_VERIFICACAO = 10000;
    const TEMPO_MINIMO_EM_MS = 5 * 60 * 1000;

    function verificarPermanenciaNaPaginaInicial() {
        const urlAtual = window.location.href;

        if (urlAtual === "https://www.tribalwars.com.br/") {
            if (!tempoNaPaginaInicial) {
                tempoNaPaginaInicial = Date.now();
                console.log("🕒 Página inicial detectada. Contando 5 minutos...");
            } else if (Date.now() - tempoNaPaginaInicial >= TEMPO_MINIMO_EM_MS) {
                console.log("⏰ Página inicial por 5 min. Enviando notificação...");
                enviarNotificacaoParaTelegram("⚠ CONTA ESTÁ NA PÁGINA INICIAL HÁ 5 MINUTOS ⚠");
                tempoNaPaginaInicial = null;
            }
        } else {
            tempoNaPaginaInicial = null;
        }
    }

    setInterval(verificarPermanenciaNaPaginaInicial, INTERVALO_VERIFICACAO);

    // Coleta de bônus diário automática
    function getUltimaColetaTimestamp() {
        return Number(localStorage.getItem("ultimaColetaBonusDiario") || 0);
    }

    function setUltimaColetaTimestamp() {
        localStorage.setItem("ultimaColetaBonusDiario", Date.now());
    }

    function precisaColetarBonusDiario() {
        const agora = Date.now();
        const ultimaColeta = getUltimaColetaTimestamp();
        const INTERVALO_24H = 24 * 60 * 60 * 1000;
        return agora - ultimaColeta >= INTERVALO_24H;
    }

    function getVillageId() {
        const url = new URL(window.location.href);
        return url.searchParams.get("village") || "0";
    }

    function iniciarColetaBonusDiario() {
        const url = new URL(window.location.href);
        const estaNoBonus = url.searchParams.get("screen") === "info_player" && url.searchParams.get("mode") === "daily_bonus";

        if (estaNoBonus) {
            const botoes = document.querySelectorAll("#daily_bonus_content .btn.btn-default");
            if (botoes.length > 0) {
                console.log(`🎁 Coletando ${botoes.length} baús...`);
                botoes.forEach((btn, i) => {
                    setTimeout(() => btn.click(), i * 1000);
                });
                setTimeout(() => {
                    setUltimaColetaTimestamp();
                    window.location.href = `/game.php?village=${getVillageId()}&screen=main`;
                }, (botoes.length + 1) * 1000);
            } else {
                console.log("🎉 Nenhum baú disponível.");
                setUltimaColetaTimestamp();
                window.location.href = `/game.php?village=${getVillageId()}&screen=main`;
            }
        } else if (precisaColetarBonusDiario()) {
            console.log("⏰ Indo coletar bônus diário...");
            window.location.href = `/game.php?village=${getVillageId()}&screen=info_player&mode=daily_bonus`;
        } else {
            console.log("⏳ Coleta recente. Aguardando 24h...");
        }
    }

    // Observador de mudanças
    new MutationObserver(() => {
        verificarCaptcha();
        verificarExpiracaoPagina();
    }).observe(document.body, { childList: true, subtree: true });

    // Execução inicial
    verificarCaptcha();
    verificarExpiracaoPagina();
    iniciarColetaBonusDiario();

})();
