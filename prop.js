// tokens.js
const tokens = {
  colors: {
    primary: {
      light: "#0066cc",
      dark: "#66b3ff",
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
    sm: "8px",
    md: "16px",
    lg: "24px",
  },
  radius: {
    sm: "4px",
    md: "8px",
    lg: "16px",
  },
};

// theme.js
class ThemeManager {
  constructor() {
    this.sheet = new CSSStyleSheet();
    this.mode = "light";
    this.updateTheme();
  }

  toggleMode() {
    this.mode = this.mode === "light" ? "dark" : "light";
    this.updateTheme();
  }

  updateTheme() {
    const cssVars = Object.entries(tokens).reduce((acc, [category, values]) => {
      Object.entries(values).forEach(([key, value]) => {
        if (typeof value === "object") {
          acc[`--${category}-${key}`] = value[this.mode];
        } else {
          acc[`--${category}-${key}`] = value;
        }
      });
      return acc;
    }, {});

    const cssString = Object.entries(cssVars)
      .map(([key, value]) => `${key}: ${value};`)
      .join("\n");

    this.sheet.replaceSync(`:root { ${cssString} }`);
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
      padding: "spacing",
      margin: "spacing",
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
    return ["mode"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "mode" && oldValue !== newValue) {
      this.themeManager.mode = newValue;
      this.themeManager.updateTheme();
    }
  }
}

// Define all components
customElements.define("x-div", Div);
customElements.define("x-grid", Grid);
customElements.define("x-flex", Flex);
customElements.define("x-theme", Theme);
