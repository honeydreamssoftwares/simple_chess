import { Schema, type,ArraySchema ,MapSchema  } from "@colyseus/schema";
import PlayerMove from "./PlayerMove";
import { PlayerDetails } from "./PlayerDetails";

export class MyRoomState extends Schema {

  @type("string") turn_of_player: string = "white"; //White moves by default
  @type("number") number_of_players: number = 0;

  @type([PlayerMove]) moves: ArraySchema<PlayerMove> = new ArraySchema<PlayerMove>();
  @type("string")
  fen: string = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"; 


  @type({ map: PlayerDetails })
  players: MapSchema<PlayerDetails> = new MapSchema<PlayerDetails>();

  

}
