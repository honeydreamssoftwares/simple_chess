import { Room, Client } from "@colyseus/core";
import { MyRoomState } from "./schema/MyRoomState";
import PlayerMove from "./schema/PlayerMove";
import { Chess } from "chess.js";
import { PlayerDetails } from "./schema/PlayerDetails";

export class MyRoom extends Room<MyRoomState> {
  private chessGame: Chess;
  maxClients = 2;
  private moveTimeout: NodeJS.Timeout | null = null;
  private timeOutMillisec = 300000;


  areBothPlayersAvailable():boolean{
    return this.clients.length === 2;
  }

  currentNumberOfPlayers():number{
    return this.clients.length;
  }

  getAllPayersDetails(){
  return this.clients.map((c) => ({
    id: c.sessionId,
    name: this.state.players.get(c.sessionId).name,
  }));
  }


  //Events

  onCreate(options: any) {
    this.setState(new MyRoomState());
    this.chessGame = new Chess();

    this.onMessage(
      "player_move",
      (client: Client, data: { from: string; to: string }) => {
        try {
          //Check if the player has turn
          const playerDetails = this.state.players.get(client.sessionId);
          console.log("turn", this.chessGame.turn(), playerDetails.color);
          const currentPlayerColor =
            this.chessGame.turn() === "w" ? "white" : "black";

          if (!playerDetails || playerDetails.color !== currentPlayerColor) {
            client.send("error", { message: "Not your turn!" });
            return;
          }

          //Reset move timeout
          if (this.moveTimeout) {
            clearTimeout(this.moveTimeout);
          }

          //Attemt to move peice
          const move = this.chessGame.move({ from: data.from, to: data.to });

          if (move === null) {
            console.log("Illegal move attempted by", client.sessionId);

            client.send("error", { message: "Illegal move!!!" });
            return;
          }

          //Check if this move does not Clears the game state
          this.checkGameStatus(client);

          // Move is legal, update the FEN in the room state
          this.state.fen = this.chessGame.fen();
          const playerMove = new PlayerMove();
          playerMove.from = data.from;
          playerMove.to = data.to;
          playerMove.san = move.san;
          //Save list of moves
          this.state.moves.push(playerMove);

          // Broadcast updated FEN/Turn/Moves to all clients
          this.broadcast("update_state", {
            fen: this.chessGame.fen(),
            turn: this.chessGame.turn() === "w" ? "white" : "black",
            moves: this.state.moves.map((m) => m.san),
          });

          // Set a timeout to enforce move timer
          this.moveTimeout = setTimeout(() => {
            const gameResult = {
              winner: "",
              status: "",
              fen: this.chessGame.fen(),
            };
            gameResult.status = "Draw";
            gameResult.winner =
              this.chessGame.turn() === "w" ? "Black" : "White";
            this.broadcast("game_over", gameResult);

            this.broadcast(
              "move_timeout",
              "Player did not make a move in time."
            );
          }, this.timeOutMillisec);
        } catch (error) {
          console.error("Error processing move:", error);
          client.send("error", { message: "Failed to process the move!" });
        }
      }
    );
  }

  checkGameStatus(client: Client) {
    const gameResult = { winner: "", status: "", fen: this.chessGame.fen() };

    if (this.chessGame.isCheckmate()) {
      gameResult.winner = this.chessGame.turn() === "w" ? "Black" : "White";
      gameResult.status = "Checkmate";
    } else if (
      this.chessGame.isDraw() ||
      this.chessGame.isStalemate() ||
      this.chessGame.isThreefoldRepetition() ||
      this.chessGame.isInsufficientMaterial()
    ) {
      gameResult.status = "Draw";
    }

    if (gameResult.status) {
      this.broadcast("game_over", gameResult);
      this.state.fen = this.chessGame.fen();
      this.broadcast("update_state", this.state);
      this.disconnect();
    }
  }
  onJoin(client: Client, options: { playerName: string }) {
    console.log(client.sessionId, "joined with name:", options.playerName);


    const playerDetails = new PlayerDetails();
    playerDetails.color = this.currentNumberOfPlayers() === 1 ? "white" : "black";
    playerDetails.name = options.playerName;
    //Save state
    this.state.players.set(client.sessionId, playerDetails);
    client.send("color_assignment", { color: playerDetails.color  });
   

    //Every time a player joins inform both of the number of players
    this.broadcast("player_joined", {
      numberOfPlayers: this.currentNumberOfPlayers(),
    });

    if (this.areBothPlayersAvailable()) {
      const names = this.getAllPayersDetails();
      console.log("names_update", names);
      this.broadcast("names_update", names);
    }
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    if (this.clients.length < 2) {
      this.broadcast(
        "waiting_for_player",
        "Waiting for another player to join."
      );
    }

    this.broadcast("player_left", {
      sessionId: client.sessionId,
      numberOfPlayers: this.clients.length - 1,
    });
  }
  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
