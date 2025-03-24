// src/theme/ThemeManager.js
import { TokenManager } from "../tokens/TokensManager.js";

export class ThemeManager {
  constructor() {
    this.sheet = new CSSStyleSheet();
    this.tokenManager = new TokenManager();
    this.mode = this.getInitialMode();
    this.updateTheme();
    this.setupColorSchemeListener();
  }

  getInitialMode() {
    const stored = localStorage.getItem("theme-mode");
    if (stored) return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  setupColorSchemeListener() {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (!localStorage.getItem("theme-mode")) {
          this.mode = e.matches ? "dark" : "light";
          this.updateTheme();
        }
      });
  }

  setMode(mode) {
    this.mode = mode;
    localStorage.setItem("theme-mode", mode);
    this.updateTheme();
  }

  toggleMode() {
    this.setMode(this.mode === "light" ? "dark" : "light");
  }

  updateTheme() {
    const cssVars = Object.entries(this.tokenManager.tokens).reduce(
      (acc, [category, values]) => {
        Object.entries(values).forEach(([key, value]) => {
          if (typeof value === "object") {
            acc[`--${category}-${key}`] = value[this.mode];
          } else {
            acc[`--${category}-${key}`] = value;
          }
        });
        return acc;
      },
      {}
    );

    const cssString = Object.entries(cssVars)
      .map(([key, value]) => `${key}: ${value};`)
      .join("\n");

    this.sheet.replaceSync(`
      :root { 
        color-scheme: ${this.mode};
        ${cssString}
      }
    `);

    document.documentElement.setAttribute("data-theme", this.mode);
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.content = this.tokenManager.getToken(
        "colors",
        "background"
      )[this.mode];
    }
  }

  setToken(category, key, value) {
    this.tokenManager.setToken(category, key, value);
    this.updateTheme();
  }

  setTokens(newTokens) {
    this.tokenManager.setTokens(newTokens);
    this.updateTheme();
  }

  mergeTokens(newTokens) {
    this.tokenManager.mergeTokens(newTokens);
    this.updateTheme();
  }
}

// src/components/Base.js
export class Base extends HTMLElement {
  constructor() {
    super();
    this.sheet = new CSSStyleSheet();
    this._shadow = this.attachShadow({ mode: "closed" });
    this._shadow.adoptedStyleSheets = [this.sheet];

    const slot = document.createElement("slot");
    this._shadow.appendChild(slot);
  }

  static get tokenMapping() {
    return {
      color: "colors",
      background: "colors",
      "background-color": "colors",
      padding: "spacing",
      margin: "spacing",
      gap: "spacing",
      "border-radius": "radius",
    };
  }

  connectedCallback() {
    this.updateStyles();
  }

  attributeChangedCallback() {
    this.updateStyles();
  }

  static get observedAttributes() {
    return ["*"];
  }

  updateStyles() {
    const theme = document.querySelector("prop-theme");
    const tokens = theme?.themeManager?.tokenManager?.tokens;

    const styles = Array.from(this.attributes)
      .map((attr) => {
        const prop = this.kebabCase(attr.name);
        let value = attr.value;

        const tokenCategory = this.constructor.tokenMapping[prop];
        if (tokenCategory && tokens?.[tokenCategory]?.[value]) {
          value = `var(--${tokenCategory}-${value})`;
        }

        return `${prop}: ${value};`;
      })
      .join("\n");

    this.sheet.replaceSync(`:host { ${styles} }`);
  }

  kebabCase(str) {
    return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
  }

  setStyle(property, value) {
    this.setAttribute(property, value);
  }

  removeStyle(property) {
    this.removeAttribute(property);
  }
}
