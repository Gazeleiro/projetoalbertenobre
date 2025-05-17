// ==UserScript==
// @name         Notificação de Ataques Nobre
// @namespace    http://tampermonkey.net/
// @version      2.1.3
// @description  Notificacoes para telegran de comandos acaminho
// @author       Você
// @include      https://br*.tribalwars.com.br/*
// @grant        Nobre
// @updateURL    https://raw.githubusercontent.com/Gazeleiro/projetoalbertenobre/refs/heads/main/Notificacao%20Ataques%20Mults%20Nobre.js
// @downloadURL  https://raw.githubusercontent.com/Gazeleiro/projetoalbertenobre/refs/heads/main/Notificacao%20Ataques%20Mults%20Nobre.js
// ==/UserScript==

(function() {
    'use strict';

    // 🔹 CONFIGURAÇÕES - INSIRA SEUS DADOS DO TELEGRAM AQUI
    const BOT_TOKEN = '7362150939:AAHeetiLt3AJh0FMmp3auVULM0INJcNNDqA'; // Token do bot
    const CHAT_ID = '-4911225993'; // ID do chat ou grupo

    let ataquesAnteriores = 0;

    function obterQuantidadeInicialAtaques() {
        const elementoAtaques = document.querySelector('#incomings_amount');
        if (elementoAtaques) {
            const quantidade = parseInt(elementoAtaques.innerText.trim(), 10);
            return isNaN(quantidade) ? 0 : quantidade;
        }
        return 0;
    }

    function obterDadosDoJogo() {
        try {
            const jogador = TribalWars.getGameData().player; // Obtém dados do jogador
            const nomeJogador = jogador.name;
            const idJogador = jogador.id;

            // Extrair o prefixo do mundo da URL
            const urlPagina = window.location.href;
            const mundoMatch = urlPagina.match(/https:\/\/(br\d+)\.tribalwars\.com\.br/);
            const mundo = mundoMatch ? mundoMatch[1] : 'Desconhecido';

            return { nomeJogador, idJogador, mundo };
        } catch (error) {
            console.error("Erro ao obter dados do jogador:", error);
            return { nomeJogador: "Desconhecido", idJogador: "N/A", mundo: "Desconhecido" };
        }
    }

    function enviarNotificacaoParaTelegram() {
        const { nomeJogador, mundo } = obterDadosDoJogo();
        const horarioNotificacao = new Date().toLocaleString();
        const mensagem = `⚠️ Novo ataque detectado! ⚠️\n\n👤 JOGADOR: ${nomeJogador}\n🌍 MUNDO: ${mundo}\n🕒 HORARIO: ${horarioNotificacao}`;

        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(mensagem)}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.ok) {
                    console.log("✅ Notificação enviada para o Telegram!");
                } else {
                    console.error("❌ Erro ao enviar notificação:", data);
                }
            })
            .catch(error => {
                console.error("❌ Erro ao conectar com o Telegram:", error);
            });
    }

    function verificarNovosAtaques() {
        const elementoAtaques = document.querySelector('#incomings_amount');
        if (elementoAtaques) {
            const quantidadeAtaques = parseInt(elementoAtaques.innerText.trim(), 10);
            if (!isNaN(quantidadeAtaques) && quantidadeAtaques > ataquesAnteriores) {
                console.log(`🚨 Novo ataque detectado! (${quantidadeAtaques} ataques)`);
                ataquesAnteriores = quantidadeAtaques;
                enviarNotificacaoParaTelegram();
            }
        }
    }

    // 🔹 Obtém o número inicial de ataques ao carregar a página
    ataquesAnteriores = obterQuantidadeInicialAtaques();

    // Observador de mudanças na página para detectar ataques
    new MutationObserver(() => {
        verificarNovosAtaques();
    }).observe(document.body, { childList: true, subtree: true });

    console.log("📢 Script de notificação de ataques ativado!");
})();
