// src/components/Theme.js
import { ThemeManager } from "../theme/ThemeManager.js";

export class Theme extends HTMLElement {
  constructor() {
    super();
    this.themeManager = new ThemeManager();
    document.adoptedStyleSheets = [
      ...document.adoptedStyleSheets,
      this.themeManager.sheet,
    ];
  }

  static get observedAttributes() {
    return ["mode", "token-colors", "token-spacing", "token-radius", "token"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!newValue || oldValue === newValue) return;

    if (name === "mode") {
      this.themeManager.setMode(newValue);
    } else if (name === "token") {
      const [path, value] = newValue.split(":");
      const [category, key] = path.split(".");
      if (category && key && value) {
        try {
          const parsedValue = value.startsWith("{") ? JSON.parse(value) : value;
          this.themeManager.setToken(category, key, parsedValue);
        } catch (e) {
          console.warn(`Invalid token value: ${value}`, e);
        }
      }
    } else if (name.startsWith("token-")) {
      try {
        const category = name.replace("token-", "");
        const tokens = JSON.parse(newValue);
        this.themeManager.mergeTokens({ [category]: tokens });
      } catch (e) {
        console.warn(`Invalid token value for ${name}`, e);
      }
    }
  }

  toggleMode() {
    this.themeManager.toggleMode();
    this.setAttribute("mode", this.themeManager.mode);
  }
}
