const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");
const PHC = require("./models/PHC");

async function test() {
  await mongoose.connect(
    "mongodb+srv://ganesh_boda24_user_db:-A_-xFyUUXz7DGV@cluster0.u1fepav.mongodb.net/arogya_innovators?retryWrites=true&w=majority"
  );

  const regex = new RegExp("west", "i");
  const results = await PHC.find({ district: regex }).limit(5).lean();
  console.log("Regex results:", results.length);
  console.log("First:", results[0]?.district);

  const results2 = await PHC.find({ district: { $regex: "west", $options: "i" } })
    .limit(5)
    .lean();
  console.log("$regex results:", results2.length);

  await mongoose.disconnect();
}

test().catch(console.error);
