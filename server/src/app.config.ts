import config from "@colyseus/tools";
import { monitor } from "@colyseus/monitor";
import { playground } from "@colyseus/playground";

/**
 * Import your Room files
 */
import { ChessGameRoom } from "./rooms/ChessGameRoom";
import { BotClient } from "./bots/botClient";


const roomsById = new Map();

export default config({

    initializeGameServer: (gameServer) => {
        /**
         * Define your room handlers:
         */
        gameServer.define('chess_room', ChessGameRoom).on("create", (room) => {
            // When a room is created, add it to the map
            roomsById.set(room.roomId, room);
            room.on("dispose", () => {
                // Remove the room from the map when it is disposed
                roomsById.delete(room.roomId);
            });
        });

            gameServer.onShutdown(() => {
                console.log("Server is shutting down.");
                roomsById.clear();
            });

    },

    initializeExpress: (app) => {
        /**
         * Bind your custom express routes here:
         * Read more: https://expressjs.com/en/starter/basic-routing.html
         */
        app.get("/hello_world", (req, res) => {
            res.send("Hello deploy");
        });

        app.post('/add-bot/:roomId', async (req, res) => {
            try {
                const roomId = req.params.roomId;
                const room = roomsById.get(roomId);                ;
                if (room) {
                    const bot = new BotClient();
                    await bot.joinRoom(room);
                    res.send({ success: true, message: 'Bot added successfully.' });
                } else {
                    res.status(404).send({ success: false, message: 'Room not found.' });
                }
            } catch (error) {

                //res.status(500).send({ success: false, message: error.message });
            }
        });

      

        /**
         * Use @colyseus/playground
         * (It is not recommended to expose this route in a production environment)
         */
        if (process.env.NODE_ENV !== "production") {
            app.use("/", playground);
        }

        /**
         * Use @colyseus/monitor
         * It is recommended to protect this route with a password
         * Read more: https://docs.colyseus.io/tools/monitor/#restrict-access-to-the-panel-using-a-password
         */
        app.use("/colyseus", monitor());
    },


    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});
