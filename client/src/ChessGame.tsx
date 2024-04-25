import { useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import * as Colyseus from "colyseus.js";
//import { Room } from "colyseus.js";
import { Chessboard } from "react-chessboard";
import { ToastContainer, toast } from "react-toastify";
import MoveHistory from "./MoveHistory";
import "./App.css";
import type { MyRoomState } from "../../server/src/rooms/schema/MyRoomState";
import type PlayerMove from "../../server/src/rooms/schema/PlayerMove";

import { ArraySchema } from "@colyseus/schema";

function ChessGame() {
  const [client] = useState(
    new Colyseus.Client(import.meta.env.VITE_SERVER_URL)
  );
  const [room, setRoom] = useState<Colyseus.Room<MyRoomState>>();
  const [error, setError] = useState("");
  const [fen, setFen] = useState(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  );

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

      room.onMessage("game_over", (message) => {
        setGameOver(true);
        setGameResult(`${message.status} - Winner: ${message.winner}`);
        toast.info(`Game Over: ${message.status} - Winner: ${message.winner}`);
      });

      room.onMessage("error", (message) => {
        toast.error(message.message);

        console.log("error", message.message);
      });

      room.onStateChange((state) => {
        console.log(room.name, "has new state:", state);
        setFen(state.fen);
        setMoves(state.moves);
        setTurn(state.turn_of_player);
        setPlayerCount(state.number_of_players);

        //Opponent name
        if (state.number_of_players === 2) {
          state.players.forEach((details, sessionId) => {
            if (sessionId !== room.sessionId) {
              setOpponentName(details.name);
            }
          });
        }

        // Own colour
        state.players.forEach((details, sessionId) => {
          if (sessionId === room.sessionId) {
            setIsWhite(details.color === "white");
            setPlayerColor(details.color);
          }
        });
      });
    }
  }, [room]);

  const connectToRoom = async () => {
    if (!playerName) {
      toast.error("Please enter your name before joining.");
      return;
    }
    try {
      const joinedRoom = await client.joinOrCreate<MyRoomState>("my_room", {
        playerName,
      });
      console.log(joinedRoom.sessionId, "joined", joinedRoom.name);
      setRoom(joinedRoom);
    } catch (e) {
      console.error("JOIN ERROR", e);
      setError("Failed to connect: " + (e as Error).message);
      toast.error("Failed to connect: " + (e as Error).message);
    }
  };

  const onPieceDrop = (sourceSquare: string, targetSquare: string) => {
    console.log(`Piece moved from ${sourceSquare} to ${targetSquare}`);
    if (room) {
      room.send("player_move", {
        from: sourceSquare,
        to: targetSquare,
      });
    }

    return true;
  };

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
      {whosTurnBlock()}
      {versesBlock()}
      <p className="mb-4">
        {gameOver ? `Game Over: ${gameResult}` : "Game is ongoing"}
      </p>
      {!gameOver && (
        <Chessboard
          boardOrientation={isWhite ? "white" : "black"}
          position={fen}
          onPieceDrop={onPieceDrop}
        />
      )}
    </>
  );

  const roomBlock = () => (
    <div className="flex flex-row justify-center items-start space-x-8">
      <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-lg">
        <div>Room ID: {room?.id}</div>
        {isPlayerAlone() ? (
          <p>Waiting for an opponent...</p>
        ) : (
          mainGameAreaBlock()
        )}
      </div>
      <div className="w-64">
        <MoveHistory moves={moves} />
      </div>
    </div>
  );

  const playerEntryBlock = () => (
    <div className="space-y-4">
      <input
        className="border border-gray-300 p-2 w-full rounded"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        placeholder="Enter your name"
      />
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={connectToRoom}
      >
        Play now
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center items-center">
      <h1 className="text-3xl font-bold text-center mb-12">
        Simple Multiplayer Chess
      </h1>
      <div className="w-full max-w-md">
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
