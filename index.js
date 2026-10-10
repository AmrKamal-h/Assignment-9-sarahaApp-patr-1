import bootstrap from "./src/bootstrap.js";
import { encryption } from "./src/security/encrption.js";



bootstrap()


console.log({enc: encryption("amr")});
