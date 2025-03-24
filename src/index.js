// src/index.js
import { Theme, Div, Grid, Flex } from "./components/index.js";

// Register components
customElements.define("prop-theme", Theme);
customElements.define("prop-div", Div);
customElements.define("prop-grid", Grid);
customElements.define("prop-flex", Flex);

// Export for non-module usage
window.PropStyle = {
  Theme,
  Div,
  Grid,
  Flex,
};
