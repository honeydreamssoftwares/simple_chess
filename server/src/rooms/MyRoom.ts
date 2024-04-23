import { Schema } from '@colyseus/schema';
import { Room, Client } from "@colyseus/core";
import { MyRoomState } from "./schema/MyRoomState";
import PlayerMove from "./schema/PlayerMove";
import { Chess } from "chess.js"; 
import { type, ArraySchema } from "@colyseus/schema";
import { PlayerDetails } from './schema/PlayerDetails';



export class MyRoom extends Room<MyRoomState> {
  private chessGame: Chess;
  maxClients = 2;
  private moveTimeout: NodeJS.Timeout | null = null;


  onCreate (options: any) {
    this.setState(new MyRoomState());
    this.chessGame = new Chess();


    this.onMessage("player_move", (client: Client, data: { from: string; to: string }) => {
      try {

        const playerDetails = this.state.players.get(client.sessionId);
        console.log("turn",this.chessGame.turn(),playerDetails.color)
        const currentPlayerColor = this.chessGame.turn() === 'w' ? 'white' : 'black';

        if (!playerDetails || playerDetails.color !== currentPlayerColor) {
    
          client.send("error",{message:"Not your turn!"});
            return;
        }

        if (this.moveTimeout) {
          clearTimeout(this.moveTimeout);  
        }


          const move = this.chessGame.move({ from: data.from, to: data.to });

          if (move === null) {
              console.log("Illegal move attempted by", client.sessionId);
           

              client.send("error",{message:"Illegal move!!!"});
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
          client.send("error",{message:"Failed to process the move!"});
        }
  });
}
  onJoin (client: Client, options : { playerName: string }) {
    console.log(client.sessionId, "joined with name:", options.playerName);

    const playerDetails = new PlayerDetails();
        playerDetails.color = this.clients.length === 1 ? 'white' : 'black';
        playerDetails.name=options.playerName;
        this.state.players.set(client.sessionId, playerDetails);
    if (this.clients.length === 1) {
      client.send("color_assignment", { color: "white" });
    } else {
      client.send("color_assignment", { color: "black" });
    }
  
    this.broadcast("player_joined", {
       sessionId: client.sessionId, 
       name: options.playerName,
       numberOfPlayers: this.clients.length
       });

       if (this.clients.length === 2) {
        const names = this.clients.map(c => ({
          id: c.sessionId,
          name: this.state.players.get(c.sessionId).name
        }));
        console.log("names_update", names);
        this.broadcast("names_update", names);
      }
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
