import User from "../model/User.js";

export const createUser = async (firstName, lastName, username, password, shortDescription, profilePicture)=> {
    return await User.create({
        firstName: firstName,
        lastName: lastName,
        username: username,
        password: password,
        shortDescription: shortDescription,
        profilePicture: profilePicture
    })
}

export const checkUsername = async (parameter)=> {
    const result = await User.findOne({username: parameter}).exec();

    if (result) {
        return true;
    } else {
        return false;
    }
};