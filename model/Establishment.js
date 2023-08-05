import mongoose from "mongoose";
const { Schema, model } = mongoose;

const establishmentSchema = new Schema ({
    restaurant: String,
    address: String,
    contact: String,
    description: String,
    logo: String,
    pictures: [String],
});

const Establishment = model("Establishments", establishmentSchema);

export default Establishment;