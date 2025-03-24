// src/components/Div.js
import { Base } from "./Base.js";

export class Div extends Base {
  constructor() {
    super();
    this.applyDefaultStyles();
  }

  static get defaultStyles() {
    return {
      display: "block",
    };
  }
}
