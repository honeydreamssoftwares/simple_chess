import { Schema, type, ArraySchema } from "@colyseus/schema";
import PlayerMove from "./PlayerMove";
import ErrorMessage from "./ErrorMessage";
export class MyRoomState extends Schema {

  @type("string") mySynchronizedProperty: string = "Hello world";
  @type([PlayerMove]) moves: ArraySchema<PlayerMove> = new ArraySchema<PlayerMove>();
  @type("string")
  fen: string = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"; 

  @type(ErrorMessage) errormessage=new (ErrorMessage)

  

}
