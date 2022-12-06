import mongoose, { mongo } from 'mongoose';

const productSchema = mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Please provide a product name'],
			trim: true,
			maxLength: [120, 'Product name should be max of 120 characters'],
		},
		price: {
			type: Number,
			required: [true, 'Please provide a product price '],
			maxLength: [5, 'Product price should not be more than 5 digits'],
		},
		description: {
			type: String,
			// Use some form of editor (markdown, editor npm package) - personal assignment
		},
		photos: [
			{
				secure_url: {
					type: String,
					required: true,
				},
			},
		],
		stock: {
			type: Number,
			default: 0,
		},
		sold: {
			type: Number,
			default: 0,
		},
		collectionId: {
			// refering to the collection schema -> and this is the syntax
			type: mongoose.Schema.Types.ObjectId, // It is for storing _id
			ref: 'Collection',
		},
	},
	{
		timestamps: true,
	},
);

export default mongoose.model('Product', productSchema);
