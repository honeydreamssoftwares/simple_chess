import { Room, Client } from "@colyseus/core";
import { ChessRoomState } from "./schema/ChessRoomState";
import PlayerMove from "./schema/PlayerMove";
import { Chess } from "chess.js";
import { PlayerDetails } from "./schema/PlayerDetails";

export class ChessGameRoom extends Room<ChessRoomState> {
  private chessGame: Chess;
  maxClients = 2;
  private moveTimeout: NodeJS.Timeout | null = null;
  private timeOutMillisec = 100000;

  areBothPlayersAvailable(): boolean {
    return this.clients.length === 2;
  }

  currentNumberOfPlayers(): number {
    return this.clients.length;
  }

  getAllPayersDetails() {
    return this.clients.map((c) => ({
      id: c.sessionId,
      name: this.state.players.get(c.sessionId).name,
    }));
  }

  //Events

  onCreate(options: any) {
    this.setState(new ChessRoomState());
    this.chessGame = new Chess();

    this.onMessage("destroy_room", (client, message) => {
      console.log("Room is being destroyed by the creator.");
      this.disconnect(); 
    });

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
          const move = this.chessGame.move({
            from: data.from,
            to: data.to,
            promotion: "q",
          });

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
          this.state.turn_of_player =
            this.chessGame.turn() === "w" ? "white" : "black";

          // Set a timeout to enforce move timer
          this.moveTimeout = setTimeout(() => {
            console.log("processing time draw");
            this.state.is_game_running = false;
            this.state.game_result_status = "Draw";
            this.state.game_result_winner = "";
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
      this.state.game_result_status = "Checkmate";
      this.state.game_result_winner =
        this.chessGame.turn() === "w" ? "Black" : "White";
    } else if (
      this.chessGame.isDraw() ||
      this.chessGame.isStalemate() ||
      this.chessGame.isThreefoldRepetition() ||
      this.chessGame.isInsufficientMaterial()
    ) {
      this.state.game_result_status = "Draw";
    }

    if (this.state.game_result_status) {
      this.state.is_game_running = false;
      //this.disconnect();
    }
  }
  onJoin(client: Client, options: { playerName: string }) {
    console.log(client.sessionId, "joined with name:", options.playerName);

    const playerDetails = new PlayerDetails();
    playerDetails.color =
      this.currentNumberOfPlayers() === 1 ? "white" : "black";
    playerDetails.name = options.playerName;
    //Save state
    this.state.players.set(client.sessionId, playerDetails);
    this.state.number_of_players = this.currentNumberOfPlayers();
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    if (this.clients.length < 2) {
      this.broadcast(
        "waiting_for_player",
        "Waiting for another player to join."
      );
    }

    this.state.number_of_players = this.currentNumberOfPlayers();
  }
  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
