//배달기사
const RiderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: String,
  vehicleType: String,
  isAvailable: { type: Boolean, default: true },
  location: {
    lat: Number,
    lng: Number
  },
  createdAt: { type: Date, default: Date.now }
});
