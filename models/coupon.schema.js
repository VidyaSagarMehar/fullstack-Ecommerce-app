import mongoose from 'mongoose';

const couponSchema = mongoose.Schema(
	{
		code: {
			type: String,
			requiredL: [true, 'Please prove a coupon name'],
		},
		discount: {
			type: String,
			default: 0,
		},
		active: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
	},
);

export default mongoose.model('Coupon', couponSchema);
