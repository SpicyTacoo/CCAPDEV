/* NEW */

import mongoose from "mongoose";
const { Schema, model } = mongoose;

const commentsSchema = new Schema ({
    commenter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    parentPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Reviews', required: true },
    content: String,
    author: { type: mongoose.Schema.Types.String, ref: 'Reviews', required: true },
    isEdited: Boolean,
    isDeleted: Boolean,
    restaurant: { type: mongoose.Schema.Types.String, ref: 'Establishments', required: true },
    disliked: [String],
    liked: [String],
    resto: { type: mongoose.Schema.Types.ObjectId, ref: 'Establishment', required: true },
    parentPostContent: { type: mongoose.Schema.Types.String, ref: 'Reviews', required: true }
});

//edited here
const Comments = model("Comments", commentsSchema, "Comments");

export default Comments;

