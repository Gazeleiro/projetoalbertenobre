// ==UserScript==
// @name         AutoFarm AB
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Executa o AutoFarm automaticamente
// @author       GazZeleiro & Albert
// @match        https://*.tribalwars.com.br/*screen=am_farm*
// @updateURL    https://raw.githubusercontent.com/Gazeleiro/projetoalbertenobre/refs/heads/main/AutoFarm-AB.js
// @downloadURL  https://raw.githubusercontent.com/Gazeleiro/projetoalbertenobre/refs/heads/main/AutoFarm-AB.js
// @grant        none
// ==/UserScript==

const SKIP_WALL = false;

(function () {
  'use strict';

  const SmartFarm = new function () {
    const TemplatesEnum = {
      A: 'a',
      B: 'b',
    }

    const delay = (ms) => new Promise((res) => setTimeout(res, ms));

    const randomTime = (min, max) => {
      return Math.round(min + Math.random() * (max - min));
    };

    const getTemplates = () => {
      return Accountmanager.farm.templates;
    };

    const getCurrentUnits = () => {
      return Accountmanager.farm.current_units;
    };

    const getNextVillage = () => {
      // query only rows that are visible!
      return document.querySelector(
        "tr[id^='village_']:not([style='display: none;'])"
      );
    };

    const hasLootedAll = (villageElement) => {
      const lastLoot = villageElement.querySelector("img[src*='max_loot']");
      return lastLoot && lastLoot.getAttribute("src").endsWith("1.png");
    };

    const hasEnoughUnitsInTemplate = (template) => {
      const units = getCurrentUnits();

      for (const unitName in units) {
        if (units.hasOwnProperty(unitName)) {
          const unitQuantity = units[unitName];
          const templateUnitQuantity = template[unitName];

          if (templateUnitQuantity && unitQuantity < templateUnitQuantity) {
            return false;
          }
        }
      }

      return true;
    };

    const getWallLevel = (villageElement) => {
      return (villageElement.querySelectorAll("td")[6]).innerHTML
    }

    const validateAndHideWall = (villageElement) => {
      const wallLevel = getWallLevel(villageElement)
      if (wallLevel !== '?' && parseInt(wallLevel) > 0) {
        villageElement.style.display = 'none';

        return true
      }

      return false
    }

    const clickTemplate = (templateType, villageElement) => {
      const selector = `a.farm_icon.farm_icon_${templateType}`;
      const templateLink = villageElement.querySelector(selector);

      if (templateLink) {
        templateLink.click();
      }
    };

    const validateAndSendTemplate = (template, villageElement, templateType) => {
      if (hasEnoughUnitsInTemplate(template)) {
        clickTemplate(templateType, villageElement);
        return true;
      }
      return false;
    };

    const reloadPage = () => {
      const reloadTime = randomTime(480000, 600000);
      console.log(`will reload em ${reloadTime / 60000} minutos`);
      setTimeout(() => {
        console.log("reloading...");
        location.reload();
      }, reloadTime);
    };

    const sendAttack = async () => {

      const templates = getTemplates();
      if (!templates) return;

      const [templateA, templateB] = Object.values(templates);
      const villageElement = getNextVillage();


      if (villageElement) {
        if (SKIP_WALL) {
          const result = validateAndHideWall(villageElement)
          if (result) return;
        }

        if (hasLootedAll(villageElement)) {
          if (!validateAndSendTemplate(templateB, villageElement, TemplatesEnum.B)) {
            validateAndSendTemplate(templateB, villageElement, TemplatesEnum.B);
          }
        } else {
          validateAndSendTemplate(templateA, villageElement, TemplatesEnum.A);
        }

        const waitTime = randomTime(250, 350);
        await delay(waitTime);
      }
    };


    this.init = async () => {
      console.log("starting farm");

      // start the page reload
      reloadPage();

      setInterval(async () => {
        await sendAttack();
      }, 600)
    };

  };

  $(function () {
    if (typeof Accountmanager !== 'undefined' && Accountmanager.farm) {
      Accountmanager.farm.init();
      SmartFarm.init();
    } else {
      console.error('Accountmanager or farm not defined');
    }
  });
        function altAldeia() {
        //$('.arrowRight').click();
        $('.groupRight').click();
        //location.reload();
    }

    setInterval(altAldeia, 180000);
})();
