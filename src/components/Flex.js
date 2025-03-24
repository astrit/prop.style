// src/components/Flex.js
import { Base } from "./Base.js";

export class Flex extends Base {
  constructor() {
    super();
    this.applyDefaultStyles();
  }

  static get defaultStyles() {
    return {
      display: "flex",
    };
  }
}
