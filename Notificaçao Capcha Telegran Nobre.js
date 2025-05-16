// ==UserScript==
// @name         Notificação Tribal Wars Avançada
// @namespace    http://tampermonkey.net/
// @version      8.4
// @description  Notifica CAPTCHA, promoções e páginas expiradas em grupos diferentes, com anti-spam e coleta segura de bônus diário.
// @author       Nobre
// @match        https://*.tribalwars.com.br/*
// @grant        none
// ==/UserScript==
(function () {
    'use strict';

    // Telegram
    const BOT_TOKEN = '7362150939:AAHeetiLt3AJh0FMmp3auVULM0INJcNNDqA';
    const CHAT_ID_CAPTCHA   = '-4747519721';
    const CHAT_ID_PROMOCAO  = '-4847613379';
    const CHAT_ID_EXPIRACAO = '-4820917790';

    // Controle de spam
    let ultimaNotificacaoCaptcha = 0;
    let ultimaNotificacaoExpiracao = 0;
    const INTERVALO_CAPTCHA_MS = 1 * 30 * 1000;
    const INTERVALO_EXPIRACAO_MS = 5 * 60 * 1000;

    // Controle de abas
    const ID_UNICO_ABA = Date.now().toString();
    sessionStorage.setItem("identificador_aba_tw", ID_UNICO_ABA);

    function estaNaAbaPrincipal() {
        const chaves = Object.keys(sessionStorage).filter(k => k === "identificador_aba_tw");
        return chaves.length === 1;
    }

    function trazerJanelaParaFrente() {
        try {
            window.open('', '_self').focus();
        } catch (e) {
            console.warn("⚠️ Não foi possível puxar a janela:", e);
        }
    }

    function enviarNotificacaoParaTelegram(mensagemAlerta, chatId) {
        if (!estaNaAbaPrincipal()) {
            console.log("🔇 Notificação ignorada: aba secundária.");
            return;
        }

        let nomeJogador = "Desconhecido";
        let mundo = "Desconhecido";

        if (window.TribalWars?.getGameData) {
            const data = window.TribalWars.getGameData();
            nomeJogador = data.player?.name || nomeJogador;
            mundo = data.world || mundo;
        }

        const match = document.body.innerText.match(/Bem-vindo,\s+([^\n]+)/i);
        if (match && match[1]) {
            nomeJogador = match[1].trim();
        }

        const horario = new Date().toLocaleString();
        const mensagem = `👤 CONTA: ${nomeJogador}\n🌍 Mundo: ${mundo}\n🕒 Horário: ${horario}`;

        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(`${mensagemAlerta}\n\n${mensagem}`)}`;

        fetch(url)
            .then(res => res.ok ? console.log("✅ Notificação enviada.") : console.error("❌ Erro ao enviar notificação."))
            .catch(err => console.error("❌ Erro ao conectar ao Telegram:", err));
    }

    let captchaAtivo = false;

    function verificarCaptcha() {
        let captchaPresente = document.body.innerHTML.toLowerCase().includes("proteção contra bots") ||
            document.querySelector('[id*="bot-protection"]') ||
            document.querySelector('[class*="bot-protection-row"]');

        const agora = Date.now();

        if (captchaPresente && !captchaAtivo) {
            if (agora - ultimaNotificacaoCaptcha >= INTERVALO_CAPTCHA_MS) {
                captchaAtivo = true;
                ultimaNotificacaoCaptcha = agora;
                console.log("🚨 CAPTCHA detectado!");
                enviarNotificacaoParaTelegram("⚠ CAPTCHA DETECTADO! ⚠", CHAT_ID_CAPTCHA);
                trazerJanelaParaFrente();
            } else {
                console.log("⏳ CAPTCHA detectado, mas já notificado recentemente.");
            }
        }

        if (!captchaPresente) {
            captchaAtivo = false;
        }
    }

    let paginaExpirada = false;

    function verificarExpiracaoPagina() {
        let texto = document.body.innerText.toLowerCase();
        let expirou = texto.includes("não é possível acessar esse site") ||
                      texto.includes("err_connection_closed") ||
                      texto.includes("encerrou a conexão inesperadamente") ||
                      texto.includes("verificar a conexão") ||
                      texto.includes("verificar o proxy e o firewall");

        const agora = Date.now();

        if (expirou && !paginaExpirada) {
            if (agora - ultimaNotificacaoExpiracao >= INTERVALO_EXPIRACAO_MS) {
                paginaExpirada = true;
                ultimaNotificacaoExpiracao = agora;
                console.log("❌ Página expirada detectada!");
                enviarNotificacaoParaTelegram("❌ PÁGINA EXPIRADA! ❌", CHAT_ID_EXPIRACAO);
            } else {
                console.log("⏳ Página expirada, mas já notificada.");
            }
        }

        if (!expirou) {
            paginaExpirada = false;
        }
    }

    function verificarOfertaPromocional() {
        const ofertas = document.querySelectorAll('.box-item.firstcell.nowrap a');
        const agora = Date.now();
        const INTERVALO_6H = 6 * 60 * 60 * 1000;
        const chave = "ultimaNotificacaoOferta";
        const ultima = Number(localStorage.getItem(chave) || 0);

        ofertas.forEach(oferta => {
            if (oferta.textContent.includes("Oferta!") && (agora - ultima > INTERVALO_6H)) {
                const tempo = oferta.querySelector("span:last-child")?.innerText.trim() || "Tempo desconhecido";
                const msg = `🔥 OFERTA DETECTADA!\n🕒 Duração: ${tempo}`;
                enviarNotificacaoParaTelegram(msg, CHAT_ID_PROMOCAO);
                localStorage.setItem(chave, agora.toString());
            }
        });
    }

    function getUltimaColetaTimestamp() {
        return Number(localStorage.getItem("ultimaColetaBonusDiario") || 0);
    }

    function setUltimaColetaTimestamp() {
        localStorage.setItem("ultimaColetaBonusDiario", Date.now());
    }

    function precisaColetarBonusDiario() {
        return Date.now() - getUltimaColetaTimestamp() >= 24 * 60 * 60 * 1000;
    }

    function getVillageId() {
        const url = new URL(window.location.href);
        return url.searchParams.get("village") || "0";
    }

    function iniciarColetaBonusDiario() {
        const gameData = window.TribalWars?.getGameData?.();
        const mundoAtual = gameData?.world || "";

        if (mundoAtual.startsWith("brp")) {
            console.log("🚫 Mundo brp detectado. Ignorando bônus diário.");
            return;
        }

        const url = new URL(window.location.href);
        const estaNaPaginaBonus = url.searchParams.get("screen") === "info_player" && url.searchParams.get("mode") === "daily_bonus";
        const temBonusDiario = document.querySelector('a[href*="mode=daily_bonus"]');

        if (!temBonusDiario) {
            console.log("🚫 Mundo sem bônus diário.");
            return;
        }

        if (estaNaPaginaBonus) {
            function coletarProximoBau() {
                const botoes = document.querySelectorAll("#daily_bonus_content .btn.btn-default");
                const botaoPremium = document.querySelector("#daily_bonus_content .btn.btn-premium");
                const confirmBox = document.querySelector(".popup_box_close");

                if (botaoPremium) {
                    console.log("⚠️ Baú exige pontos premium. Ignorando...");
                }

                if (botoes.length > 0 && !botaoPremium) {
                    console.log("👉 Clicando em baú gratuito...");
                    botoes[0].click();
                    setTimeout(coletarProximoBau, 1500);
                } else if (confirmBox && getComputedStyle(confirmBox).display !== "none") {
                    console.log("🛑 Janela de confirmação visível. Aguardando...");
                    setTimeout(coletarProximoBau, 2000);
                } else {
                    console.log("✅ Coleta encerrada. Retornando à página anterior...");
                    setUltimaColetaTimestamp();
                    const voltarPara = localStorage.getItem("urlOriginalAntesDoBonus") || `/game.php?village=${getVillageId()}&screen=main`;
                    localStorage.removeItem("urlOriginalAntesDoBonus");
                    setTimeout(() => window.location.href = voltarPara, 1500);
                }
            }

            coletarProximoBau();
        } else if (precisaColetarBonusDiario()) {
            console.log("⏰ Redirecionando para coletar bônus...");
            localStorage.setItem("urlOriginalAntesDoBonus", window.location.href);
            window.location.href = `/game.php?village=${getVillageId()}&screen=info_player&mode=daily_bonus`;
        } else {
            console.log("🕒 Aguardando 24h para nova coleta.");
        }
    }

    // Detectar permanência na página inicial
    let tempoNaPaginaInicial = null;
    setInterval(() => {
        const urlAtual = window.location.href;
        const tempoMinimo = 5 * 60 * 1000;

        if (urlAtual === "https://www.tribalwars.com.br/") {
            if (!tempoNaPaginaInicial) {
                tempoNaPaginaInicial = Date.now();
            } else if (Date.now() - tempoNaPaginaInicial >= tempoMinimo) {
                enviarNotificacaoParaTelegram("⚠ CONTA NA PÁGINA INICIAL POR 5 MINUTOS ⚠", CHAT_ID_EXPIRACAO);
                trazerJanelaParaFrente();
                tempoNaPaginaInicial = null;
            }
        } else {
            tempoNaPaginaInicial = null;
        }
    }, 10000);

    // Executores
    new MutationObserver(() => {
        verificarCaptcha();
        verificarExpiracaoPagina();
    }).observe(document.body, { childList: true, subtree: true });

    setInterval(verificarOfertaPromocional, 3000);
    verificarCaptcha();
    verificarExpiracaoPagina();
    iniciarColetaBonusDiario();
})();
