import { Schema, type } from "@colyseus/schema";

class PlayerMove extends Schema {
  @type("string") from: string;
  @type("string") to: string;
}

export default PlayerMove;
