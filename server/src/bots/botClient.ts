import { Room,Client  } from 'colyseus.js';
import { Chess } from 'chess.js';
import { ChessRoomState } from '../rooms/schema/ChessRoomState';

export class BotClient {
    private chess;
    private room:Room<ChessRoomState>;
    private client:Client;
    constructor() {
        this.chess = new Chess();
        this.client = new Client("http://localhost:2567");

    }

    async joinRoom(room:Room<ChessRoomState>) {
        this.room = await this.client.joinById(room.roomId);
        console.log(`Bot has joined the room: ${this.room.roomId}`);

        // Set up a generic handler for all messages (if needed)
        this.room.onMessage("*", (type, message) => {
            console.log(`Received message of type ${type}:`, message);
        });

        this.room.state.listen("turn_of_player", (currentValue) => {
            console.log(`Bot Turn of now ${currentValue}`);
            //update fen
            const fen=this.room.state.fen;
            console.log("current_fen",fen);
            this.chess.load(fen);
            if(currentValue==='black'){
                this.makeMove();

            }
          });
    }

    makeMove() {
        const moves = this.chess.moves();
        if (moves.length > 0 && this.chess.turn() === 'b') {  // Assuming bot plays as black
            const move = moves[Math.floor(Math.random() * moves.length)];
            this.chess.move(move);
            this.room.send('player_move', {
                from: move.slice(0, 2),
                to: move.slice(2, 4),
                promotion: 'q'  // Assume promotion to queen
            });
        }
    }
}
