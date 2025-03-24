// src/theme/ThemeManager.js
import { TokenManager } from "../tokens/TokenManager.js";

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
        font-family: sans-serif;
      }

      * {
        box-sizing: border-box;
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
