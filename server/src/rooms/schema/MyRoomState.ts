import { Schema, type, ArraySchema } from "@colyseus/schema";
import PlayerMove from "./PlayerMove";

export class MyRoomState extends Schema {

  @type("string") mySynchronizedProperty: string = "Hello world";
  @type(PlayerMove) moves: PlayerMove = new PlayerMove();


}
