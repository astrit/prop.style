// tokens.js
class TokenManager {
  constructor() {
    this.tokens = {
      colors: {
        primary: {
          light: "#0066cc",
          dark: "#66b3ff",
        },
        secondary: {
          light: "#4c4c4c",
          dark: "#b3b3b3",
        },
        background: {
          light: "#ffffff",
          dark: "#1a1a1a",
        },
        text: {
          light: "#000000",
          dark: "#ffffff",
        },
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
      },
      radius: {
        none: "0",
        sm: "4px",
        md: "8px",
        lg: "16px",
        full: "9999px",
      },
    };
  }

  setToken(category, key, value) {
    if (!this.tokens[category]) {
      this.tokens[category] = {};
    }
    this.tokens[category][key] = value;
  }

  setTokens(newTokens) {
    this.tokens = {
      ...this.tokens,
      ...newTokens,
    };
  }

  getToken(category, key) {
    return this.tokens[category]?.[key];
  }

  mergeTokens(newTokens) {
    Object.entries(newTokens).forEach(([category, values]) => {
      if (!this.tokens[category]) {
        this.tokens[category] = {};
      }
      this.tokens[category] = {
        ...this.tokens[category],
        ...values,
      };
    });
  }
}

// theme.js
class ThemeManager {
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

// base.js
class Base extends HTMLElement {
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
    const styles = Array.from(this.attributes)
      .map((attr) => {
        const prop = this.kebabCase(attr.name);
        let value = attr.value;

        const tokenCategory = this.constructor.tokenMapping[prop];
        if (tokenCategory && tokens[tokenCategory]?.[value]) {
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

// components.js
class Theme extends HTMLElement {
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

class Div extends Base {
  static get defaultStyles() {
    return {
      display: "block",
    };
  }
}

class Grid extends Base {
  static get defaultStyles() {
    return {
      display: "grid",
    };
  }
}

class Flex extends Base {
  static get defaultStyles() {
    return {
      display: "flex",
    };
  }
}

// Register components
customElements.define("prop-theme", Theme);
customElements.define("prop-div", Div);
customElements.define("prop-grid", Grid);
customElements.define("prop-flex", Flex);
