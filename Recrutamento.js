// ==UserScript==
// @name         Script de Recrutamento de Tropas
// @namespace    http://tampermonkey.net/
// @version      4.2
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

    // ==== ESTILO BONITO ====
    GM_addStyle(`
    #troopRecruiterConfig {
        position: fixed !important;
        top: 68px !important;
        left: 50% !important;
        transform: translateX(-50%);
        background: rgba(36,33,30,0.97) !important;
        border: 2px solid #af8e58 !important;
        padding: 22px 30px 20px 30px !important;
        border-radius: 12px !important;
        box-shadow: 0 0 18px 0 #000a, 0 1px 2px 0 #af8e5833;
        font-family: 'Verdana', serif !important;
        font-size: 15px !important;
        color: #f2e7c9 !important;
        min-width: 320px;
        max-width: 390px;
        z-index: 99999 !important;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }
    #troopRecruiterConfig h3 {
        font-size: 19px !important;
        color: #ffe8a0 !important;
        margin-bottom: 16px !important;
        font-weight: bold !important;
        letter-spacing: .7px;
    }
    #troopRecruiterConfig label {
        display: block;
        margin-bottom: 7px !important;
        color: #f2e7c9 !important;
        font-size: 15px;
    }
    #troopRecruiterConfig input[type="number"] {
        background: #403930;
        color: #f2e7c9;
        border: 1px solid #665c4a;
        border-radius: 6px;
        padding: 3px 8px;
        width: 60px;
        font-size: 15px;
        margin: 0 6px 0 4px;
    }
    #troopRecruiterConfig input[type="checkbox"] {
        accent-color: #af8e58;
        width: 19px; height: 19px;
        margin-right: 6px;
    }
    #troopRecruiterConfig button {
        margin-top: 11px;
        padding: 8px 20px;
        border: none;
        border-radius: 8px;
        background: #af8e58;
        color: #1e1400;
        font-weight: bold;
        font-size: 15px;
        cursor: pointer;
        box-shadow: 0 0 7px #c8a97044;
        transition: background 0.15s, color 0.13s;
        margin-right: 7px;
        margin-bottom: 3px;
    }
    #troopRecruiterConfig button:hover {
        background: #ffe8a0;
        color: #6b4e1e;
    }
    #troopRecruiterConfig #toggleTroopDefaults {
        background: #37270b;
        color: #ffe8a0;
        border: 1px solid #af8e58;
        font-size: 15px;
        margin-top: 14px;
    }
    #troopRecruiterConfig #toggleTroopDefaults:hover {
        background: #4d370d;
        color: #ffdc89;
    }
    #troopRecruiterConfig #troopDefaults {
        background: #29241b;
        border-radius: 8px;
        margin-top: 11px;
        margin-bottom: 7px;
        padding: 10px 15px;
        width: 100%;
        color: #e4c67d;
        border: 1px solid #af8e5828;
        box-shadow: 0 0 7px #40393033 inset;
    }
    #troopRecruiterConfig h4 {
        color: #ffe8a0;
        margin-bottom: 8px;
        margin-top: 0px;
        font-size: 15px;
        font-weight: bold;
        letter-spacing: .3px;
    }
    #troopRecruiterConfig .troopInputGroup {
        margin-bottom: 7px;
        display: flex;
        align-items: center;
    }
    #troopRecruiterConfig .troopInputGroup input[type="number"] {
        width: 55px;
        margin-left: 4px;
        margin-right: 9px;
    }
    #troopRecruiterConfig .troopInputGroup span {
        min-width: 82px;
        display: inline-block;
        text-transform: capitalize;
        color: #fffbe2;
        font-size: 14px;
        font-weight: bold;
        letter-spacing: .5px;
    }
    `);

    // Resto igual
    function getWorldId() {
        const match = window.location.hostname.match(/^(br\d+)\.tribalwars\.com\.br$/i);
        return match ? match[1] : "default";
    }
    function getSettingsKey() {
        return `troopRecruiterSettings_${getWorldId()}`;
    }

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
            { unitName: "spear", recruitDef: 10, cssClassSelector: classEnum.lanca, maxDef: 10000 },
            { unitName: "sword", recruitDef: 10, cssClassSelector: classEnum.espada, maxDef: 10000 },
            { unitName: "axe", recruitDef: 0, cssClassSelector: classEnum.barbaro, maxDef: 1000 },
            { unitName: "archer", recruitDef: 0, cssClassSelector: classEnum.arqueiro, maxDef: 500 },
            { unitName: "spy", recruitDef: 0, cssClassSelector: classEnum.explorador, maxDef: 120 },
            { unitName: "light", recruitDef: 0, cssClassSelector: classEnum.cavalariaLeve, maxDef: 500 },
            { unitName: "marcher", recruitDef: 0, cssClassSelector: classEnum.cavalariaArco, maxDef: 500 },
            { unitName: "heavy", recruitDef: 0, cssClassSelector: classEnum.cavalariaPesada, maxDef: 1000 },
            { unitName: "ram", recruitDef: 0, cssClassSelector: classEnum.ariete, maxDef: 100 },
            { unitName: "catapult", recruitDef: 0, cssClassSelector: classEnum.catapulta, maxDef: 50 }
        ]
    };

    let settings = GM_getValue(getSettingsKey(), defaultSettings);

    // Funções auxiliares
    function timeBetween(inferior, superior) {
        const numPosibilidades = (superior * 60 * 1000) - (inferior * 60 * 1000);
        const aleat = Math.random() * numPosibilidades;
        return Math.round(parseInt(inferior * 60 * 1000) + aleat);
    }

    function validarPreencher(singleObject, currentCount) {
        let maxTroops = singleObject.maxDef;
        const recruitAmount = Math.min(maxTroops - currentCount, singleObject.recruitDef);

        if (recruitAmount > 0) {
            $(`input[name="${singleObject.unitName}"]`).val(recruitAmount);
            return true;
        }
        return false;
    }
    function getTroopCount(unitName) {
        const troopCountElement = $(`a[data-unit="${unitName}"]`).closest('tr').find('td:eq(2)');
        if (troopCountElement.length) {
            const troopCountText = troopCountElement.text().split('/')[1].trim();
            const count = parseInt(troopCountText);
            return count;
        } else {
            return 0;
        }
    }
    function recruitTroops() {
        let recruited = false;
        for (const troop of settings.troops) {
            const currentCount = getTroopCount(troop.unitName);
            if (validarPreencher(troop, currentCount)) {
                recruited = true;
            }
        }
        if (recruited) {
            const recruitButton = $(".btn-recruit");
            if (recruitButton.length > 0) recruitButton.click();
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
            return null;
        }

        const nextVillageId = allVillages[settings.currentVillageIndex];
        settings.currentVillageIndex = (settings.currentVillageIndex + 1) % allVillages.length;
        GM_setValue(getSettingsKey(), settings);
        return nextVillageId;
    }

    function navigateToNextVillage() {
        const nextVillageId = getNextVillageId();
        if (nextVillageId && settings.moveVillage) {
            const nextUrl = `https://br134.tribalwars.com.br/game.php?village=${nextVillageId}&screen=train`;
            window.location.href = nextUrl;
        }
    }

    // interface de configuração (PAINEL BONITO)
    function createConfigInterface() {
        // remove anterior
        $("#troopRecruiterConfig").remove();

        const configDiv = $(`
            <div id="troopRecruiterConfig">
                <h3>Configurações de Recrutamento</h3>
                <label>Tempo de Verificação (min - max):
                    <input type="number" id="verifyMin" value="${settings.verifyTroopsMin}" step="0.01" min="0.01">
                    -
                    <input type="number" id="verifyMax" value="${settings.verifyTroopsMax}" step="0.01" min="0.01">
                </label>
                <label>Tempo de Recarga (min - max):
                    <input type="number" id="reloadMin" value="${settings.reloadPageMin}" step="0.01" min="0.01">
                    -
                    <input type="number" id="reloadMax" value="${settings.reloadPageMax}" step="0.01" min="0.01">
                </label>
                <label>Tempo de Permanência (min - max):
                    <input type="number" id="stayMin" value="${settings.stayTimeMin}" step="0.01" min="0.01">
                    -
                    <input type="number" id="stayMax" value="${settings.stayTimeMax}" step="0.01" min="0.01">
                </label>
                <label><input type="checkbox" id="moveVillage" ${settings.moveVillage ? 'checked' : ''}> Mover para Próxima Aldeia </label>
                <button id="toggleTroopDefaults">Configurar Tropas Padrão</button>
                <div id="troopDefaults" style="display: none;">
                    <h4>Tropas Padrão:</h4>
                    <div id="troopsConfig"></div>
                </div>
                <div style="display:flex;">
                    <button id="saveSettings">Salvar Configurações</button>
                    <button id="closeConfig">Fechar</button>
                </div>
            </div>
        `);
        configDiv.appendTo('body');
        // campos de texto para cada tropa
        const troopsConfigDiv = $("#troopsConfig");
        settings.troops.forEach(troop => {
            troopsConfigDiv.append(`
                <div class="troopInputGroup">
                    <span>${troop.unitName}:</span>
                    Padrão <input type="number" class="recruitDef" data-troop="${troop.unitName}" value="${troop.recruitDef}">
                    Max <input type="number" class="maxDef" data-troop="${troop.unitName}" value="${troop.maxDef}">
                </div>
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
            configDiv.find(".recruitDef").each(function () {
                const troopName = $(this).data("troop");
                const recruitDef = parseInt($(this).val());
                const maxDef = parseInt($(`.maxDef[data-troop="${troopName}"]`).val());
                const troop = settings.troops.find(t => t.unitName === troopName);
                if (troop) {
                    troop.recruitDef = recruitDef;
                    troop.maxDef = maxDef;
                }
            });
            GM_setValue(getSettingsKey(), settings);
            configDiv.find("#saveSettings").text("Salvo!").css("background","#ffe8a0").css("color","#36260b");
            setTimeout(()=>configDiv.find("#saveSettings").text("Salvar Configurações").removeAttr("style"),1100);
            configDiv.hide(400);
        });

        configDiv.find("#toggleTroopDefaults").click(function () {
            $("#troopDefaults").slideToggle();
        });

        configDiv.find("#closeConfig").click(() => {
            configDiv.hide(400);
        });
    }

    $(document).ready(function () {
        // Adicionar botão para abrir configurações
        const configButton = $('<button style="position: fixed; top: 50px; right: 10px; z-index: 10000; background: #37270b; color: #ffe8a0; border: 2px solid #af8e58; border-radius: 10px; padding: 8px 16px; font-size: 15px; font-weight: bold; cursor: pointer; box-shadow: 0 0 6px #af8e5833;">Configurar Recrutamento</button>');
        configButton.appendTo('body').click(() => {
            if ($("#troopRecruiterConfig").length) {
                $("#troopRecruiterConfig").show(200);
            }
            else {
                createConfigInterface();
            }
        });

        const stayTime = timeBetween(settings.stayTimeMin, settings.stayTimeMax) * 60 * 1000 + Math.round(Math.random() * 9800);
        const hasRecruited = recruitTroops();

        setTimeout(() => {
            navigateToNextVillage();
        }, stayTime);
    });
})();
