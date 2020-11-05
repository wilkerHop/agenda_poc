import Agenda from "agenda";
import { MongoClient } from "mongodb";
import axios from "axios";
const { mongoConnectionString } = process.env;

const getDb = async function () {
  const { db } = await new MongoClient(mongoConnectionString!, {
    useUnifiedTopology: true,
  }).connect();

  return db("agenda_poc");
};

const getGibberish = async () => {
  const { data } = await axios(
    "https://www.randomtext.me/api/gibberish/h1/20-35"
  );

  return data.text_out.replace(/<h1>(.*)<\/h1>/gi, "$1") as string;
};

const agenda = new Agenda({
  db: {
    address: mongoConnectionString,
    options: {
      useUnifiedTopology: true,
    },
  },
});

agenda.define("add gibberish", async function (job) {
  const gibberish = await getGibberish();

  // const db = await getDb().catch((err) => {
  //   console.error(err);
  //   throw err;
  // });

  // await db.collection("gibberishData").insertOne({ gibberish });

  console.log("Gibberish added", gibberish);
});

(async function () {
  await agenda.start();
  console.info("agenda started");

  await agenda.every("30 seconds", "add gibberish");
})();
