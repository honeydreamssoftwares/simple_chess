import { Room } from 'colyseus.js';
import { Chess } from 'chess.js';

export class BotClient {
    private chess;
    private room:Room;
    constructor() {
        this.chess = new Chess();
    }

    async joinRoom(room:Room) {
        this.room = room;
        console.log(`Bot has joined the room: ${this.room.roomId}`);

        // Set up a generic handler for all messages (if needed)
        this.room.onMessage("*", (type, message) => {
            console.log(`Received message of type ${type}:`, message);
        });

        // Specific message handlers
        this.room.onMessage("fen", (newFen) => {
            console.log("FEN updated:", newFen);
            this.chess.load(newFen);
            this.makeMove();
        });

        this.room.onMessage("game_over", (message) => {
            console.log("Game over message:", message);
        });
    }

    makeMove() {
        const moves = this.chess.moves();
        if (moves.length > 0 && this.chess.turn() === 'b') {  // Assuming bot plays as black
            const move = moves[Math.floor(Math.random() * moves.length)];
            this.chess.move(move);
            this.room.send('move', {
                from: move.slice(0, 2),
                to: move.slice(2, 4),
                promotion: 'q'  // Assume promotion to queen
            });
        }
    }
}
