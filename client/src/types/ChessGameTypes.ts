export interface PlayerNameInfo {
    id: string;  // The session ID of the player
    name: string;  // The name of the player
  }
  
 export interface ChessMove {
    from: string;
    to: string;
    san: string; // Standard Algebraic Notation for the move
  }
  
  // Define the type for a player
  export interface Player {
    color: 'white' | 'black'; 
    name: string;
  }
  
  // Define the main state of the room
  export interface RoomState {
    mySynchronizedProperty: string;
    moves: ChessMove[];
    fen: string; // The current position of the game in FEN notation
    players: Record<string, Player>; // Using a Record to map session IDs to players;
    turn_of_player:string;
    number_of_players:number;
  }
  
  