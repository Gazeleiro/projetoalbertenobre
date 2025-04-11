// ==UserScript==
// @name         Notificação Captcha albert
// @namespace    http://tampermonkey.net/
// @version      6.0
// @description  Sempre carrega a versão mais recente do script do Dropbox para notificações de CAPTCHA no Telegram.
// @author       Nobre
// @match        https://*.tribalwars.com.br/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/Gazeleiro/projetoalbertenobre/refs/heads/main/NotificaTelegranalbert.js
// @downloadURL  https://raw.githubusercontent.com/Gazeleiro/projetoalbertenobre/refs/heads/main/NotificaTelegranalbert.js
// ==/UserScript==
(function() {
    'use strict';

    let captchaAtivo = false;

    // Configurações do Telegram
    const BOT_TOKEN = '7362150939:AAHeetiLt3AJh0FMmp3auVULM0INJcNNDqA';
    const CHAT_ID = '-4782949650';

    
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

    let nomeJogador = "Desconhecido";
    let mundo = "Desconhecido";

    if (window.TribalWars?.getGameData()) {
        const data = window.TribalWars.getGameData();
        nomeJogador = data.player?.name || nomeJogador;
        mundo = data.world || mundo;
    }

    const horario = new Date().toLocaleString();
    const mensagem = `👤 CONTA: ${nomeJogador}\n🌍 Mundo: ${mundo}\n🕒 Horário: ${horario}`;

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(`${mensagemAlerta}\n\n${mensagem}`)}`;

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
    const gameData = window.TribalWars?.getGameData?.();
    const mundoAtual = gameData?.world || "";

    // Ignorar mundos que começam com "brp"
    if (mundoAtual.startsWith("brp")) {
        console.log("🚫 Mundo brp detectado. Ignorando coleta de bônus diário.");
        return;
    }

    const url = new URL(window.location.href);
    const estaNaPaginaBonus = url.searchParams.get("screen") === "info_player" && url.searchParams.get("mode") === "daily_bonus";
    const temBonusDiario = document.querySelector('a[href*="mode=daily_bonus"]');

    if (!temBonusDiario) {
        console.log("🚫 Mundo sem bônus diário. Ignorando...");
        return;
    }

    // Salva a URL atual antes de sair dela
    const urlOriginal = localStorage.getItem("urlOriginalAntesDoBonus") || window.location.href;

    if (estaNaPaginaBonus) {
        console.log("🎁 Coletando baús automaticamente...");

        function coletarProximoBau() {
            const botao = document.querySelector("#daily_bonus_content .btn.btn-default");
            if (botao) {
                console.log("👉 Clicando em baú...");
                botao.click();
                setTimeout(coletarProximoBau, 1200);
            } else {
                console.log("✅ Todos os baús coletados. Retornando à página original...");
                setUltimaColetaTimestamp();
                setTimeout(() => {
                    const voltarPara = localStorage.getItem("urlOriginalAntesDoBonus") || `/game.php?village=${getVillageId()}&screen=main`;
                    localStorage.removeItem("urlOriginalAntesDoBonus");
                    window.location.href = voltarPara;
                }, 1500);
            }
        }

        coletarProximoBau();

    } else if (precisaColetarBonusDiario()) {
        console.log("⏰ Hora de coletar bônus diário! Salvando URL e redirecionando...");
        localStorage.setItem("urlOriginalAntesDoBonus", window.location.href);
        const villageId = getVillageId();
        window.location.href = `/game.php?village=${villageId}&screen=info_player&mode=daily_bonus`;
    } else {
        console.log("🕒 Aguardando 24h para próxima coleta.");
    }
}


    function verificarOfertaPromocional() {
    const todosOfertas = document.querySelectorAll('.box-item.firstcell.nowrap a');

    const AGORA = Date.now();
    const SEIS_HORAS_EM_MS = 6 * 60 * 60 * 1000;
    const chaveUltimaNotificacao = "ultimaNotificacaoOferta";
    const ultimaNotificacao = Number(localStorage.getItem(chaveUltimaNotificacao) || 0);

    todosOfertas.forEach(oferta => {
        const texto = oferta.textContent || "";
        if (texto.includes("Oferta!") && (AGORA - ultimaNotificacao > SEIS_HORAS_EM_MS)) {
            const tempo = oferta.querySelector("span:last-child")?.innerText.trim() || "Tempo desconhecido";
            const mundo = window.TribalWars?.getGameData?.().world || "Mundo desconhecido";
            const nomeJogador = window.TribalWars?.getGameData?.().player?.name || "Desconhecido";
            const horario = new Date().toLocaleString();

            const mensagem = `🔥 OFERTA DETECTADA!\n🕒 Duração: ${tempo}`;
            enviarNotificacaoParaTelegram(mensagem);

            localStorage.setItem(chaveUltimaNotificacao, AGORA.toString());
        }
    });
}


setInterval(verificarOfertaPromocional, 3000); // A cada 1 HORA


    // Observador de alterações na página
    new MutationObserver(() => {
        verificarCaptcha();
        verificarExpiracaoPagina();
    }).observe(document.body, { childList: true, subtree: true });

    // Execução inicial
    verificarCaptcha();
    verificarExpiracaoPagina();
    iniciarColetaBonusDiario();

})();
