import mongoose from "mongoose";

const bestSellerSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: true,
  },
  bestSaleYear: {
    type: Date,
  },
  tag: {
    type: String,
    default: "BEST SELLER",
    trim: true,
  },
});

const BestSeller = mongoose.model("BestSeller", bestSellerSchema);

export default BestSeller;
