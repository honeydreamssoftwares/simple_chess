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

    async joinRoom(roomId:string) {
        this.room = await this.client.joinById(roomId,{playerName:"Chess Bot"});
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
        const moves = this.chess.moves({ verbose: true });
        console.log("Available moves:", moves);
        if (moves.length > 0 && this.chess.turn() === 'b') {  // Assuming the bot plays as black
            const validMoves = moves.filter(m => m.to); // Filter out any moves where 'to' is falsy, assuming falsy values are invalid
            if (validMoves.length > 0) {
                const move = validMoves[Math.floor(Math.random() * validMoves.length)];
                this.chess.move({ from: move.from, to: move.to, promotion: 'q' }); // Execute the move
                console.log(`Bot moved from ${move.from} to ${move.to}`);
    
                // Send the move to the Colyseus server
                this.room.send('player_move', {
                    from: move.from,
                    to: move.to,
                    promotion: 'q'  // Assume promotion to queen for simplicity
                });
            } else {
                console.error("No valid moves available");
            }
        }
    }
    
    
    
}
