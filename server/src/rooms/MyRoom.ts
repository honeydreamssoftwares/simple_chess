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

  onCreate (options: any) {
    this.setState(new MyRoomState());
    this.chessGame = new Chess();

    this.onMessage("player_move", (client: Client, data: { from: string; to: string }) => {
      try {
          const move = this.chessGame.move({ from: data.from, to: data.to });

          if (move === null) {
              console.log("Illegal move attempted by", client.sessionId);
              const errorMessage =new ErrorMessage(); 
              errorMessage.type="error";
              errorMessage.message="Illegal move!!!";

            // Send the error message to the client
            this.send(client,errorMessage);           
             return; // Do not proceed with updating anything
          }

          // Move is legal, update the FEN in the room state
          this.state.fen = this.chessGame.fen();
          const playerMove = new PlayerMove();
          playerMove.from = data.from;
          playerMove.to = data.to;
          this.state.moves.push(playerMove); // Assuming 'moves' is an array to track history

          // Broadcast updated FEN to all clients
          this.broadcast("update_state", { fen: this.state.fen });
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
