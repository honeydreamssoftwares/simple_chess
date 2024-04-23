import React, { useState } from 'react';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import * as Colyseus from "colyseus.js";
import MoveEngine from './components/MoveEngine';
import { Room } from "colyseus.js";


function App() {
  const [client] = useState(new Colyseus.Client('ws://localhost:2567'));
  const [room, setRoom] = useState<Room<unknown> | null>(null);
  const [error, setError] = useState('');

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

  return (
    <>
      <h1>Simple Multiplayer Chess</h1>
      <p className="read-the-docs">
        Simple way to play chess online
      </p>

      {error && <p className="error">{error}</p>}

      {room ? (
        <>Room ID {room.id}
        <MoveEngine  /> 
        </>
      ) : (
        <button onClick={connectToRoom}>Play now</button>
      )}
    </>
  );
}

export default App;
