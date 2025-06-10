//주문
const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  rider: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider' },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'delivering', 'completed', 'cancelled'],
    default: 'pending'
  },
  orderItems: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number,
      unitPrice: Number
    }
  ],
  createdAt: { type: Date, default: Date.now }
});
