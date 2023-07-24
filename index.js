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

    const collegeCoection = client.db("eduHelpDb").collection("colleges");
    const usersCoection = client.db("eduHelpDb").collection("users");
    const admissionCoection = client.db("eduHelpDb").collection("admission");

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

      const isExist = await usersCoection.findOne(query);
      if (isExist) {
        return;
      } else {
        const result = await usersCoection.updateOne(user, updateUser, options);
        res.send(result);
      }
    });

    // get all college
    app.get("/colleges", async (req, res) => {
      const result = await collegeCoection.find().toArray();
      res.send(result);
    });

    // single college details
    app.get("/colleges/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await collegeCoection.findOne(query);
      res.send(result);
    });

    app.post("/apply-form", async (req, res) => {
      const applyInfo = req.body;
      console.log(applyInfo);
      const result = await admissionCoection.insertOne(applyInfo);
      res.send(result);
    });

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
