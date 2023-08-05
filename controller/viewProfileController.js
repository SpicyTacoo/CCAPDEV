import User from "../model/User.js";
import Reviews from "../model/Reviews.js";
import Comments from "../model/Comments.js";

export const getUserID = async (parameter)=> {
    return await User.findOne({username:parameter}).select('_id');
}

export const getUserInfo = async (parameter)=> {
    return await User.findOne({username:parameter});
}

export const getAllReviewsOfUser = async (parameter)=> {
    return await Reviews.find({user:parameter, isDeleted: false}).sort({ _id: -1 });
}

export const getAllReplyOfUser = async (parameter)=> {
    return await Comments.find({commenter:parameter, isDeleted: false});
}