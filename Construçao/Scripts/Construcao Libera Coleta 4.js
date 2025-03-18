//********* CONFIGURAÇÃO *********//
// Escolha Tempo de espera mínimo e máximo entre ações (em milissegundos)
const Min_Tempo_Espera= 20000;
const Max_Tempo_Espera = 50000;

// Etapa_1: Upar O bot automaticamente em Série Edificios
const Etapa = "Etapa_1";

// Escolha se você deseja que o bot enfileire os edifícios na ordem definida (= true) ou
// assim que um prédio estiver disponível para a fila de construção (= false)
const Construção_Edificios_Ordem = true;


//********* /CONFIGURAÇÃO *********//

// Constantes (NÃO DEVE SER ALTERADAS)
const Visualização_Geral = "OVERVIEW_VIEW";
const Edificio_Principal = "HEADQUARTERS_VIEW";

(function() {
    'use strict';

    console.log("-- Script do Tribal Wars ativado --");

    if (Etapa == "Etapa_1"){
        executarEtapa1();
    }

})();

// Etapa 1: Construção
function executarEtapa1(){
    let Evoluir_vilas = getEvoluir_vilas();
    console.log(Evoluir_vilas);
    if (Evoluir_vilas == Edificio_Principal){
        setInterval(function(){
            // construir qualquer edificio custeável, se possível
            Proxima_Construção();
        }, 1000);
    }
    else if (Evoluir_vilas == Visualização_Geral){
        // Visualização Geral PG
        document.getElementById("l_main").children[0].children[0].click();
    }

}



    let delay = Math.floor(Math.random() * (Max_Tempo_Espera - Max_Tempo_Espera) + Min_Tempo_Espera);

    // Ação do processo
    let Evoluir_vilas = getEvoluir_vilas();
    console.log(Evoluir_vilas);
    setTimeout(function(){
        if (Evoluir_vilas == Edificio_Principal){

            // construir qualquer edificio custeável, se possível
            Proxima_Construção();

        }
        else if (Evoluir_vilas == Visualização_Geral){
            // Visualização Geral Pag
            document.getElementById("l_main").children[0].children[0].click();

        }
    }, delay);

function getEvoluir_vilas(){
    let currentUrl = window.location.href;
    if (currentUrl.endsWith('Visualização Geral')){
        return Visualização_Geral;
    }
    else if (currentUrl.endsWith('main')){
        return Edificio_Principal;
    }
}

function Proxima_Construção(){
    let Construção_proximo_edificio = getConstrução_proximo_edificio();
    if (Construção_proximo_edificio !== undefined){
        Construção_proximo_edificio.click();
        console.log("Clicked on " + Construção_proximo_edificio);
    }
}

setInterval(function(){
    var text="";
    var tr=$('[id="buildqueue"]').find('tr').eq(1);

    text=tr.find('td').eq(1).find('span').eq(0).text().split(" ").join("").split("\n").join("");
    var timeSplit=text.split(':');

  if(timeSplit[0]*60*60+timeSplit[1]*60+timeSplit[2]*1<3*60){
      console.log("Completar Grátis");
      tr.find('td').eq(2).find('a').eq(2).click();

  }
    $('[class="btn btn-confirm-yes reward-system-claim-button"]').click();
$('[class="btn btn-confirm-yes status-btn quest-complete-btn"]').click();
},1000);


function rec(){
    $('[id="new_quest"]').click();
setTimeout(function() {
    $('[id="reward-system-badge"]').click();
       }, 2000);
   setTimeout(function() {
        //missao concluida
         location.reload();
         }, 10000);
          }
setInterval(rec, 300000);

function getConstrução_proximo_edificio() {
    let Clicar_Upar_Edificos = document.getElementsByClassName("btn btn-build");
    let Construção_Edifcios_Serie = getConstrução_Edifcios_Serie();
    let instituir;
    while(instituir === undefined && Construção_Edifcios_Serie.length > 0){
        var proximo = Construção_Edifcios_Serie.shift();
        if (Clicar_Upar_Edificos.hasOwnProperty(proximo)){
            let próximo_edifício = document.getElementById(proximo);
            var Visivel = próximo_edifício.offsetWidth > 0 || próximo_edifício.offsetHeight > 0;
            if (Visivel){
                instituir = próximo_edifício;
            }
            if (Construção_Edificios_Ordem){
                break;
            }
        }
    }
    return instituir;
}

