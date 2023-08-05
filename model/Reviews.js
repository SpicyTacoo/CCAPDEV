import mongoose from "mongoose";
const { Schema, model } = mongoose;

const reviewsSchema = new Schema ({
    //why is _id added here?
    //_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resto: { type: mongoose.Schema.Types.ObjectId, ref: 'Establishment', required: true },
    post: String,
    ratings: Number,
    liked: [String], 
    disliked: [String],
    isDeleted: Boolean,
    isEdited: Boolean,
    pictures: String,
    restaurant: String,
    username: String
});

const Reviews = model("Reviews", reviewsSchema, "Reviews");

export default Reviews;