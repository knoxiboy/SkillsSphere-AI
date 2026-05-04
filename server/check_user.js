import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

const userSchema = new mongoose.Schema({
  email: String,
  role: String,
  name: String
});

const User = mongoose.model("User", userSchema);

async function checkUser() {
  await mongoose.connect(mongoUri);
  const user = await User.findOne({ email: "recruiter@test.com" });
  console.log("User found:", JSON.stringify(user, null, 2));
  await mongoose.disconnect();
}

checkUser().catch(console.error);
