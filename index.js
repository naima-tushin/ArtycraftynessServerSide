const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.t1oof5v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri);
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const database = client.db("CraftDB");
        const craftCollection = database.collection("crafts");
        const craftSubCategoryCollection = database.collection("craftSubcategory");

        app.get('/craft', async (req, res) => {
            const cursor = craftCollection.find();
            const result = await cursor.toArray();
            res.send(result);

        });
        app.get('/craftSubcategory', async (req, res) => {
            const cursor = craftSubCategoryCollection.find();
            const result = await cursor.toArray();
            res.send(result);

        });

        app.get('/craft/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await craftCollection.findOne(query);
            res.send(result);
        });
        app.get('/myCraft/:userEmail', async (req, res) => {
            const userEmail = req.params.userEmail;
            const query = { userEmail: userEmail }; // Assuming 'userEmail' is the field name
            const cursor = craftCollection.find(query);
            const results = await cursor.toArray();
            res.send(results);
        });
        

        app.post('/craft', async (req, res) => {
            const craft = req.body;
            console.log('new craft', craft);
            const result = await craftCollection.insertOne(craft);
            res.send(result);
        });

        app.put('/craft/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id)}
            const options = { upsert: true };
            const updatedCraft = req.body;
            const craft = {
                $set: {
                    name: updatedCraft.name, 
                    imageUrl: updatedCraft.imageUrl, subcategoryName: updatedCraft.subcategoryName, 
                    shortDescription: updatedCraft.shortDescription, 
                    price: updatedCraft.price, 
                    rating: updatedCraft.rating, 
                    customization: updatedCraft.customization, processingTime: updatedCraft.processingTime, 
                    stockStatus: updatedCraft.stockStatus,
                }
            }
            const result = await craftCollection.updateOne(filter, craft, options);
            res.send(result);
        });

        app.delete('/craft/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await craftCollection.deleteOne(query);
            res.send(result);
        });



        // // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Users Management Server is Running')
})




app.listen(port, () => {
    console.log(`Server is Running on PORT: ${port}`)
})