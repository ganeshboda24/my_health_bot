const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");
const PHC = require("./models/PHC");

async function test() {
  await mongoose.connect(
    "mongodb+srv://ganib7494_db_user:XTDG0WcGG31yoWvT@cluster0.ycgjurc.mongodb.net/arogya_innovators?retryWrites=true&w=majority"
  );

  // Get one PHC from West Godavari
  const phc = await PHC.findOne({ district: "West Godavari" }).lean();
  console.log("Sample PHC:", JSON.stringify(phc, null, 2));

  // Test regex match directly
  const regex = new RegExp("west", "i");
  console.log("Regex /west/i:", regex);
  console.log("Test 'West Godavari':", regex.test("West Godavari"));
  console.log("Test phc.district:", regex.test(phc.district));

  // Test with $regex operator
  const results = await PHC.find({ district: { $regex: regex } }).limit(5).lean();
  console.log("\n$regex results:", results.length);

  // Test with string regex
  const results2 = await PHC.find({ district: /west/i }).limit(5).lean();
  console.log("String regex results:", results2.length);

  await mongoose.disconnect();
}

test().catch(console.error);
