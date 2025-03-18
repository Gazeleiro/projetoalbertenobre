(function() {
    'use strict';

    var $ = window.jQuery;

    // Função para clicar nos botões "Desbloquear" sequencialmente
    function clickUnlockButtons(callback) {

        // Primeiro desbloqueio
        function clickFirstUnlockButton(next) {
            let button = document.querySelector('.btn.btn-default.unlock-button');

            if (button && button.innerText.trim() === 'Desbloquear') {
                button.click();
                console.log('Clicou no primeiro botão "Desbloquear"');
                // Aguarda um tempo para a próxima tela carregar
                setTimeout(next, 1000);
            } else {
                // Se não encontrar, segue adiante mesmo assim
                console.log('Não encontrou o primeiro botão "Desbloquear". Seguindo adiante...');
                next();
            }
        }

        // Segundo desbloqueio
        function clickSecondUnlockButton(next) {
            let button = null;
            let buttons = document.querySelectorAll('.btn.btn-default');

            buttons.forEach(function(btn) {
                if (btn.innerText.trim() === 'Desbloquear') {
                    button = btn;
                }
            });

            if (button) {
                button.click();
                console.log('Clicou no segundo botão "Desbloquear"');
                setTimeout(function() {
                    clickPopupCloseButton(next);
                }, 1000);
            } else {
                console.log('Não encontrou o segundo botão "Desbloquear". Seguindo adiante...');
                clickPopupCloseButton(next);
            }
        }

        // Fecha o popup, se existir
        function clickPopupCloseButton(next) {
            let button = document.querySelector('a.popup_box_close.tooltip-delayed');

            if (button) {
                button.click();
                console.log('Clicou no botão "Fechar" do popup');
                setTimeout(next, 500);
            } else {
                console.log('O botão "Fechar" do popup não está presente. Prosseguindo...');
                next();
            }
        }

        // Executa as funções de desbloqueio em sequência
        clickFirstUnlockButton(function() {
            clickSecondUnlockButton(callback);
        });
    }

    // Função para carregar o script externo
    function loadExternalScript(url, callback) {
        $.getScript(url)
            .done(function() {
                console.log('Script externo carregado com sucesso.');
                callback();
            })
            .fail(function(jqxhr, settings, exception) {
                console.error('Erro ao carregar o script externo:', exception);
                // Mesmo em caso de falha, executa o callback para não travar o fluxo
                callback();
            });
    }

    // Função principal que será executada após o desbloqueio
    function main() {
        // Executa a sequência de 4 tentativas
        clickSequence(4);
    }

    // Função para executar a sequência de cliques 4x
    // Para cada vez:
    // 1) Carrega o script externo
    // 2) Espera 2s
    // 3) Clica em "Começar"
    // 4) Espera mais 2s
    // 5) Próxima tentativa
    function clickSequence(times) {
        let count = 0;

        function nextIteration() {
            if (count >= times) {
                console.log("Concluiu as " + times + " tentativas de clique.");
                return;
            }

            // Carrega o script externo
            loadExternalScript('https://gistcdn.githack.com/duckinScripts/61d5eab73eed58b5195f8b1d74f0b989/raw/scav_funcional.js', function() {
                console.log("Script externo carregado, aguardando 2s antes de clicar em 'Começar'...");
                setTimeout(function() {
                    let buttons = document.querySelectorAll('.btn.btn-default.free_send_button');
                    let button = null;

                    buttons.forEach(function(btn) {
                        if (btn.innerText.trim() === 'Começar') {
                            button = btn;
                        }
                    });

                    if (button) {
                        button.click();
                        console.log("Clicou no botão 'Começar'");
                        count++;
                        console.log("Aguardando 2s antes da próxima tentativa...");
                        setTimeout(nextIteration, 2000);
                    } else {
                        console.log("Botão 'Começar' não encontrado. Interrompendo.");
                    }
                }, 2000);
            });
        }

        nextIteration();
    }

    // Inicia clicando nos botões de desbloqueio e depois chama o main()
    clickUnlockButtons(main);

})();

