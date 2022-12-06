import mongoose from 'mongoose';

const collectionSchema = mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'please provide a category name'],
		},
		trim: true,
		maxlength: [120, 'Collection name should not be more than 120 characters'],
	},
	{
		timestamps: true,
	},
);

export default mongoose.model('Collection', collectionSchema);
