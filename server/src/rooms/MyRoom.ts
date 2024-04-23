import { Room, Client } from "@colyseus/core";
import { MyRoomState } from "./schema/MyRoomState";
import PlayerMove from "./schema/PlayerMove";

export class MyRoom extends Room<MyRoomState> {
  maxClients = 2;

  onCreate (options: any) {
    this.setState(new MyRoomState());

    this.onMessage("type", (client, message) => {
      //
      // handle "type" message
      //
    });

    this.onMessage("player_move", (client, data) => {
      const move: PlayerMove = this.state.moves;
      move.from=data.from;
      move.to=data.to;
      console.log(client.sessionId + " Moved from  " + move.from, "y: " + move.to);
    });
  }

  onJoin (client: Client, options: any) {
    console.log(client.sessionId, "joined!");
  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
