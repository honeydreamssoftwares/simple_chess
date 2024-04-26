import { Schema, type,ArraySchema ,MapSchema  } from "@colyseus/schema";
import PlayerMove from "./PlayerMove";
import { PlayerDetails } from "./PlayerDetails";

export class ChessRoomState extends Schema {

  @type("string") turn_of_player: string = "white"; //White moves by default
  @type("number") number_of_players: number = 0;
  @type("boolean") is_game_running: boolean = true;
  @type("string") game_result_status: string = "";
  @type("string") game_result_winner: string = "";


  @type([PlayerMove]) moves: ArraySchema<PlayerMove> = new ArraySchema<PlayerMove>();
  @type("string")
  fen: string = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"; 


  @type({ map: PlayerDetails })
  players: MapSchema<PlayerDetails> = new MapSchema<PlayerDetails>();

  

}
