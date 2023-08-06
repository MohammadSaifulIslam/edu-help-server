const express = require("express");
const cors = require("cors");
require("dotenv").config();

const port = process.env.PORT || 5000;
const app = express();

// midlewire
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kgqetuh.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const collegeCollection = client.db("eduHelpDb").collection("colleges");
    const usersCollection = client.db("eduHelpDb").collection("users");
    const admissionCollection = client.db("eduHelpDb").collection("admission");
    const researchCollection = client.db("eduHelpDb").collection("researches");
    const reviewCollection = client.db("eduHelpDb").collection("reviews");

    // save user's information
    app.put("/users/:email", async (req, res) => {
      const user = req.body;
      const email = req.params.email;

      const query = { email: email };
      const options = { upsert: true };
      const updateUser = {
        $set: {
          ...user,
        },
      };

      const isExist = await usersCollection.findOne(query);
      if (isExist) {
        return;
      } else {
        const result = await usersCollection.updateOne(user, updateUser, options);
        res.send(result);
      }
    });

    // get all college
    app.get("/colleges", async (req, res) => {
      const result = await collegeCollection.find().toArray();
      res.send(result);
    });

    // single college details
    app.get("/colleges/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await collegeCollection.findOne(query);
      res.send(result);
    });

    // ----------------admission apis---------------------
    app.post("/apply-form", async (req, res) => {
      const applyInfo = req.body;
      console.log(applyInfo);
      const result = await admissionCollection.insertOne(applyInfo);
      res.send(result);
    });

    app.get('/admission/:id', async (req, res)=> {
      const {id} = req.params;
      const query = {_id : new ObjectId(id)}
      const result = await admissionCollection.findOne(query);
      res.send(result)
    })


    app.get('/my-colleges/:email', async(req,res)=> {
      const {email} = req.params;
      const query = {email: email}
      const result = await admissionCollection.find(query).toArray();
      res.send(result);
    })


    // -------------------research apis------------------- 
    app.get('/researches', async(req,res)=>{
      const result = await researchCollection.find().toArray();
      res.send(result);
    })

    app.get('/research/:id', async(req,res)=>{
      const {id } = req.params;
      const query = {_id : new ObjectId(id)}
      const result = await researchCollection.findOne(query)
      res.send(result)
    })



    // -----------------review apis-----------------
    app.get('/reviews', async(req,res)=>{
      const result = await reviewCollection.find().sort({time : -1}).toArray();
      res.send(result);
    })

    app.post('/reviews',async (req,res)=>{
      const feedback = req.body;

      const result = await reviewCollection.insertOne(feedback);
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to Edu Help Server");
});

app.listen(port, () => {
  console.log(`Edu Help server is running on port: ${port}`);
});
