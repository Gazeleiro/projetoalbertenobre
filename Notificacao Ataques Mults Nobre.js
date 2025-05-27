// ==UserScript==
// @name         Notificação de Ataques Nobre
// @namespace    http://tampermonkey.net/
// @version      3.1
// @description  Notificacoes para telegran de comandos acaminho
// @author       Você
// @include      https://br*.tribalwars.com.br/*
// @grant        Nobre
// @updateURL    https://raw.githubusercontent.com/Gazeleiro/projetoalbertenobre/refs/heads/main/Notificacao%20Ataques%20Mults%20Nobre.js
// @downloadURL  https://raw.githubusercontent.com/Gazeleiro/projetoalbertenobre/refs/heads/main/Notificacao%20Ataques%20Mults%20Nobre.js
// ==/UserScript==

(function () {
    'use strict';

    const BOT_TOKEN = '7362150939:AAHeetiLt3AJh0FMmp3auVULM0INJcNNDqA';
    const CHAT_ID = '-4943440311';
    const COOLDOWN_MS = 10 * 1000; // 3 minutos entre notificações da mesma leva

    function obterQuantidadeAtaques() {
        const tabela = document.querySelectorAll('#incomings_table tr.command-row');
        if (tabela.length > 0) return tabela.length;

        const contagem = document.querySelector('#incomings_amount');
        if (contagem) {
            const val = parseInt(contagem.innerText.trim(), 10);
            return isNaN(val) ? 0 : val;
        }

        return 0;
    }

    function obterDadosDoJogo() {
        try {
            const jogador = TribalWars.getGameData().player;
            const nomeJogador = jogador.name;
            const mundo = location.hostname.match(/br\d+/)?.[0] || 'Desconhecido';
            return { nomeJogador, mundo };
        } catch {
            return { nomeJogador: "Desconhecido", mundo: "Desconhecido" };
        }
    }

    function enviarNotificacao(qtd) {
        const { nomeJogador, mundo } = obterDadosDoJogo();
        const horario = new Date().toLocaleString();
        const mensagem = `⚠️ Novo ataque detectado! ⚠️\n\n👤 JOGADOR: ${nomeJogador}\n🌍 MUNDO: ${mundo}\n🕒 HORÁRIO: ${horario}\n🎯 Total de comandos: ${qtd}`;

        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(mensagem)}`)
            .then(res => res.json())
            .then(data => {
                if (data.ok) {
                    console.log("✅ Notificação enviada.");
                    localStorage.setItem("ultimaNotificacaoAtaque", Date.now().toString());
                    localStorage.setItem("hashNotificada", `${qtd}`);
                } else {
                    console.warn("⚠️ Erro ao enviar:", data);
                }
            })
            .catch(console.error);
    }

    function verificarNovosAtaques() {
        const qtdAtual = obterQuantidadeAtaques();
        const hashAtual = `${qtdAtual}`;
        const hashSalva = localStorage.getItem("hashNotificada") || "";
        const ultimaNotificacao = parseInt(localStorage.getItem("ultimaNotificacaoAtaque") || "0", 10);
        const agora = Date.now();

        // Reset total
        if (qtdAtual === 0 && hashSalva !== "") {
            console.log("🔄 Ataques zerados. Resetando estado.");
            localStorage.setItem("hashNotificada", "");
            localStorage.setItem("ultimaNotificacaoAtaque", "0");
            return;
        }

        // Se há novos ataques e é diferente do último hash, e passou tempo suficiente
        if (qtdAtual > 0 && hashAtual !== hashSalva && (agora - ultimaNotificacao > COOLDOWN_MS)) {
            enviarNotificacao(qtdAtual);
        }
    }

    // Verificação contínua a cada 5 segundos
    setInterval(() => {
        verificarNovosAtaques();
    }, 5000);

    // E inicial imediato
    verificarNovosAtaques();

    console.log("🛡️ Script de notificação de ataques (v2.4.0 estável) ativado.");
})();
