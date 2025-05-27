// ==UserScript==
// @name         Notificação Captcha Telegram
// @namespace    http://tampermonkey.net/
// @version      11.2.1
// @description  Sempre carrega a versão mais recente do script do Dropbox para notificações de CAPTCHA no Telegram.
// @author       Nobre
// @match        https://*.tribalwars.com.br/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/Gazeleiro/projetoalbertenobre/refs/heads/main/Notifica%C3%A7ao%20Capcha%20Telegran%20Nobre.js
// @downloadURL  https://raw.githubusercontent.com/Gazeleiro/projetoalbertenobre/refs/heads/main/Notifica%C3%A7ao%20Capcha%20Telegran%20Nobre.js
// ==/UserScript==
   (function() {
    'use strict';

    // ==== CONFIGURAÇÃO DOS CHATS ====
    const BOT_TOKEN = '7362150939:AAHeetiLt3AJh0FMmp3auVULM0INJcNNDqA';
    const CHAT_ID_CAPTCHA      = '-4747519721'; // Grupo do CAPTCHA
    const CHAT_ID_PROMOCAO     = '-4847613379'; // Grupo das Promoções
    const CHAT_ID_PAGINAINICIAL = '-4917296021'; // Grupo da Página Inicial

    let captchaAtivo = false;
    let paginaExpirada = false;
    let tempoNaPaginaInicial = null;
    const INTERVALO_VERIFICACAO = 10000;
    const TEMPO_MINIMO_EM_MS = 5 * 60 * 1000; // 5 minutos

    // ==== FUNÇÃO CENTRAL PARA DADOS DO JOGADOR ====
    function obterDadosJogador() {
        let nomeJogador = "Desconhecido", mundo = "Desconhecido";
        if (window.TribalWars?.getGameData) {
            const data = window.TribalWars.getGameData();
            nomeJogador = data.player?.name || nomeJogador;
            mundo = data.world || mundo;
        }
        // Caso esteja na página inicial (fora do jogo)
        const h2 = [...document.querySelectorAll("h2")].find(h => h.textContent.includes("Bem-vindo"));
        if (h2) nomeJogador = h2.textContent.replace("Bem-vindo,", "").trim();
        return { nomeJogador, mundo };
    }

    // ==== ENVIO PARA TELEGRAM ====
    function enviarNotificacaoParaTelegram(mensagemAlerta, chatId) {
        console.log("📤 Enviando para Telegram...");

        const { nomeJogador, mundo } = obterDadosJogador();
        const horario = new Date().toLocaleString();
        const mensagem = `👤 CONTA: ${nomeJogador}\n🌍 Mundo: ${mundo}\n🕒 Horário: ${horario}`;

        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(`${mensagemAlerta}\n\n${mensagem}`)}`;

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

    // ==== CAPTURAR CAPTCHA ====
    function verificarCaptcha() {
        let captchaPresente = document.body.innerHTML.toLowerCase().includes("proteção contra bots") ||
            document.querySelector('[id*="bot-protection"]') ||
            document.querySelector('[class*="bot-protection-row"]');
        if (captchaPresente && !captchaAtivo) {
            captchaAtivo = true;
            console.log("🚨 CAPTCHA detectado!");
            enviarNotificacaoParaTelegram("⚠ CAPTCHA DETECTADO! ⚠", CHAT_ID_CAPTCHA);
            trazerJanelaParaFrente();
        }
    }

    // ==== CAPTURAR PÁGINA EXPIRADA ====
    function verificarExpiracaoPagina() {
        let textoPagina = document.body.innerText.toLowerCase();
        let paginaExpirou = textoPagina.includes("não é possível acessar esse site") ||
            textoPagina.includes("err_connection_closed") ||
            textoPagina.includes("encerrou a conexão inesperadamente") ||
            textoPagina.includes("verificar a conexão") ||
            textoPagina.includes("verificar o proxy e o firewall");

        if (paginaExpirou && !paginaExpirada) {
            paginaExpirada = true;
            console.log("❌ Página expirada!");
            enviarNotificacaoParaTelegram("❌ PÁGINA EXPIRADA! ❌", CHAT_ID_PAGINAINICIAL);
        }
    }

    // ==== FUNÇÃO: FOCAR A JANELA ====
    function trazerJanelaParaFrente() {
        try {
            window.open('', '_self').focus();
        } catch (e) {
            console.warn("⚠️ Não foi possível puxar a janela:", e);
        }
    }

    // ==== VERIFICAR PERMANÊNCIA NA HOME ====
    function verificarPermanenciaNaPaginaInicial() {
        const urlAtual = window.location.href;
        if (urlAtual === "https://www.tribalwars.com.br/") {
            if (!tempoNaPaginaInicial) {
                tempoNaPaginaInicial = Date.now();
                console.log("🕒 Página inicial detectada. Contando 5 minutos...");
            } else if (Date.now() - tempoNaPaginaInicial >= TEMPO_MINIMO_EM_MS) {
                console.log("⏰ Página inicial por 5 min. Enviando notificação...");
                enviarNotificacaoParaTelegram("⚠ CONTA ESTÁ NA PÁGINA INICIAL HÁ 5 MINUTOS ⚠", CHAT_ID_PAGINAINICIAL);
                trazerJanelaParaFrente();
                tempoNaPaginaInicial = null;
            }
        } else {
            tempoNaPaginaInicial = null;
        }
    }
    setInterval(verificarPermanenciaNaPaginaInicial, INTERVALO_VERIFICACAO);

    // ==== PROMOÇÕES ====
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
                const mensagem = `🔥 OFERTA DETECTADA!\n🕒 Duração: ${tempo}`;
                enviarNotificacaoParaTelegram(mensagem, CHAT_ID_PROMOCAO);
                localStorage.setItem(chaveUltimaNotificacao, AGORA.toString());
            }
        });
    }
    setInterval(verificarOfertaPromocional, 3000);

    // ==== COLETA DE BÔNUS DIÁRIO AUTOMÁTICO ====
    function getUltimaColetaTimestamp() {
        return Number(localStorage.getItem("ultimaColetaBonusDiario") || 0);
    }

    function setUltimaColetaTimestamp() {
        localStorage.setItem("ultimaColetaBonusDiario", Date.now());
    }

    function precisaColetarBonusDiario() {
        const agora = Date.now();
        const ultimaColeta = getUltimaColetaTimestamp();
        const INTERVALO_8H = 8 * 60 * 60 * 1000; // 8 horas, ajuste se quiser 24h
        return agora - ultimaColeta >= INTERVALO_8H;
    }

    function getVillageId() {
        const url = new URL(window.location.href);
        return url.searchParams.get("village") || "0";
    }

    function iniciarColetaBonusDiario() {
        const gameData = window.TribalWars?.getGameData?.();
        const mundoAtual = gameData?.world || "";

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

        const urlOriginal = localStorage.getItem("urlOriginalAntesDoBonus") || window.location.href;

        function coletarProximoBau() {
            const botoes = document.querySelectorAll("#daily_bonus_content .btn.btn-default");
            const botaoPremium = document.querySelector("#daily_bonus_content .btn.btn-premium");
            const confirmBox = document.querySelector(".popup_box_close");
            const popupBonusPerdido = document.querySelector('.popup_box_content p.error');

            // Se houver popup de bônus perdido ou botão premium, FECHA E VOLTA
            if (
                botaoPremium ||
                (popupBonusPerdido && popupBonusPerdido.textContent.includes('Você não tem Pontos Premium suficientes'))
            ) {
                console.log("Ignorando bônus diário perdido - requer premium.");
                localStorage.setItem("ultimaColetaBonusDiario", Date.now());

                if (confirmBox && getComputedStyle(confirmBox).display !== "none") {
                    confirmBox.click();
                }
                const voltarPara = localStorage.getItem("urlOriginalAntesDoBonus") || `/game.php?village=${getVillageId()}&screen=main`;
                localStorage.removeItem("urlOriginalAntesDoBonus");
                setTimeout(() => window.location.href = voltarPara, 1200);
                return;
            }

            if (botoes.length > 0) {
                botoes[0].click();
                setTimeout(coletarProximoBau, 1500);
            } else if (confirmBox && getComputedStyle(confirmBox).display !== "none") {
                setTimeout(coletarProximoBau, 2000);
            } else {
                localStorage.setItem("ultimaColetaBonusDiario", Date.now());
                const voltarPara = localStorage.getItem("urlOriginalAntesDoBonus") || `/game.php?village=${getVillageId()}&screen=main`;
                localStorage.removeItem("urlOriginalAntesDoBonus");
                setTimeout(() => window.location.href = voltarPara, 1500);
            }
        }

        if (estaNaPaginaBonus) {
            console.log("🎁 Coletando baús automaticamente...");
            coletarProximoBau();
        } else if (precisaColetarBonusDiario()) {
            console.log("⏰ Hora de coletar bônus diário! Salvando URL e redirecionando...");
            localStorage.setItem("urlOriginalAntesDoBonus", window.location.href);
            const villageId = getVillageId();
            window.location.href = `/game.php?village=${villageId}&screen=info_player&mode=daily_bonus`;
        } else {
            console.log("🕒 Aguardando 8h para próxima coleta.");
        }
    }

    // ==== OBSERVADOR DE MUDANÇAS NA PÁGINA ====
    new MutationObserver(() => {
        verificarCaptcha();
        verificarExpiracaoPagina();
    }).observe(document.body, { childList: true, subtree: true });

    // ==== CHAMADAS INICIAIS ====
    verificarCaptcha();
    verificarExpiracaoPagina();
    iniciarColetaBonusDiario();

})();
