import  { useState,useEffect } from 'react';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import * as Colyseus from "colyseus.js";
//import MoveEngine from './components/MoveEngine';
import { Room } from "colyseus.js";
import { Chess, Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import {ToastContainer ,toast} from 'react-toastify';


function ChessGame() {
  const [client] = useState(new Colyseus.Client(import.meta.env.VITE_SERVER_URL));
  const [room, setRoom] = useState<Room<unknown> | null>(null);
  const [error, setError] = useState('');
  const [game,setGame] = useState(new Chess());
  const [playerCount, setPlayerCount] = useState(0);
  const [isWhite, setIsWhite] = useState(true); // True if this client plays as White
  const [turn, setTurn] = useState('white');
  const [playerColor, setPlayerColor] = useState('');

  useEffect(() => {
    if (room) {
      room.onStateChange((state) => {
        console.log(room.name, "has new state:", state);
      });
      room.onMessage("*", (type, message) => {
        //
        // Triggers when any other type of message is sent,
        // excluding "action", which has its own specific handler defined above.
        //
        console.log("sent", type, message);
    });


    room.onMessage("update_state", (message) => {
      console.log("updating_ game",message);
      setGame(new Chess(message.fen));
      setTurn(message.turn);

    });



    room.onMessage("player_joined", (message) => {
      setPlayerCount(message.numberOfPlayers); 
    });

    room.onMessage("player_left", (message) => {
      setPlayerCount(message.numberOfPlayers); 
    });


    room.onMessage("game_start", message => {
      console.log(message);
      toast.info("Game Started..");
  });

  room.onMessage("waiting_for_player", message => {
      console.log(message);
      toast.info("Waiting for player..");
  });

  room.onMessage("color_assignment", (message) => {
    setIsWhite(message.color === "white");
    
    setPlayerColor(message.color);
    console.log("player_colour",message.color);
  });
  
    }


    

  }, [room]);

  

  const connectToRoom = async () => {
    try {
      const joinedRoom = await client.joinOrCreate("my_room");
      console.log(joinedRoom.sessionId, "joined", joinedRoom.name);
      setRoom(joinedRoom);

    } catch (e) {
      console.error("JOIN ERROR", e);
      setError("Failed to connect: " + (e as Error).message);
      toast.error("Failed to connect: " + (e as Error).message);

    }
  };

    
 


  const customOnPieceDrop = (sourceSquare:Square, targetSquare:Square) => {
    // Custom logic for handling piece drop
    console.log(`Piece moved from ${sourceSquare} to ${targetSquare}`);
    if(room){
      room.send("player_move",{
        from:sourceSquare,
        to:targetSquare
      })
    }

    return true;  // You need to manage game state or any other operations needed
  };
  return (
    <>
      <h1>Simple Multiplayer Chess</h1>
      <p className="read-the-docs">
        Simple way to play chess online
      </p>
  
      {error && <p className="error">{error}</p>}
  
      {room ? (
        <>
          <div>Room ID: {room.id}</div>
          {playerCount < 2 ? (
            <p>Waiting for an opponent...</p>
          ) : (
            <>
            {playerColor && (
              <p>{turn === playerColor ? "It's your turn!" : "Waiting for opponent's move..."}</p>
            )}
            <Chessboard 
            boardOrientation={isWhite ? 'white' : 'black'} position={game.fen()} onPieceDrop={customOnPieceDrop} />

            </>
          )}
        </>
      ) : (
        <button onClick={connectToRoom}>Play now</button>
      )}
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </>
  );
  
}

export default ChessGame;
