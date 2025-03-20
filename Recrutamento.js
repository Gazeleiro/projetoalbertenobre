// ==UserScript==
// @name         Script de Recrutamento de Tropas
// @namespace    http://tampermonkey.net/
// @version      3.4
// @description  Recruta tropas até um limite total definido pelo usuário.
// @author       singularidade
// @include       https://*.tribalwars.com.br/game.php?village=*&screen=barracks*
// @include       https://*.tribalwars.com.br/game.php?village=*&screen=stable*
// @include       https://*.tribalwars.com.br/game.php?village=*&screen=train*
// @grant               GM_getResourceText
// @grant               GM_addStyle
// @grant               GM_getValue
// @grant               GM_setValue
// @grant               unsafeWindow
// @require     https://code.jquery.com/jquery-3.6.0.min.js
// @updateURL    https://raw.githubusercontent.com/Gazeleiro/projetoalbertenobre/refs/heads/main/Recrutamento.js
// @downloadURL  https://raw.githubusercontent.com/Gazeleiro/projetoalbertenobre/refs/heads/main/Recrutamento.js
// ==/UserScript==

(function () {
    'use strict';

    const classEnum = Object.freeze({
        lanca: ".unit_sprite_smaller.spear",
        espada: ".unit_sprite_smaller.sword",
        barbaro: ".unit_sprite_smaller.axe",
        arqueiro: ".unit_sprite_smaller.archer",
        explorador: ".unit_sprite_smaller.spy",
        cavalariaLeve: ".unit_sprite_smaller.light",
        cavalariaArco: ".unit_sprite_smaller.marcher",
        cavalariaPesada: ".unit_sprite_smaller.heavy",
        ariete: ".unit_sprite_smaller.ram",
        catapulta: ".unit_sprite_smaller.catapult"
    });

    const defaultSettings = {
        verifyTroopsMin: 0.1,
        verifyTroopsMax: 0.2,
        reloadPageMin: 1,
        reloadPageMax: 2,
        stayTimeMin: 1,
        stayTimeMax: 2,
        moveVillage: true,
        currentVillageIndex: 0,
        troops: [
            { unitName: "spear", recruitDef: 2, cssClassSelector: classEnum.lanca, maxDef: 2000 }, // Removido recruitAtt, mantido apenas recruitDef
            { unitName: "sword", recruitDef: 2, cssClassSelector: classEnum.espada, maxDef: 2000 }, // Removido recruitAtt, mantido apenas recruitDef
            { unitName: "axe", recruitDef: 0, cssClassSelector: classEnum.barbaro, maxDef: 1000 }, // Removido recruitAtt, mantido apenas recruitDef
            { unitName: "archer", recruitDef: 0, cssClassSelector: classEnum.arqueiro, maxDef: 500 }, // Removido recruitAtt, mantido apenas recruitDef
            { unitName: "spy", recruitDef: 1, cssClassSelector: classEnum.explorador, maxDef: 200 }, // Removido recruitAtt, mantido apenas recruitDef
            { unitName: "light", recruitDef: 0, cssClassSelector: classEnum.cavalariaLeve, maxDef: 500 }, // Removido recruitAtt, mantido apenas recruitDef
            { unitName: "marcher", recruitDef: 0, cssClassSelector: classEnum.cavalariaArco, maxDef: 500 }, // Removido recruitAtt, mantido apenas recruitDef
            { unitName: "heavy", recruitDef: 1, cssClassSelector: classEnum.cavalariaPesada, maxDef: 1000 }, // Removido recruitAtt, mantido apenas recruitDef
            { unitName: "ram", recruitDef: 0, cssClassSelector: classEnum.ariete, maxDef: 100 }, // Removido recruitAtt, mantido apenas recruitDef
            { unitName: "catapult", recruitDef: 0, cssClassSelector: classEnum.catapulta, maxDef: 50 } // Removido recruitAtt, mantido apenas recruitDef
        ]
    };

    let settings = GM_getValue("troopRecruiterSettings", defaultSettings);

    // Funções auxiliares
    function timeBetween(inferior, superior) {
        const numPosibilidades = (superior * 60 * 1000) - (inferior * 60 * 1000);
        const aleat = Math.random() * numPosibilidades;
        return Math.round(parseInt(inferior * 60 * 1000) + aleat);
    }

    function validarPreencher(singleObject, currentCount) {
        let maxTroops = singleObject.maxDef; // Usar apenas maxDef
        const recruitAmount = Math.min(maxTroops - currentCount, singleObject.recruitDef); // Usar apenas recruitDef

        if (recruitAmount > 0) {
            console.log(`[validarPreencher] Recrutando ${recruitAmount} ${singleObject.unitName} (Total: ${currentCount}/${maxTroops})`);
            $(`input[name="${singleObject.unitName}"]`).val(recruitAmount);
            return true;
        }
        console.log(`[validarPreencher] Não é necessário recrutar ${singleObject.unitName} (Total: ${currentCount}/${maxTroops})`);
        return false;
    }
  function getTroopCount(unitName) {
        const troopCountElement = $(`a[data-unit="${unitName}"]`).closest('tr').find('td:eq(2)');
        if (troopCountElement.length) {
            const troopCountText = troopCountElement.text().split('/')[1].trim(); // Pega apenas a parte DEPOIS da barra
            const count = parseInt(troopCountText);
            console.log(`[getTroopCount] Total de ${unitName}: ${count}`);
            return count;
        } else {
            console.log(`[getTroopCount] Não foi possível obter o total de ${unitName}.`);
            return 0;
        }
    }
    function recruitTroops() {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const villageId = urlParams.get('village').replace(/\D/g, '');
        console.log(`[recruitTroops] Verificando Tropas na aldeia ${villageId}`);

        let recruited = false;
        for (const troop of settings.troops) {
            const currentCount = getTroopCount(troop.unitName);
            if (validarPreencher(troop, currentCount)) {
                recruited = true;
            }
        }

        if (recruited) {
            const recruitButton = $(".btn-recruit");
            if (recruitButton.length > 0) {
                console.log(`[recruitTroops] Clicando no botão de recrutar.`);
                recruitButton.click();
            } else {
                console.log("[recruitTroops] Botão de recrutar não encontrado!");
            }
        } else {
            console.log("[recruitTroops] Nenhuma tropa para recrutar.");
        }
        return recruited;
    }
    function getNextVillageId() {
        let allVillages = [];
      if (settings.attackVillages) {
            allVillages = allVillages.concat(settings.attackVillages.split(",").map(v => v.trim()).filter(v => v !== ""));
       }
         if (settings.defenseVillages) {
            allVillages = allVillages.concat(settings.defenseVillages.split(",").map(v => v.trim()).filter(v => v !== ""));
        }

        if (allVillages.length === 0) {
            console.log("[getNextVillageId] Nenhuma aldeia configurada.");
            return null;
        }

       const nextVillageId = allVillages[settings.currentVillageIndex];
        console.log(`[getNextVillageId] Próxima aldeia: ${nextVillageId}`);
        settings.currentVillageIndex = (settings.currentVillageIndex + 1) % allVillages.length;
         GM_setValue("troopRecruiterSettings", settings);
        return nextVillageId;
    }

   function navigateToNextVillage() {
       const nextVillageId = getNextVillageId();
        if (nextVillageId && settings.moveVillage) {
            const nextUrl = `https://br134.tribalwars.com.br/game.php?village=${nextVillageId}&screen=train`;
            console.log(`[navigateToNextVillage] Redirecionando para aldeia: ${nextVillageId}`);
            window.location.href = nextUrl;
        } else if(!nextVillageId){
            console.log("[navigateToNextVillage] Não há aldeias configuradas. O script não fará a troca.");
       }
        else {
            console.log("[navigateToNextVillage] Troca automática de aldeia desabilitada. O script não fará a troca.");
        }
    }

   // interface de configuração
    function createConfigInterface() {
        const configDiv = $(`
            <div id="troopRecruiterConfig" style="position: fixed; top: 50px; left: 50px; background-color: #f0f0f0; padding: 10px; border: 1px solid #ccc; z-index: 1000; display: flex; flex-direction: column;">
                <h3 style="margin-bottom: 10px;">Configurações de Recrutamento</h3>
                <label>Tempo de Verificação (min - max): <input type="number" id="verifyMin" style="width: 50px;" value="${settings.verifyTroopsMin}"> - <input type="number" id="verifyMax" style="width: 50px;" value="${settings.verifyTroopsMax}"></label><br>
                <label>Tempo de Recarga (min - max): <input type="number" id="reloadMin" style="width: 50px;" value="${settings.reloadPageMin}"> - <input type="number" id="reloadMax" style="width: 50px;" value="${settings.reloadPageMax}"></label><br>
                <label>Tempo de Permanência (min - max): <input type="number" id="stayMin" style="width: 50px;" value="${settings.stayTimeMin}"> - <input type="number" id="stayMax" style="width: 50px;" value="${settings.stayTimeMax}"></label><br>
                <label><input type="checkbox" id="moveVillage" ${settings.moveVillage ? 'checked' : ''}> Mover para Próxima Aldeia </label><br>
                <button id="toggleTroopDefaults" style="margin-top: 10px;">Configurar Tropas Padrão</button>
                <div id="troopDefaults" style="display: none;">
                    <h4>Configurações de Tropas Padrão:</h4>
                    <div id="troopsConfig"></div>
                </div>
                <button id="saveSettings" style="margin-top: 10px;">Salvar Configurações</button>
                <button id="closeConfig" style="margin-top: 10px;">Fechar</button>
           </div>
       `);
        configDiv.appendTo('body');
         // Criar campos de texto para cada tropa
        const troopsConfigDiv = $("#troopsConfig");
        settings.troops.forEach(troop => {
            troopsConfigDiv.append(`
                <label style="display: block; margin-bottom: 5px;">
                   ${troop.unitName}: Padrão <input type="number" class="recruitDef" data-troop="${troop.unitName}" value="${troop.recruitDef}" style="width: 50px;">
                    Max <input type="number" class="maxDef" data-troop="${troop.unitName}" value="${troop.maxDef}" style="width: 50px;">
                </label>
            `);
        });

        configDiv.find("#saveSettings").click(() => {
            settings.verifyTroopsMin = parseFloat(configDiv.find("#verifyMin").val());
            settings.verifyTroopsMax = parseFloat(configDiv.find("#verifyMax").val());
            settings.reloadPageMin = parseFloat(configDiv.find("#reloadMin").val());
            settings.reloadPageMax = parseFloat(configDiv.find("#reloadMax").val());
           settings.stayTimeMin = parseFloat(configDiv.find("#stayMin").val());
            settings.stayTimeMax = parseFloat(configDiv.find("#stayMax").val());
            settings.moveVillage = configDiv.find("#moveVillage").is(":checked");
            configDiv.find(".recruitDef").each(function() {
                const troopName = $(this).data("troop");
                const recruitDef = parseInt($(this).val());
               const maxDef = parseInt($(`.maxDef[data-troop="${troopName}"]`).val());
                const troop = settings.troops.find(t => t.unitName === troopName);
                if(troop) {
                    troop.recruitDef = recruitDef;
                    troop.maxDef = maxDef;
                }
            });
           GM_setValue("troopRecruiterSettings", settings);
           alert("Configurações salvas com sucesso!");
            configDiv.hide();
        });

        configDiv.find("#toggleTroopDefaults").click(function() {
            $("#troopDefaults").toggle();
        });

        configDiv.find("#closeConfig").click(() => {
            configDiv.hide();
        });
    }

    $(document).ready(function() {
        // Adicionar botão para abrir configurações
       const configButton = $('<button style="position: fixed; top: 50px; right: 10px; z-index: 10000;">Configurar Recrutamento</button>');
        configButton.appendTo('body').click(() => {
            if($("#troopRecruiterConfig").length)
            {
               $("#troopRecruiterConfig").show();
            }
            else
            {
                createConfigInterface();
           }
       });

        const stayTime = timeBetween(settings.stayTimeMin, settings.stayTimeMax) * 60 * 1000 +  Math.round(Math.random() * 9800);
        const hasRecruited = recruitTroops();

        setTimeout(() => {
            navigateToNextVillage();
        }, stayTime);
    });
})();
