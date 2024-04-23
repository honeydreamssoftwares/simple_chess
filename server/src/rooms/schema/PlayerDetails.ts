import { Schema, type } from "@colyseus/schema";

export class PlayerDetails extends Schema {
    @type("string") color: string;
}
