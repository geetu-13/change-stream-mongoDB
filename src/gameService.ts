import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";

export const collections: { games?: mongoDB.Collection, gamesV2?: mongoDB.Collection } = {}

export async function connectToDatabase () {
   dotenv.config();

   const client: mongoDB.MongoClient = new mongoDB.MongoClient("<CONNECTION_STRING>");
           
   await client.connect();
       
   const db: mongoDB.Db = client.db("<DATABASE_NAME>");
  
   const gamesCollection: mongoDB.Collection = db.collection("<COLLECTION_NAME>");
   const gamesCollectionV2: mongoDB.Collection = db.collection("<COLLECTION_NAME_V2>");

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