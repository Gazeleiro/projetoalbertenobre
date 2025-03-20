// ==UserScript==
// @name         Planejador WAR (funcional e calibrado Final sem NT)
// @author       Players
// @version      1.2
// @match        *://*.tribalwars.com.br/game.php*
// @include      https://*screen=place&try=confirm*
// @require      https://code.jquery.com/jquery-2.2.4.min.js
// @run-at       document-start
// ==/UserScript==

const CommandSender = {
    confirmButton: null,
    duration: null,
    dateNow: null,
    latency: null,
    latencyHistory: [],
    latencyIndicator: null,
    attackTime: null,
    defaultDelay: 80,
    highLatencyDelay: 80, // Atraso adicional para latência alta
    highLatencyThreshold: 800, // Limite de latência para aplicar o atraso adicional
    storageKey: 'CS.scheduledAttack',
    refreshCounterKey: 'CS.refreshCounter',
    latencyUpdateInterval: 500,
    latencyHistorySize: 15,

    init: function() {
         console.log('CommandSender init start');

        $($('#command-data-form')['find']('tbody')[0])['append']('<tr><td>Chegada:</td><td> <input type="datetime-local" id="CStime" step=".001"> </td></tr><tr> <td>Offset:</td><td><span id="offset-display"></span><span id="latency-indicator" style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:red;margin-left:5px;"></span> <button type="button" id="CSbutton" class="btn">Confirmar</button>  <button type="button" id="CSCancel" class="btn">Cancelar</button></td></tr>');

        this.confirmButton = $('#troop_confirm_submit');
        this.duration = $('#command-data-form').find('td:contains("Dura\xE7\xE3o:")').next().text().split(':').map(Number);
        this.latencyIndicator = $('#latency-indicator');
        this.startLatencyTest();
        $('#CSCancel').click(() => this.cancelScheduledAttack());
        const storedData = this.getScheduledAttack();
        this.toggleButtons(storedData);

        if (storedData) {
            this.dateNow = this.convertToInput(new Date(storedData.attackTime));
            $('#CStime').val(this.dateNow);
            this.attackTime = new Date(storedData.attackTime);
            this.schedulePageRefresh();
            console.log('agendamento carregado:', storedData)
        } else {
            this.dateNow = this.convertToInput(new Date(new Date().getTime() + 5 * 60 * 1000));
            $('#CStime').val(this.dateNow);
            console.log('sem agendamento existente. Inicialização padrão.')
        }

        $('#CSbutton').click(() => this.scheduleAttack());

        setInterval(function() {
            var newTime = CommandSender.getAttackTime();
            $('#CStime').val(CommandSender.convertToInput(newTime));
            $('#offset-display').text(CommandSender.getServerOffset());
        }, 1000);

        console.log('CommandSender init finished');
    },

    toggleButtons: function (scheduled) {
        $('#CSbutton').prop('disabled', !!scheduled);
        $('#CStime').prop('disabled', !!scheduled);
        $('#CSCancel').prop('disabled', !scheduled)
    },

    scheduleAttack: function(){
        const attackTime = this.getAttackTime().getTime();
        this.attackTime = new Date(attackTime)
        const attackData = {
            attackTime: attackTime,
        };
        localStorage.setItem(this.storageKey, JSON.stringify(attackData));
        this.toggleButtons(true);
        console.log('Agendamento salvo:', attackData);
        this.schedulePageRefresh();
    },

    cancelScheduledAttack: function() {
        this.clearScheduledAttack();
        this.toggleButtons(false)
    },

    getScheduledAttack: function() {
        const storedData = localStorage.getItem(this.storageKey);
        if (storedData) {
            try {
                console.log('Recuperando agendamento:', JSON.parse(storedData));
                return JSON.parse(storedData)
            } catch (e) {
                console.error("Erro ao parsear o agendamento", e);
            }
        }
        return null;
    },

    clearScheduledAttack: function() {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.refreshCounterKey);
        console.log('agendamento apagado')
    },

    getAttackTime: function() {
       const attackDate = new Date($('#CStime').val().replace('T', ' '));
       attackDate.setHours(attackDate.getHours() - this.duration[0]);
       attackDate.setMinutes(attackDate.getMinutes() - this.duration[1]);
        attackDate.setSeconds(attackDate.getSeconds() - this.duration[2]);
          console.log('data calculada:', attackDate)
         return attackDate;
   },

    convertToInput: function(date) {
       date.setHours(date.getHours() + this.duration[0]);
       date.setMinutes(date.getMinutes() + this.duration[1]);
        date.setSeconds(date.getSeconds() + this.duration[2]);

       const formatted = {
          y: date.getFullYear(),
           m: date.getMonth() + 1,
            d: date.getDate(),
           time: date.toTimeString().split(' ')[0],
          ms: date.getMilliseconds()
        };

      if (formatted.m < 10) formatted.m = '0' + formatted.m;
       if (formatted.d < 10) formatted.d = '0' + formatted.d;
       if (formatted.ms < 100) {
            formatted.ms = '0' + formatted.ms;
          if (formatted.ms < 10) formatted.ms = '0' + formatted.ms;
      }

     return formatted.y + '-' + formatted.m + '-' + formatted.d + 'T' + formatted.time + '.' + formatted.ms;
    },

   startLatencyTest: function() {
        console.log('latency teste started');
        setInterval(() => {
            let startTime = Date.now();
            $.get('/game.php', () => {
                const currentLatency = (Date.now() - startTime) / 2;
                this.latencyHistory.push(currentLatency);
                if(this.latencyHistory.length > this.latencyHistorySize) {
                    this.latencyHistory.shift();
                }
                this.latency = this.calculateAverageLatency();
                this.latencyIndicator.css('background-color', 'green');
            }).fail(() => {
                this.latency = null;
                this.latencyIndicator.css('background-color', 'red');
            });
        }, this.latencyUpdateInterval);
    },

  calculateAverageLatency: function() {
     if(this.latencyHistory.length === 0){
       return null;
      }
    let sum = 0;
    for(let i = 0; i < this.latencyHistory.length; i++) {
     sum += this.latencyHistory[i];
      }
     return sum / this.latencyHistory.length;
    },
    schedulePageRefresh: function() {
        if (!this.attackTime) {
            console.log("Não há agendamento para refresh")
            return;
        }

        const self = this;
        let refreshInterval = setInterval(function() {
            console.log('Checando data...', self.attackTime);
            const timeLeft = self.attackTime - new Date();
            if(timeLeft <= 15000 && timeLeft >= 0){
                 clearInterval(refreshInterval);
                  self.pageRefreshAndSendCommand();
            } else if(timeLeft <= -5000) {
                clearInterval(refreshInterval);
                self.clearScheduledAttack();
                 console.log("tempo de ataque expirado");
            }
        }, 1000);
    },

    pageRefreshAndSendCommand: function() {
        const counter = localStorage.getItem(this.refreshCounterKey)
        if(counter > 0) {
            console.log("Limite de refresh atingido", counter)
            this.softRefreshAndSendCommand()
            return
        }

        localStorage.setItem(this.refreshCounterKey, counter ?  Number(counter)+1 : 1);
        console.log("Executando page refresh...", localStorage.getItem(this.refreshCounterKey))
        location.reload()
    },

    softRefreshAndSendCommand: function() {
        this.confirmButton.addClass('btn-disabled');
        let adjustedLatency = (this.latency || 0) * 0.00017;
      let additionalDelay = 0;

       if(this.latency && this.latency > this.highLatencyThreshold) {
        additionalDelay = this.highLatencyDelay;
        console.log('Latência alta detectada:', this.latency, 'ms. Adicionando atraso de:', additionalDelay, 'ms');
        }

        const delay = this.attackTime.getTime() - Timing.getCurrentServerTime() + this.getServerOffset() - adjustedLatency + this.defaultDelay + additionalDelay;
       console.log('Realizando envio com atraso de:', delay, 'ms');

        setTimeout(() => {
            this.confirmButton.click();
            console.log("comando enviado");
            this.clearScheduledAttack()
        }, delay);
    },

    addGlobalStyle: function(style) {
      var head, styleElement;
      head = document.getElementsByTagName('head')[0];
        if (!head) return;
      styleElement = document.createElement('style');
     styleElement.type = 'text/css';
     styleElement.innerHTML = style;
     head.appendChild(styleElement);
    },
    getServerOffset: function() {
        return Timing.offset_to_server || 0;
   }
};

CommandSender.addGlobalStyle('#CStime {font-size: 9pt;font-family: Verdana,Arial;}#CSbutton ,#CSCancel {float:right;}#offset-display{font-size: 9pt;font-family: Verdana,Arial; display: inline-block;width:30px;}');

const initInterval = setInterval(function() {
    if (document.getElementById('command-data-form') && jQuery) {
        CommandSender.init();
        clearInterval(initInterval);
    }
}, 1);
