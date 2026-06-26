// @ts-expect-error: import html template as text
import template from "./menu.html";

import FilterButtons from "./FilterButtons";
import ContentButtons from "./ContentButtons";
import ToolButtons from "../../enum/TOOL_PRESETS";

import renderButtons from "./renderButtons";
import adjustFontSize from "../../tools/adjustFontSize";
import renderTools from "./renderTools";
import reset from "./reset";

import { ILanguage, LANGUAGES } from "../../i18n/Languages";

import css from "./menu.css";
import enableContrast from "@/tools/enableContrast";
import { pluginConfig } from "@/globals/pluginConfig";
import { userSettings, saveUserSettings } from "@/globals/userSettings";
import { changeLanguage } from "@/i18n/changeLanguage";
import toggleMenu from "./toggleMenu";
import { $widget, updateWidgetStyle } from "../widget/widget";

export default function renderMenu() {
    const $container: HTMLElement = document.createElement("div");
    $container.innerHTML = `<style>${css}</style>` + template;

    const $menu = $container.querySelector(".asw-menu");
    if (pluginConfig?.position?.includes("right")) {
        $menu.style.right = '0px';
        $menu.style.left = 'auto';
    }

    $menu.querySelector(".content").innerHTML = renderButtons(ContentButtons);
    $menu.querySelector(".tools").innerHTML = renderButtons(ToolButtons, 'asw-tools');
    $menu.querySelector(".contrast").innerHTML = renderButtons(FilterButtons, 'asw-filter');

    // *** States UI Rendering ***
    const states = userSettings?.states;

    const fontSize = Number(states?.fontSize) || 1;
    if (fontSize != 1) {
        $menu.querySelector(".asw-amount").innerHTML = `${fontSize * 100}%`;
    }

    if (states) {
        const buttons = Array.from($menu.querySelectorAll('.asw-btn'));

        Object.entries(states).forEach(([key, value]) => {
            if (value && key !== "fontSize") {
                const selector = key === "contrast" ? states[key] : key;
                const btn = buttons.find(b => b.dataset.key === selector);
                if (btn) btn.classList.add("asw-selected");
            }
        });
    }

    // *** Translations ***
    if (!userSettings.lang && pluginConfig?.lang) {
        userSettings.lang = pluginConfig.lang;
    }

    if (!LANGUAGES.some(lang => lang.code === userSettings.lang)) {
        userSettings.lang = "en";
    }

    const $lang = $menu.querySelector("#asw-language");
    const langOptions = LANGUAGES.map((lang: ILanguage) => `<option value="${lang.code}">${lang.label}</option>`).join('');
    $lang.innerHTML = langOptions;
    $lang.value = userSettings.lang;
    $lang.addEventListener("change", (event) => {
        changeLanguage(event.target.value);
    });

    // *** Widget Settings ***
    const $widgetPos = $menu.querySelector("#asw-widget-position");
    const currentPosition = userSettings.position || pluginConfig?.position || "bottom-left";
    const posOptions = [
        { code: "bottom-left", label: "Bottom Left" },
        { code: "bottom-right", label: "Bottom Right" },
        { code: "top-left", label: "Top Left" },
        { code: "top-right", label: "Top Right" },
        { code: "center-left", label: "Center Left" },
        { code: "center-right", label: "Center Right" },
        { code: "bottom-center", label: "Bottom Center" },
        { code: "top-center", label: "Top Center" }
    ].map(pos => `<option value="${pos.code}">${pos.label}</option>`).join('');
    
    $widgetPos.innerHTML = posOptions;
    $widgetPos.value = currentPosition;
    
    $widgetPos.addEventListener("change", (event: Event) => {
        const val = (event.target as HTMLSelectElement).value;
        userSettings.position = val;
        saveUserSettings();
        updateWidgetStyle();
        
        // Dynamically adjust accessibility menu alignment
        if (val.includes("right")) {
            $menu.style.right = '0px';
            $menu.style.left = 'auto';
        } else {
            $menu.style.left = '0px';
            $menu.style.right = 'auto';
        }
    });

    const $widgetMinimize = $menu.querySelector("#asw-widget-minimize");
    const isMinimized = userSettings?.states?.minimized || false;
    $widgetMinimize.value = isMinimized.toString();
    
    $widgetMinimize.addEventListener("change", (event: Event) => {
        const val = (event.target as HTMLSelectElement).value === "true";
        userSettings.states.minimized = val;
        saveUserSettings();
        updateWidgetStyle();
    });

    // *** Utils ***
    $container.querySelectorAll('.asw-menu-close, .asw-overlay').forEach((el) =>
        el.addEventListener('click', toggleMenu)
    );

    $container.querySelectorAll('.asw-menu-reset').forEach((el) =>
        el.addEventListener('click', reset)
    );

    // *** Controls ***
    $menu.querySelectorAll(".asw-plus, .asw-minus").forEach((el: HTMLElement) => {
        el.addEventListener("click", () => {
            const difference = 0.1;

            let fontSize = userSettings?.states?.fontSize || 1;
            if (el.classList.contains('asw-minus')) {
                fontSize -= difference;
            } else {
                fontSize += difference;
            }

            fontSize = Math.max(fontSize, 0.1);
            fontSize = Math.min(fontSize, 2);
            fontSize = Number(fontSize.toFixed(2));

            document.querySelector(".asw-amount").textContent = `${(fontSize * 100).toFixed(0)}%`;

            adjustFontSize(fontSize);
            userSettings.states.fontSize = fontSize;

            saveUserSettings();
        });
    });

    $menu.querySelectorAll(".asw-btn").forEach((el: HTMLElement) => {
        el.addEventListener("click", () => {
            const key = el.dataset.key;
            const isSelected = !el.classList.contains("asw-selected");
            
            // --- Contrast ---
            if (el.classList.contains("asw-filter")) {
                $menu.querySelectorAll(".asw-filter").forEach((el: HTMLElement) =>
                    el.classList.remove("asw-selected")
                );

                if (isSelected) {
                    el.classList.add("asw-selected");
                }

                userSettings.states.contrast = isSelected ? key : false;
                enableContrast(userSettings.states.contrast);

                saveUserSettings();

                return;
            }
            
            el.classList.toggle("asw-selected", isSelected);
            userSettings.states[key] = isSelected;
            renderTools();

            saveUserSettings();
        });
    });

    $widget.appendChild($container);

    return $container;
}