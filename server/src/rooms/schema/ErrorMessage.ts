import { Schema, type } from "@colyseus/schema";

class ErrorMessage extends Schema {
    @type("string")
      type: string;
  
      @type("string")
      message: string;
  }

  export default ErrorMessage;