function getConstrução_Edifcios_Serie() {
    var Sequência_Construção = [];

    // Edificios Inicial conforme figura: https://i.imgur.com/jPuHuHN.png

//********* QUEST *********//
    // Construção Estatua 1
    Sequência_Construção.push("main_buildlink_statue_1");
    // Construção Madeira 1
    Sequência_Construção.push("main_buildlink_wood_1");
    // Construção Argila 1
    Sequência_Construção.push("main_buildlink_stone_1");
    // Construção Ferro 1
    Sequência_Construção.push("main_buildlink_iron_1");
    // Construção Madeira 2
    Sequência_Construção.push("main_buildlink_wood_2");
    // Construção Argila 2
    Sequência_Construção.push("main_buildlink_stone_2");
    // Construção Edificio Principal 2
    Sequência_Construção.push("main_buildlink_main_2");
    // Construção Edificio Principal 3
    Sequência_Construção.push("main_buildlink_main_3");
    // Construção Quartel 1
    Sequência_Construção.push("main_buildlink_barracks_1");
    // Construção Madeira 3
    Sequência_Construção.push("main_buildlink_wood_3");
    // Construção Argila 3
    Sequência_Construção.push("main_buildlink_stone_3");
    // Construção Quartel 2
    Sequência_Construção.push("main_buildlink_barracks_2");

//------------- Atacar Aldeia Barbara ------------------//

    // Construção Armazém 2
    Sequência_Construção.push("main_buildlink_storage_2");
    // Construção Ferro 2
    Sequência_Construção.push("main_buildlink_iron_2");
    // Construção Armazém 3
    Sequência_Construção.push("main_buildlink_storage_3");
        // Construção Esconderijo 1
    Sequência_Construção.push("main_buildlink_hide_1");
    // Construção Esconderijo 2
    Sequência_Construção.push("main_buildlink_hide_2");
    // Construção Esconderijo 3
    Sequência_Construção.push("main_buildlink_hide_3");
    // Construção Fazenda 2
    Sequência_Construção.push("main_buildlink_farm_2");
        // Construção Fazenda 3
    Sequência_Construção.push("main_buildlink_farm_3");
            // Construção Muralha 1
    Sequência_Construção.push("main_buildlink_wall_1");
    // Construção Muralha 2
    Sequência_Construção.push("main_buildlink_wall_2");
        // Construção Mercado 1
    Sequência_Construção.push("main_buildlink_market_1");
        // Construção Mercado 2
    Sequência_Construção.push("main_buildlink_market_2");


//---------------- Recrutar Lanceiro -----------------//

    // Construção Quartel 3
    Sequência_Construção.push("main_buildlink_barracks_3");
    // Construção Ferro 3
    Sequência_Construção.push("main_buildlink_iron_3");
    // Construção Madeira 4
    Sequência_Construção.push("main_buildlink_wood_4");
    // Construção Argila 4
    Sequência_Construção.push("main_buildlink_stone_4");
    // Construção Edificio Principal 4
    Sequência_Construção.push("main_buildlink_main_4");
        // Construção Armazém 4
    Sequência_Construção.push("main_buildlink_storage_4");
    // Construção Mercado 3
    Sequência_Construção.push("main_buildlink_market_3");
        // Construção Ferreiro 1
    Sequência_Construção.push("main_buildlink_smith_1");
      // Construção Ferreiro 2
    Sequência_Construção.push("main_buildlink_smith_2");
    // Construção Fazenda 4
    Sequência_Construção.push("main_buildlink_farm_4");
    // Construção Ferro 4
    Sequência_Construção.push("main_buildlink_iron_4");
        // Construção Edificio Principal 3
    Sequência_Construção.push("main_buildlink_main_5");
    // Construção Muralha 3
    Sequência_Construção.push("main_buildlink_wall_3");
       // Construção Armazém 5
    Sequência_Construção.push("main_buildlink_storage_5");
                // Construção Fazenda 5
    Sequência_Construção.push("main_buildlink_farm_5");
    // Construção Madeira 5
    Sequência_Construção.push("main_buildlink_wood_5");


    //---------------- Recrutar Paladino - Escolher Bandeira -  -----------------//
    // Construção Madeira 6
    Sequência_Construção.push("main_buildlink_wood_6");
    // Construção Argila 5
    Sequência_Construção.push("main_buildlink_stone_5");
        // Construção Madeira 7
    Sequência_Construção.push("main_buildlink_wood_7");
            // Construção Madeira 8
       Sequência_Construção.push("main_buildlink_wood_8");
    // Construção Argila 6
    Sequência_Construção.push("main_buildlink_stone_6");
                // Construção Mercado 4
    Sequência_Construção.push("main_buildlink_market_4");
    // Construção Mercado 5
    Sequência_Construção.push("main_buildlink_market_5");
    // Construção Armazém 6
    Sequência_Construção.push("main_buildlink_storage_6");
            // Construção Armazém 7
    Sequência_Construção.push("main_buildlink_storage_7");
     // Construção Armazém 8
    Sequência_Construção.push("main_buildlink_storage_8");
        // Construção Argila 7
    Sequência_Construção.push("main_buildlink_stone_7");
        // Construção Madeira 9
    Sequência_Construção.push("main_buildlink_wood_9");
        // Construção Ferro 5
    Sequência_Construção.push("main_buildlink_iron_5");
         // Construção Ferro 6

//---------------- https://image.prntscr.com/image/oMwaEPpCR2_1XaHzlMaobg.png -  -----------------//



//---------------- https://image.prntscr.com/image/n6tBlPGORAq9RmqSVccTKg.png -  -----------------//

    // Construção Armazém 9
    Sequência_Construção.push("main_buildlink_storage_9");
    // Construção Armazém 10
    Sequência_Construção.push("main_buildlink_storage_10");


//---------------- https://image.prntscr.com/image/ERCLrS5cT32ntSv1IevLUg.png -  -----------------//

            // Construção Fazenda 6
    Sequência_Construção.push("main_buildlink_farm_6");
                // Construção Fazenda 7
    Sequência_Construção.push("main_buildlink_farm_7");
    // Construção Mercado 6
    Sequência_Construção.push("main_buildlink_market_6");
    // Construção Armazém 11
    Sequência_Construção.push("main_buildlink_storage_11");
            // Construção Mercado 7
    Sequência_Construção.push("main_buildlink_market_7");
        // Construção Quartel 4
    Sequência_Construção.push("main_buildlink_barracks_4");
        // Construção Quartel 5
    Sequência_Construção.push("main_buildlink_barracks_5");
            // Construção Esconderijo 4
    Sequência_Construção.push("main_buildlink_hide_4");
            // Construção Esconderijo 5
    Sequência_Construção.push("main_buildlink_hide_5");
    // Construção Esconderijo 6
    Sequência_Construção.push("main_buildlink_hide_6");
    // Construção Esconderijo 7
    Sequência_Construção.push("main_buildlink_hide_7");
    // Construção Esconderijo 8
    Sequência_Construção.push("main_buildlink_hide_8");
    // Construção Esconderijo 9
    Sequência_Construção.push("main_buildlink_hide_9");
    // Construção Esconderijo 10
    Sequência_Construção.push("main_buildlink_hide_10");
        // Construção Armazém 12
    Sequência_Construção.push("main_buildlink_storage_12");
            // Construção Armazém 13
    Sequência_Construção.push("main_buildlink_storage_13");
    // Construção Armazém 14
    Sequência_Construção.push("main_buildlink_storage_14");
            // Construção Armazém 15
    Sequência_Construção.push("main_buildlink_storage_15");
        // Construção Mercado 8
    Sequência_Construção.push("main_buildlink_market_8");


    return Sequência_Construção;

}

// Comandos Futuros a serem introduzidos
//javascript: document.getElementsByClassName('order_feature btn btn-btr btn-instant-free')[0].click();
//javascript: document.getElementsByClassName('btn btn-confirm-yes')[0].click()