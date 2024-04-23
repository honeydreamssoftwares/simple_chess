import { Room, Client } from "@colyseus/core";
import { MyRoomState } from "./schema/MyRoomState";
import PlayerMove from "./schema/PlayerMove";
import { Chess } from "chess.js"; 
export class MyRoom extends Room<MyRoomState> {
  private chessGame: Chess;
  maxClients = 2;

  onCreate (options: any) {
    this.setState(new MyRoomState());
    this.chessGame = new Chess();

    this.onMessage("type", (client, message) => {
      //
      // handle "type" message
      //
    });

    this.onMessage("player_move", (client, data) => {
      const move = this.chessGame.move({ from: data.from, to: data.to });

      if (move === null) {
        console.log("Illegal move attempted by", client.sessionId);
        return; // Illegal move, don't update anything
      }

      // Move is legal, update the FEN in the room state
      this.state.fen = this.chessGame.fen();
      const playerMove = new PlayerMove();
      this.state.moves.from= data.from;
      this.state.moves.to = data.to;
     ;

      // Broadcast updated FEN to all clients
      this.broadcast("update_state", { fen: this.state.fen });
    });
  }
  onJoin (client: Client, options: any) {
    console.log(client.sessionId, "joined!");
    this.broadcast("player_joined", { sessionId: client.sessionId, numberOfPlayers: this.clients.length });
  }
  
  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    if (this.clients.length < 2) {
      this.broadcast("waiting_for_player", "Waiting for another player to join.");
  }

    this.broadcast("player_left", { sessionId: client.sessionId, numberOfPlayers: this.clients.length - 1 });
  }
  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
