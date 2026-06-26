import { saveUserSettings, userSettings } from "@/globals/userSettings";
import runAccessibility from "./runAccessibility";
import { updateWidgetStyle } from "../widget/widget";
import { pluginConfig } from "@/globals/pluginConfig";

export default function reset() {
    document?.querySelectorAll(".asw-selected")?.forEach(el => el?.classList?.remove("asw-selected"))

    userSettings.states = {};
    userSettings.position = undefined;
    runAccessibility();

    updateWidgetStyle();

    // Reset UI dropdowns
    const $widgetPos: HTMLSelectElement = document.querySelector("#asw-widget-position");
    if ($widgetPos) {
        $widgetPos.value = pluginConfig?.position || "bottom-left";
    }
    const $widgetMinimize: HTMLSelectElement = document.querySelector("#asw-widget-minimize");
    if ($widgetMinimize) {
        $widgetMinimize.value = "false";
    }

    saveUserSettings();
}