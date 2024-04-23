import { Schema } from '@colyseus/schema';
import { Room, Client } from "@colyseus/core";
import { MyRoomState } from "./schema/MyRoomState";
import PlayerMove from "./schema/PlayerMove";
import { Chess } from "chess.js"; 
import { type, ArraySchema } from "@colyseus/schema";
import ErrorMessage from "./schema/ErrorMessage";



export class MyRoom extends Room<MyRoomState> {
  private chessGame: Chess;
  maxClients = 2;
  private moveTimeout: NodeJS.Timeout | null = null;


  onCreate (options: any) {
    this.setState(new MyRoomState());
    this.chessGame = new Chess();


    this.onMessage("player_move", (client: Client, data: { from: string; to: string }) => {
      try {

        if (this.moveTimeout) {
          clearTimeout(this.moveTimeout);  
        }


          const move = this.chessGame.move({ from: data.from, to: data.to });

          if (move === null) {
              console.log("Illegal move attempted by", client.sessionId);
              const errorMessage =new ErrorMessage(); 
              errorMessage.type="error";
              errorMessage.message="Illegal move!!!";

            this.send(client,errorMessage);           
             return; 
          }

          // Move is legal, update the FEN in the room state
          this.state.fen = this.chessGame.fen();
          const playerMove = new PlayerMove();
          playerMove.from = data.from;
          playerMove.to = data.to;
          playerMove.san = move.san; 
          this.state.moves.push(playerMove); 

          // Broadcast updated FEN to all clients
          this.broadcast("update_state", {
            fen: this.chessGame.fen(),
            turn: this.chessGame.turn() === 'w' ? 'white' : 'black',
            moves: this.state.moves.map(m => m.san) 
          });

          // Set a timeout to enforce move timer
        this.moveTimeout = setTimeout(() => {
          // Code to handle timeout scenario, e.g., force a move, end the game, etc.
          this.broadcast("move_timeout", "Player did not make a move in time.");
        }, 10000); // 10 seconds timeout
        
        } catch (error) {
          console.error("Error processing move:", error);

          const errorMessage =new ErrorMessage(); 
          errorMessage.type="error";
          errorMessage.message="Failed to process the move!";
          this.send(client, errorMessage);
      }
  });
}
  onJoin (client: Client, options: any) {
    console.log(client.sessionId, "joined!");
    if (this.clients.length === 1) {
      client.send("color_assignment", { color: "white" });
    } else {
      client.send("color_assignment", { color: "black" });
    }
  
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
