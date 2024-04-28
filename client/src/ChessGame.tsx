import { useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import { Chess, Square } from "chess.js";
import * as Colyseus from "colyseus.js";
//import { Room } from "colyseus.js";
import { Chessboard } from "react-chessboard";
import { ToastContainer, toast } from "react-toastify";
import MoveHistory from "./MoveHistory";
import "./App.css";

//Import server states
import type { ChessRoomState } from "../../server/src/rooms/schema/ChessRoomState";
import type PlayerMove from "../../server/src/rooms/schema/PlayerMove";

import { ArraySchema } from "@colyseus/schema";
import InviteBotButton from "./InviteBotButton";
import { EndGameButton } from "./EndGameButton";

function ChessGame() {
  const [client] = useState(
    new Colyseus.Client(import.meta.env.VITE_SERVER_URL)
  );
  const [room, setRoom] = useState<Colyseus.Room<ChessRoomState>>();
  const [error, setError] = useState("");
  const [game, setGame] = useState(new Chess());

  const [playerCount, setPlayerCount] = useState(0);
  const [isWhite, setIsWhite] = useState(true); // True if this client plays as White
  const [turn, setTurn] = useState("white");
  const [playerColor, setPlayerColor] = useState("");
  const [moves, setMoves] = useState<ArraySchema<PlayerMove> | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [opponentName, setOpponentName] = useState<string>("");
  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState("");

  useEffect(() => {
    if (room) {
      room.onMessage("game_start", (message) => {
        console.log(message);
        toast.info("Game Started..");
      });

      room.onMessage("waiting_for_player", (message) => {
        console.log(message);
        toast.info("Waiting for player..");
      });

      room.onMessage("error", (message) => {
        toast.error(message.message);

        console.log("error", message.message);
      });

      room.state.listen("turn_of_player", (currentValue) => {
        console.log(`current value is now ${currentValue}`);
        console.log(room.state);
        setTurn(currentValue);
      });

      room.state.listen("number_of_players", (currentValue) => {
        console.log(`current value is now ${currentValue}`);
        setPlayerCount(currentValue);
      });

      room.state.listen("fen", (currentValue) => {
        console.log(`current value is now ${currentValue}`);
        setGame(new Chess(currentValue));
      });

      room.state.moves.onAdd((currentValue) => {
        console.log(`Moves current value is now ${currentValue}`);
        setMoves(new ArraySchema<PlayerMove>(...room.state.moves));
      });

      room.state.listen("number_of_players", (currentValue) => {
        console.log(`current value is now ${currentValue}`);

        //Self details
        room.state.players.forEach((details, sessionId) => {
          if (sessionId === room.sessionId) {
            setIsWhite(details.color === "white");
            setPlayerColor(details.color);
          }
        });

        //Opponent name
        if (currentValue === 2) {
          room.state.players.forEach((details, sessionId) => {
            if (sessionId !== room.sessionId) {
              setOpponentName(details.name);
            }
          });
        }
      });

      room.state.listen("is_game_running", (currentValue) => {
        console.log(`current value is now ${currentValue}`);
        //Game over
        if (currentValue === false) {
          //Game is over now
          setGameOver(true);
          //Since draw has no winner
          let winner = "No One";
          if (room.state.game_result_winner !== "") {
            winner = room.state.game_result_winner;
          }
          setGameResult(room.state.game_result_status + "  Winner:" + winner);
        }
      });
    }
  }, [room]);

  const connectToRoom = async () => {
    if (!playerName) {
      toast.error("Please enter your name before joining.");
      return;
    }
    try {
      const joinedRoom = await client.joinOrCreate<ChessRoomState>(
        "chess_room",
        {
          playerName,
        }
      );
      console.log(joinedRoom.sessionId, "joined", joinedRoom.name);
      setRoom(joinedRoom);
    } catch (e) {
      console.error("JOIN ERROR", e);
      setError("Failed to connect: " + (e as Error).message);
      toast.error("Failed to connect: " + (e as Error).message);
    }
  };
  

  function onPieceDropCallback(sourceSquare: Square, targetSquare: Square) {
    console.log(`Piece moved from ${sourceSquare} to ${targetSquare}`);
    try {
      
     

      if (room) {
        //Send the move change to server
        room.send("player_move", {
          from: sourceSquare,
          to: targetSquare,
        });

        game.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q",
        });
  
        const newGame = new Chess(game.fen());
  
        setGame(newGame);
        console.log("setting game state")
      }

      return true;
    } catch (e) {
    //  toast.error((e as Error).message);

      console.log(e);
      return false;
    }
  }

  const isPlayerAlone = () => {
    return playerCount < 2 ? true : false;
  };
  const errorBlock = () =>
    error && <p className="text-red-500 text-center">{error}</p>;

  const whosTurnBlock = () => (
    <p
      className={`text-lg font-semibold ${
        turn === playerColor ? "text-green-500" : "text-red-500"
      }`}
    >
      {turn === playerColor
        ? "It's your turn!"
        : "Waiting for opponent's move..."}
    </p>
  );

  const versesBlock = () => (
    <div className="text-lg font-bold text-blue-800 mb-4">
      Game: {playerName} vs {opponentName}
    </div>
  );

  const mainGameAreaBlock = () => (
    <>
         { console.log("rendering... state")}

      {whosTurnBlock()}
      {versesBlock()}
      <p className="mb-4">
        {gameOver ? `Game Over: ${gameResult}` : "Game is ongoing"}
      </p>
      {!gameOver && (
        <Chessboard
          boardOrientation={isWhite ? "white" : "black"}
          position={game.fen()}
          onPieceDrop={onPieceDropCallback}
        />
      )}
    </>
  );

  const roomBlock = () => (
    <div className="columns-lg space-x-8">
      <div className="columns-xs	 bg-white p-6 rounded-lg shadow-lg">
        <div className="">Room ID: {room?.id}</div>
        {isPlayerAlone() ? (
          <>
            <p>Waiting for an opponent...</p>{" "}
            <InviteBotButton roomId={room.id} />
          </>
        ) : (
          mainGameAreaBlock()
        )}
      </div>
      <div className="columns-xs	">
        <MoveHistory moves={moves} />
        <EndGameButton room={room}></EndGameButton>
      </div>
    </div>
  );

  const playerEntryBlock = () => (
    <div className="space-y-4 flex flex-col justify-center items-center content-center	 ">
      <div className="flex flex-row">
        <input
          className="border border-gray-300 p-2 w-full rounded"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Choose your nick name"
        />
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={connectToRoom}
        >
          Start♔
        </button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto font-serif	">
      <div className="flex flex-col items-center p-4">
        <h1 className="text-3xl font-bold text-center p-4">
          ♞Simple Mu♟︎tiplayer Chess
        </h1>
        <p>- Play with random people</p>
        <p>- Play with a Bot</p>
      </div>
      <div className="">
        {errorBlock()}
        {room ? roomBlock() : playerEntryBlock()}
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default ChessGame;
