(function() {
    'use strict';

    let captchaAtivo = false;

    function verificarCaptcha() {
        // Verifica se há alguma referência ao CAPTCHA na página
        let captchaPresente = document.body.innerHTML.toLowerCase().includes("captcha") ||
                              document.querySelector('[id*="captcha"]') ||
                              document.querySelector('[class*="captcha"]');

        if (captchaPresente && !captchaAtivo) {
            captchaAtivo = true;
            console.log("⚠ CAPTCHA detectado! Chamando atenção...");
            piscarTitulo();
            tocarSom();
            setTimeout(() => alert("⚠ CAPTCHA DETECTADO! Resolva para continuar."), 1000);
        }
    }

    function piscarTitulo() {
        let tituloOriginal = document.title;
        let alerta = "⚠ CAPTCHA DETECTADO! ⚠";
        let piscando = true;

        setInterval(() => {
            document.title = piscando ? alerta : tituloOriginal;
            piscando = !piscando;
        }, 1000);
    }

    function tocarSom() {
        let beep = new Audio("https://www.soundjay.com/button/beep-07.wav");
        beep.loop = false;
        beep.play().catch(error => console.warn("⚠ Som bloqueado pelo navegador:", error));
    }

    // Verifica a cada 5 segundos se o CAPTCHA apareceu
    setInterval(verificarCaptcha, 5000);
})();
