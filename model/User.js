import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new Schema ({
    firstName: String,
    lastName: String,
    username: String,
    password: String,
    shortDescription: String,
    profilePicture: String,
});

const User = model("User", userSchema, "User");

export default User;