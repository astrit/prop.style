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
