import mongoose from 'mongoose';
import AuthRoles from '../utils/authRoles';
import bcrypt from 'bcryptjs';
import JWT from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config/index';

const userSchema = mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Name is required'],
			maxLength: [50, 'Name must be less than 50 character'],
		},
		email: {
			type: String,
			required: [true, 'Email is required'],
			unique: true,
		},
		password: {
			type: String,
			required: [true, 'Password is required'],
			minLength: [8, 'Password must be at least 8 character'],
			select: false,
		},
		role: {
			type: String,
			enum: Object.values(AuthRoles),
			default: AuthRoles.USER,
		},
		forgotPasswordToken: String,
		forgotPasswordExpiry: Date,
	},
	{
		timestamps: true, // It has two properties ie; createdAt, updateAt
	},
);

// Encrypting the password, before saving it -> using "pre" hooks of mongoose
userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();
	this.password = await bcrypt.hash(this.password, 10);
	next();
});

// Adding more functionality directly to schema
userSchema.methods = {
	// compare password
	comparePassword: async function (enteredPassword) {
		return await bcrypt.compare(enteredPassword, this.password);
	},

	//generate JWT token
	getJwtToken: function () {
		return JWT.sign(
			{
				_id: this._id,
				role: this.role,
			},
			config.JWT_SECRET,
			{
				expiresIn: config.JWT_EXPIRY,
			},
		);
	},
	generateForgotPasswordToken: function () {
		const forgotToken = crypto.randomBytes(20).toString('hex');

		// Step 1 -> Save to DB
		this.forgotPasswordToken = crypto
			.createHash('sha256')
			.update(forgotToken)
			.digest('hex');

		// Step 2 -> Return values to user
		return forgotToken;
	},
};

export default mongoose.model('User', userSchema);
