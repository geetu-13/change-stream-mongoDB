import {MongoClient, Db, Collection} from "mongodb";
import * as dotenv from "dotenv";

export const collections: { games?: Collection, gamesV2?: Collection } = {}

export const client: MongoClient = new MongoClient("mongodb+srv://test:test@cluster0.tolbz0l.mongodb.net/");

export async function connectToDatabase () {
   dotenv.config();

   await client.connect();
       
   const db: Db = client.db("ATLAS_SEARCH");
  
   const gamesCollection: Collection = db.collection("game-v1");
   const gamesCollectionV2: Collection = db.collection("game-v2");

   collections.games = gamesCollection;
   collections.gamesV2 = gamesCollectionV2; 
   console.log(`Successfully connected to database: ${db.databaseName} and collection: ${gamesCollection.collectionName}`);

    let changeStream = collections.games.watch();
    
    changeStream.on("change", (next) => {
        console.log(next);
        if (next.operationType === 'insert') {
            const game = next.fullDocument;
            console.log(`New game inserted: ${game.name}, Price: ${game.price}, Category: ${game.category}`);
            collections.gamesV2?.insertOne(game);
        } else if (next.operationType === 'update') {
            console.log(`Game updated with id: ${next.documentKey._id}`);
            collections.games?.findOne(next.documentKey).then(updatedGame => {
                if (updatedGame) {
                    collections.gamesV2?.updateOne(
                        { _id: updatedGame._id },
                        { $set: { name: updatedGame.name, price: updatedGame.price, category: updatedGame.category } }
                    );
                }
            });
        } else if (next.operationType === 'delete') {
            console.log(`Game deleted with id: ${next.documentKey._id}`);
            collections.gamesV2?.deleteOne(next.documentKey);
        }   
    });
}


export async function closeDatabaseConnection () {
    if (client) {
        await client.close();
        console.log('MongoDB connection closed.');
    }
}