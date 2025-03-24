// Base class for property components
class PropElement extends HTMLElement {
  constructor() {
    super();
    this.sheet = new CSSStyleSheet();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [this.sheet];
  }

  connectedCallback() {
    this.updateStyles();
  }

  attributeChangedCallback() {
    this.updateStyles();
  }

  static get observedAttributes() {
    return ["*"]; // Observe all attributes
  }

  updateStyles() {
    const styles = Array.from(this.attributes)
      .map((attr) => `${this.kebabCase(attr.name)}: ${attr.value};`)
      .join("\n");

    this.sheet.replaceSync(`:host { ${styles} }`);
  }

  // Convert camelCase to kebab-case
  kebabCase(str) {
    return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
  }
}

// PropDiv component
class PropDiv extends PropElement {
  constructor() {
    super();
    // Create a slot to render children
    const slot = document.createElement("slot");
    this.shadowRoot.appendChild(slot);
  }
}

// PropGrid component
class PropGrid extends PropElement {
  constructor() {
    super();
    // Create a slot to render children
    const slot = document.createElement("slot");
    this.shadowRoot.appendChild(slot);
  }
}

// Register the components
customElements.define("prop-div", PropDiv);
customElements.define("prop-grid", PropGrid);
