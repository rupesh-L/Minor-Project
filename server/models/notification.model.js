import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: String,
  receiverId: String,

  message: String,

  isRead: {
    type: Boolean,
    default: false,
  },

  updatedOrder: {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    orderStatus: String,
    orderItems: [
      {
        productId: String,
        name: String,
        quantity: Number,
      },
    ],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Message = mongoose.model("Message", messageSchema);

export default Message;
