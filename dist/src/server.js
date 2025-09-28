"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const config_1 = require("./config/config");
const db_1 = require("./database/db");
(0, db_1.connectDB)()
    .then(() => app_1.app.listen(Number(config_1.PORT), "0.0.0.0", () => console.log(`connected to the database successfully ✔️  \n  Listening on port http://localhost:${config_1.PORT}`)))
    .catch((err) => {
    if (err instanceof Error)
        console.error(`ERRR while connecting to the database \n ${err.message}`);
    else
        console.error(`ERRR while connecting to the database \n ${err}`);
    process.exit(1);
});
