import Agenda from "agenda";
import { MongoClient } from "mongodb";
import axios from "axios";
const { mongoConnectionString } = process.env;

const mongoClient = new MongoClient(mongoConnectionString!, {
  useUnifiedTopology: true,
});

const agenda = new Agenda();
mongoClient.connect().then((db) => agenda.mongo(db.db("agenda_poc")));

const getCollection = () =>
  mongoClient.db("agenda_poc").collection("gibberishData");

const getGibberish = async () => {
  const { data } = await axios(
    "https://www.randomtext.me/api/gibberish/h1/20-35"
  );

  return (data.text_out as string).replace(/<h1>(.*)<\/h1>/gi, "$1");
};

agenda.define<{ gibberish: string }>("add gibberish", async function (job) {
  const gibberish = await getGibberish();

  job.attrs.data = { gibberish };

  await job.save();

  await getCollection()
    .insertOne({ gibberish })
    .catch((err) => {
      console.error(err);
      throw err;
    });

  console.log("Gibberish added", `'${gibberish}'`);
});

(async () => {
  await agenda.start();
  console.info("agenda started");

  await agenda.every("30 seconds", "add gibberish");
})();
