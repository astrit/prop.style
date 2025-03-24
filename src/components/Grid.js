// src/components/Grid.js
import { Base } from "./Base.js";

export class Grid extends Base {
  constructor() {
    super();
    this.applyDefaultStyles();
  }

  static get defaultStyles() {
    return {
      display: "grid",
    };
  }
}
