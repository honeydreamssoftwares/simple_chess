import React, { useState,useCallback,useEffect } from 'react';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import * as Colyseus from "colyseus.js";
//import MoveEngine from './components/MoveEngine';
import { Room } from "colyseus.js";
import { Chess, Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import {ToastContainer ,toast} from 'react-toastify';


function App() {
  const [client] = useState(new Colyseus.Client('ws://localhost:2567'));
  const [room, setRoom] = useState<Room<unknown> | null>(null);
  const [error, setError] = useState('');
  const [game,setGame] = useState(new Chess());
  const [playerCount, setPlayerCount] = useState(0);

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
    });



    room.onMessage("player_joined", (message) => {
      setPlayerCount(message.numberOfPlayers); // Update player count when new player joins
    });

    room.onMessage("player_left", (message) => {
      setPlayerCount(message.numberOfPlayers); // Update player count when a player leaves
    });


    room.onMessage("game_start", message => {
      console.log(message);
      // Handle game start
  });

  room.onMessage("waiting_for_player", message => {
      console.log(message);
      // Display a message or indicator that the game is waiting for another player
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
    }
  };

    const makeAMove = useCallback((move: { from: string; to: string; promotion?: string }|string) => {
    try {
      const result = game.move(move);
      if (!result) {
        throw new Error('Illegal move');
      }
      setGame(new Chess(game.fen())); // Properly cloning to trigger a React re-render
      return result;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message); // Displaying the error message using react-toastify
      }
      return null; // Return null if the move was illegal or an error occurred
    }
  }, [game]);
 


  const customOnPieceDrop = (sourceSquare:Square, targetSquare:Square) => {
    // Custom logic for handling piece drop
    console.log(`Piece moved from ${sourceSquare} to ${targetSquare}`);

    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: "q" // Always promote to a queen for example simplicity
    };
    const result = makeAMove(move);

    if (result === null) return false; // Illegal move
    
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
            <Chessboard position={game.fen()} onPieceDrop={customOnPieceDrop} />
          )}
        </>
      ) : (
        <button onClick={connectToRoom}>Play now</button>
      )}
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </>
  );
  
}

export default App;
