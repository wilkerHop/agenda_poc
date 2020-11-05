import Agenda from "agenda";
import { MongoClient } from "mongodb";
import axios from "axios";
const { mongoConnectionString } = process.env;

const client = new MongoClient(mongoConnectionString!, {
  useUnifiedTopology: true,
});
client.connect();

const getCollection = () => client.db("agenda_poc").collection("gibberishData");

const getGibberish = async () => {
  const { data } = await axios(
    "https://www.randomtext.me/api/gibberish/h1/20-35"
  );

  return (data.text_out as string).replace(/<h1>(.*)<\/h1>/gi, "$1");
};

const agenda = new Agenda({
  db: {
    address: mongoConnectionString,
    options: {
      useUnifiedTopology: true,
    },
  },
});

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

(async function () {
  await agenda.start();
  console.info("agenda started");

  await agenda.every("30 seconds", "add gibberish");
})();
