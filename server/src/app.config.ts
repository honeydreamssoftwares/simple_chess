import config from "@colyseus/tools";
import { monitor } from "@colyseus/monitor";
import { playground } from "@colyseus/playground";

/**
 * Import  Room files
 */
import { ChessGameRoom } from "./rooms/ChessGameRoom";
import { BotClient } from "./bots/botClient";



export default config({

    initializeGameServer: (gameServer) => {
        /**
         * Define  room handlers:
         */
        gameServer.define('chess_room', ChessGameRoom);

    },

    initializeExpress: (app) => {
        /**
         * Bind your custom express routes here:
         * Read more: https://expressjs.com/en/starter/basic-routing.html
         */


        app.post('/add-bot/:roomId', async (req, res) => {
            try {
                const roomId = req.params.roomId;
                
                    const bot = new BotClient();
                    await bot.joinRoom(roomId);
                    res.send({ success: true, message: 'Bot added successfully.' });
            
            } catch (error) {

                console.log(error as Error);

                if (error instanceof Error) {

                res.status(500).send({ success: false, message: error.message });
                }
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
