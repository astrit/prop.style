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
    // Apply default styles first
    this.applyDefaultStyles();
    this.updateStyles();
  }

  attributeChangedCallback() {
    this.updateStyles();
  }

  static get observedAttributes() {
    return ["*"];
  }

  applyDefaultStyles() {
    if (this.constructor.defaultStyles) {
      Object.entries(this.constructor.defaultStyles).forEach(
        ([prop, value]) => {
          if (!this.hasAttribute(prop)) {
            this.setAttribute(prop, value);
          }
        }
      );
    }
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
