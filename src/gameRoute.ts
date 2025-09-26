import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { collections } from "./gameService";
import Game from "./game";

export const gamesRouter = express.Router();

gamesRouter.use(express.json());

gamesRouter.get("/", async (_req: Request, res: Response) => {
    try {
        if (!collections.games) {
            return res.status(500).send("Games collection is not initialized.");
        }
        const docs = await collections.games.find({}).toArray();
        const games: Game[] = docs.map((doc: any) => ({
            _id: doc._id,
            name: doc.name,
            price: doc.price,
            category: doc.category
        }));

        res.status(200).send(games);
    } catch (error) {
        res.status(500).send((error as Error).message);
    }
});


gamesRouter.post("/", async (req: Request, res: Response) => {
    try {
        if (!collections.games) {
            return res.status(500).send("Games collection is not initialized.");
        }
        const newGame = req.body as Game;
        const result = await collections.games.insertOne(newGame);

        result
            ? res.status(201).send(`Successfully created a new game with id ${result.insertedId}`)
            : res.status(500).send("Failed to create a new game.");
    } catch (error) {
        console.error(error);
        res.status(400).send((error as Error).message);
    }
});

gamesRouter.put("/:id", async (req: Request, res: Response) => {
    const id = req?.params?.id;

    try {
        if (!collections.games) {
            return res.status(500).send("Games collection is not initialized.");
        }
        const updatedGame: Game = req.body as Game;
        const query = { _id: new ObjectId(id) };
      
        const result = await collections.games.updateOne(query, { $set: updatedGame });

        result
            ? res.status(200).send(`Successfully updated game with id ${id}`)
            : res.status(304).send(`Game with id: ${id} not updated`);
    } catch (error) {
        res.status(500).send((error as Error).message);
    }
});

gamesRouter.delete("/:id", async (req: Request, res: Response) => {
    const id = req?.params?.id;

    try {
        if (!collections.games) {
            return res.status(500).send("Games collection is not initialized.");
        }
        const query = { _id: new ObjectId(id) };
        const result = await collections.games.deleteOne(query);

        if (result && result.deletedCount) {
            res.status(202).send(`Successfully removed game with id ${id}`);
        } else if (!result) {
            res.status(400).send(`Failed to remove game with id ${id}`);
        } else if (!result.deletedCount) {
            res.status(404).send(`Game with id ${id} does not exist`);
        }
    } catch (error) {
        res.status(500).send((error as Error).message);
    }
});