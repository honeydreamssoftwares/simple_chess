import { Room } from "colyseus.js";

export function EndGameButton({ room }:{room:Room}) {
    const handleDestroyRoom = () => {
        // Send a message to the server to destroy the room
        room.send('destroy_room');
        console.log('Request sent to destroy the room.');
    };

    return <button onClick={handleDestroyRoom} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">End Game</button>;
}
