import User from "../model/User.js";

export const getUser = async (parameter)=> {
    return await User.findOne({username:parameter});
}