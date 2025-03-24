// src/tokens/defaultTokens.js
export const defaultTokens = {
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

// src/tokens/TokenManager.js
export class TokenManager {
  constructor(initialTokens = defaultTokens) {
    this.tokens = { ...initialTokens };
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
