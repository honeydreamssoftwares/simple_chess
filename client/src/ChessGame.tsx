import { useState, useEffect } from "react";
import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import * as Colyseus from "colyseus.js";
import { Room } from "colyseus.js";
import { Chess, Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import { ToastContainer, toast } from "react-toastify";
import MoveHistory from "./MoveHistory";

interface PlayerNameInfo {
  id: string;  // The session ID of the player
  name: string;  // The name of the player
}



function ChessGame() {
  const [client] = useState(
    new Colyseus.Client(import.meta.env.VITE_SERVER_URL)
  );
  const [room, setRoom] = useState<Room<unknown> | null>(null);
  const [error, setError] = useState("");
  const [game, setGame] = useState(new Chess());
  const [playerCount, setPlayerCount] = useState(0);
  const [isWhite, setIsWhite] = useState(true); // True if this client plays as White
  const [turn, setTurn] = useState("white");
  const [playerColor, setPlayerColor] = useState("");
  const [moves, setMoves] = useState([]); 
  const [playerName, setPlayerName] = useState("");
  const [opponentName, setOpponentName] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState("");

  useEffect(() => {
    if (room) {
      room.onStateChange((state) => {
        console.log(room.name, "has new state:", state);
      });

      room.onMessage("update_state", (message) => {
        console.log("updating_ game", message);
        setGame(new Chess(message.fen));
        setTurn(message.turn);
        setMoves(message.moves); 
      });

      room.onMessage("player_joined", (message) => {
        setPlayerCount(message.numberOfPlayers);
      });

      room.onMessage("player_left", (message) => {
        setPlayerCount(message.numberOfPlayers);
      });

      room.onMessage("game_start", (message) => {
        console.log(message);
        toast.info("Game Started..");
      });

      room.onMessage("waiting_for_player", (message) => {
        console.log(message);
        toast.info("Waiting for player..");
      });

      room.onMessage("color_assignment", (message) => {
        setIsWhite(message.color === "white");

        setPlayerColor(message.color);
        console.log("player_colour", message.color);
      });
      room.onMessage("error", (message) => {
        toast.error(message.message);

        console.log("error", message.message);
      });

      room.onMessage("game_over", (message) => {
        setGameOver(true);
        setGameResult(`${message.status} - Winner: ${message.winner}`);
        toast.info(`Game Over: ${message.status} - Winner: ${message.winner}`);
      });

      room.onMessage<PlayerNameInfo[]>("names_update", (message) => {
        console.log("names_update",message);
        message.forEach(n => {
          if (n.id !== room.sessionId) {  
            setOpponentName(n.name);
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
      const joinedRoom = await client.joinOrCreate("my_room", { playerName });
      console.log(joinedRoom.sessionId, "joined", joinedRoom.name);
      setRoom(joinedRoom);
    } catch (e) {
      console.error("JOIN ERROR", e);
      setError("Failed to connect: " + (e as Error).message);
      toast.error("Failed to connect: " + (e as Error).message);
    }
  };

  const onPieceDrop = (sourceSquare: Square, targetSquare: Square) => {
 
    console.log(`Piece moved from ${sourceSquare} to ${targetSquare}`);
    if (room) {
      room.send("player_move", {
        from: sourceSquare,
        to: targetSquare,
      });
    }

    return true; 
  };

  const isPlayerAlone=()=>{
    return (playerCount < 2 ? true:false)
  }

  const errorBlock=()=>{
    return <p className="error" >{error}</p>
  }

  const whosTurnBlock=()=>{
    return (
      <p>
        {turn === playerColor
          ? "It's your turn!"
          : "Waiting for opponent's move..."}
      </p>
    )}
  

    const versesBlock=()=>{
      return <div>Game : {playerName} vs {opponentName}</div>
    }


    const mainGameAreaBlock=()=>{
      return     (        <>
      {whosTurnBlock()}
      {versesBlock()}
      <p>{gameOver ? `Game Over: ${gameResult}` : "Game is ongoing"}</p>
      {!gameOver && (
        <Chessboard
          boardOrientation={isWhite ? "white" : "black"}
          position={game.fen()}
          onPieceDrop={onPieceDrop}
        />
      )}
    </>)
    }




  const roomBlock=()=>{

    if(!room){
      return;
    }

    return (
      <div className="game-container">
        <div className="chessboard-container">
          <div>Room ID: {room.id}</div>
          {isPlayerAlone() ? (
            <p>Waiting for an opponent...</p>
          ) : (
            <>
              {mainGameAreaBlock()}
            </>
          )}
        </div>
        <div className="move-history-container">
          <MoveHistory moves={moves} />
        </div>
      </div>
    )
  }


  const playerEntryBlock=()=>{

    return         <>
    <input
      value={playerName}
      onChange={(e) => setPlayerName(e.target.value)}
      placeholder="Enter your name"
    />
    <button onClick={connectToRoom}>Play now</button>
  </>
  }

  return (
    <>
      <h1>Simple Multiplayer Chess</h1>
      <p className="read-the-docs">Simple way to play chess online</p>

      {errorBlock()}

      {room ? roomBlock(): (playerEntryBlock())}
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
    </>
  );
}

export default ChessGame;
