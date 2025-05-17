// ==UserScript==
// @name         Notificação Tribal Wars Avançada
// @namespace    http://tampermonkey.net/
// @version      10.0
// @description  Notifica CAPTCHA, promoções e páginas expiradas em grupos diferentes, com anti-spam e coleta segura de bônus diário.
// @author       Nobre
// @match        https://*.tribalwars.com.br/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const BOT_TOKEN = '7362150939:AAHeetiLt3AJh0FMmp3auVULM0INJcNNDqA';
    const CHAT_ID_CAPTCHA = '-4747519721';
    const CHAT_ID_PROMOCAO = '-4847613379';
    const CHAT_ID_EXPIRACAO = '-4917296021';

    const INTERVALO_CAPTCHA_MS = 30000;
    const INTERVALO_EXPIRACAO_MS = 5 * 60 * 1000;
    const TEMPO_MINIMO_PAGINA_INICIAL = 10000;

    let ultimaNotificacaoCaptcha = 0;
    let ultimaNotificacaoExpiracao = 0;
    let paginaExpirada = false;

    const setCookie = (name, value) => {
        document.cookie = `${name}=${value}; path=/; domain=.tribalwars.com.br`;
    };
    const getCookie = (name) => {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
    };
    const deleteCookie = (name) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.tribalwars.com.br`;
    };

    function getNomeJogadorEMundo() {
        let nomeJogador = "Desconhecido", mundo = "Desconhecido";
        if (window.TribalWars?.getGameData) {
            const data = window.TribalWars.getGameData();
            nomeJogador = data.player?.name || nomeJogador;
            mundo = data.world || mundo;
        }
        const h2 = [...document.querySelectorAll("h2")].find(h => h.textContent.includes("Bem-vindo"));
        if (h2) nomeJogador = h2.textContent.replace("Bem-vindo,", "").trim();
        return { nomeJogador, mundo };
    }

    function enviarNotificacaoParaTelegram(mensagemAlerta, chatId, onSuccess = null) {
        const { nomeJogador, mundo } = getNomeJogadorEMundo();
        const horario = new Date().toLocaleString();
        const textoFinal = `${mensagemAlerta}\n\n👤 CONTA: ${nomeJogador}\n🌍 Mundo: ${mundo}\n🕒 Horário: ${horario}`;

        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: textoFinal })
        })
        .then(res => res.json())
        .then(data => {
            if (data.ok && onSuccess) onSuccess(data.result.message_id);
        })
        .catch(console.error);
    }

    function verificarCaptcha() {
        const captchaPresente =
            document.body.innerText.toLowerCase().includes("proteção contra bots") ||
            document.querySelector('[id*="bot-protection"]') ||
            document.querySelector('[class*="bot-protection-row"]');

        const agora = Date.now();
        const { nomeJogador, mundo } = getNomeJogadorEMundo();
        const mensagens = JSON.parse(localStorage.getItem("captchaMensagens") || "[]");
        const jaNotificado = mensagens.some(m => m.jogador === nomeJogador && m.mundo === mundo);

        if (captchaPresente && !jaNotificado && agora - ultimaNotificacaoCaptcha > INTERVALO_CAPTCHA_MS) {
            ultimaNotificacaoCaptcha = agora;
            enviarNotificacaoParaTelegram("⚠ CAPTCHA DETECTADO! ⚠", CHAT_ID_CAPTCHA, messageId => {
                mensagens.push({ id: messageId, jogador: nomeJogador, mundo, chat_id: CHAT_ID_CAPTCHA });
                localStorage.setItem("captchaMensagens", JSON.stringify(mensagens));
            });
        }
    }

    function verificarPaginaInicialComNotificacao() {
        const url = window.location.href;

    // ✅ Só executa se for exatamente a página inicial
    if (url !== "https://www.tribalwars.com.br/") return;;
        const agora = Date.now();

        const h2 = [...document.querySelectorAll("h2")].find(h => h.textContent.includes("Bem-vindo"));
        const nomeJogador = h2?.textContent.replace("Bem-vindo,", "").trim();
        if (!nomeJogador || !naPaginaInicial) return;

        if (!window._tempoNaPaginaInicial) {
            window._tempoNaPaginaInicial = agora;
        } else if (agora - window._tempoNaPaginaInicial >= TEMPO_MINIMO_PAGINA_INICIAL) {
            enviarNotificacaoParaTelegram("⚠ CONTA NA PÁGINA INICIAL ⚠", CHAT_ID_EXPIRACAO, id => {
                const pendentes = getCookie("msg_pendentes")?.split(",").filter(Boolean) || [];
                pendentes.push(id);
                setCookie("msg_pendentes", pendentes.join(","));
                setCookie(`msg_${id}_jogador`, nomeJogador);
                setCookie(`msg_${id}_chat`, CHAT_ID_EXPIRACAO);
                console.log(`✅ Notificação salva [${id}]`);
            });
            window._tempoNaPaginaInicial = agora;
        }
    }

    function verificarEMensagemApagarTelegram() {
        const paginaAtual = window.location.href;

    // Só executa se estiver na página correta
    if (!paginaAtual.includes("screen=overview") || !paginaAtual.includes("intro")) {
        console.log("⏭️ Página atual não é a overview com intro. Abortando limpeza.");
        return;
    }
        setTimeout(() => {
            const nomeAtual = window.TribalWars?.getGameData?.().player?.name;
            if (!nomeAtual) {
                console.warn("⏳ Aguardando nome do jogador TribalWars...");
                return;
            }

            const normalizar = t => (t || "").trim().toLowerCase();
            const pendentes = getCookie("msg_pendentes")?.split(",").filter(Boolean) || [];

            console.log("📋 Mensagens pendentes:", pendentes);
            console.log("🎯 Jogador atual:", nomeAtual);

            pendentes.forEach(id => {
                const jogadorSalvo = getCookie(`msg_${id}_jogador`);
                const chatId = getCookie(`msg_${id}_chat`);

                if (normalizar(jogadorSalvo) === normalizar(nomeAtual)) {
                    console.log(`🚀 Apagando mensagem ${id}...`);
                    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: chatId,
                            message_id: Number(id)
                        })
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.ok) {
                            console.log(`✅ Mensagem ${id} apagada com sucesso!`);
                            deleteCookie(`msg_${id}_jogador`);
                            deleteCookie(`msg_${id}_chat`);
                            const restantes = pendentes.filter(p => p !== id);
                            if (restantes.length > 0) {
                                setCookie("msg_pendentes", restantes.join(","));
                            } else {
                                deleteCookie("msg_pendentes");
                            }
                        } else {
                            console.warn(`⚠ Falha ao apagar ${id}:`, data.description);
                        }
                    })
                    .catch(err => console.error(`❌ Erro ao apagar ${id}`, err));
                } else {
                    console.warn(`❌ Nome não bate para msg ${id}: ${jogadorSalvo} vs ${nomeAtual}`);
                }
            });
        }, 5000);
    }

    function verificarExpiracaoPagina() {
        const texto = document.body.innerText.toLowerCase();
        const expirou = texto.includes("não é possível acessar esse site") || texto.includes("verificar a conexão");
        const agora = Date.now();
        if (expirou && !paginaExpirada && agora - ultimaNotificacaoExpiracao > INTERVALO_EXPIRACAO_MS) {
            paginaExpirada = true;
            ultimaNotificacaoExpiracao = agora;
            enviarNotificacaoParaTelegram("❌ PÁGINA EXPIRADA! ❌", CHAT_ID_EXPIRACAO);
        }
        if (!expirou) paginaExpirada = false;
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
                enviarNotificacaoParaTelegram(`🔥 OFERTA DETECTADA!\n🕒 Duração: ${tempo}`, CHAT_ID_PROMOCAO);
                localStorage.setItem(chave, agora.toString());
            }
        });
    }

    function iniciarColetaBonusDiario() {
        const gameData = window.TribalWars?.getGameData?.();
        const mundoAtual = gameData?.world || "";
        if (mundoAtual.startsWith("brp")) return;

        const url = new URL(window.location.href);
        const estaNaPaginaBonus = url.searchParams.get("screen") === "info_player" && url.searchParams.get("mode") === "daily_bonus";
        const temBonusDiario = document.querySelector('a[href*="mode=daily_bonus"]');
        if (!temBonusDiario) return;

        const getVillageId = () => url.searchParams.get("village") || "0";

        if (estaNaPaginaBonus) {
            function coletarProximoBau() {
                const botoes = document.querySelectorAll("#daily_bonus_content .btn.btn-default");
                const botaoPremium = document.querySelector("#daily_bonus_content .btn.btn-premium");
                const confirmBox = document.querySelector(".popup_box_close");

                if (botaoPremium) return;
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
            coletarProximoBau();
        } else {
            const ultima = Number(localStorage.getItem("ultimaColetaBonusDiario") || 0);
            if (Date.now() - ultima >= 24 * 60 * 60 * 1000) {
                localStorage.setItem("urlOriginalAntesDoBonus", window.location.href);
                window.location.href = `/game.php?village=${getVillageId()}&screen=info_player&mode=daily_bonus`;
            }
        }
    }

    // ⏱️ Agendamentos
    setInterval(() => {
        console.log("🟢 Verificação ativa");
        try {
            verificarPaginaInicialComNotificacao();
        } catch (e) {
            console.error("❌ Erro na verificação:", e);
        }
    }, 5000);

    setInterval(() => {
        try {
            verificarOfertaPromocional();
        } catch (e) {
            console.error("❌ Erro na oferta:", e);
        }
    }, 3000);

    new MutationObserver(() => {
        try {
            verificarCaptcha();
            verificarExpiracaoPagina();
        } catch (e) {
            console.error("❌ Erro em observer:", e);
        }
    }).observe(document.body, { childList: true, subtree: true });

    verificarCaptcha();
    verificarExpiracaoPagina();
    iniciarColetaBonusDiario();
    verificarEMensagemApagarTelegram(); // 🚀 Apaga pendentes ao entrar no mundo
})();

