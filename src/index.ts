import express from "express";
import { connectToDatabase } from "./gameService"
import { gamesRouter } from "./gameRoute";

const app = express();

connectToDatabase()
    .then(() => {
        app.use("/games", gamesRouter);

        app.listen(8000, () => {
            console.log(`Server started at http://localhost:${8000}`);
        });
    })
    .catch((error: Error) => {
        console.error("Database connection failed", error);
        process.exit();
    });