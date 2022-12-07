import User from '../models/user.schema';
import asyncHandler from '../services/asyncHandler';
import CustomError from '../utils/customError';
import mailHelper from '../utils/mailHelper';
import crypto from 'crypto';

export const cookieOptions = {
	expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
	httpOnly: true,
	// could be in separate file in utils
};

/******************************************
 * @SIGNUP
 * @route http://localhost:4000/api/auth/signup
 * description User signup Controller for creating new user
 * @parameters name, email, password
 * @return User Object
 ******************************************/
export const signUp = asyncHandler(async (req, res) => {
	const { name, email, password } = req.body;

	if (!name || !email || !password) {
		throw new CustomError('Please fill all the fields', 400);
	}

	// cheking if user exists
	const existingUser = await User.findOne(email);

	if (existingUser) {
		throw new CustomError('User already exists', 400);
	}

	const user = await User.create({
		name,
		email,
		password,
	});
	const token = user.getJwtToken();
	console.log(user);
	user.password = undefined;

	res.cookie('token', token, cookieOptions);

	res.status(200).json({
		success: true,
		token,
		user,
	});
});

/******************************************
 * @LOGIN
 * @route http://localhost:4000/api/auth/login
 * description User signin Controller for loging in  new user
 * @parameters email, password
 * @return User Object
 ******************************************/
export const login = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		throw new CustomError('Please fill all the fields', 400);
	}

	const user = User.findOne({ email }).select('+password');

	if (!user) {
		throw new CustomError('Invalid credetials', 400);
	}

	const isPasswordMatched = await user.comparePassword(password);

	if (isPasswordMatched) {
		const token = user.getJwtToken();
		user.password = undefined;
		res.cookie('token', token, cookieOptions);
		return res.status(200).json({
			success: true,
			token,
			user,
		});
	}
	throw new CustomError('Invalid Credetials', 400);
});

/******************************************
 * @LOGOUT
 * @route http://localhost:4000/api/auth/logout
 * description User logout by clearing user cookies
 * @parameters
 * @return sucess message
 ******************************************/
export const logout = asyncHandler(async (_req, res) => {
	res.cookie('token', null, {
		expires: new Date(Date.now()),
		httpOnly: true,
	});
	res.status(200).json({
		success: true,
		message: 'Logged out successfully',
	});
});

/******************************************
 * @FORGOT_PASSWORD
 * @route http://localhost:4000/api/auth/password/forgot
 * description User will submit email and we will generate a token
 * @parameters  email
 * @return sucess message - email send
 ******************************************/
export const forgotPassword = asyncHandler(async (req, res) => {
	const { email } = req.body;

	//FIXME: check email for null or ""

	const user = await User.findOne({ email });
	if (!user) {
		throw new CustomError('User not found', 404);
	}

	const resetToken = user.generateForgotPasswordToken();

	await user.save({ validateBeforeSave: false });

	const resetUrl = `${req.protocol}://${req.get(
		'host',
	)}/api/auth/password/reset/${resetToken}`;

	const text = `Your password reset url is \n\n ${resetUrl}\n\n`;

	try {
		await mailHelper({
			email: user.email,
			subject: 'Password reset email for website',
			text: text,
		});

		res.status(200).json({
			success: true,
			message: `Email send to ${user.email}`,
		});
	} catch (err) {
		// Roll back - clear fields and save
		user.forgotPasswordToken = undefined;
		user.forgotPasswordExpiry = undefined;

		await user.save({ validateBeforeSave: false });

		throw new CustomError(err.message || 'Email sent failiure', 500);
	}
});

/******************************************
 * @RESET_PASSWORD
 * @route http://localhost:4000/api/auth/password/reset/:resetPasswordToken
 * description User will be able to reset password based on url token
 * @parameters  token form url, password and confirm password
 * @return user object
 ******************************************/

export const resetPassword = asyncHandler(async (req, res) => {
	const { token: resetToken } = req.params;
	const { password, confirmPassword } = req.body;

	const resetPasswordToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');

	const user = await User.findOne({
		forgotPasswordToken: resetPasswordToken,
		forgotPasswordExpiry: { $gt: Date.now() },
	});
	if (!user) {
		throw new CustomError('Password token is invalid/ expired', 400);
	}

	if (password !== confirmPassword) {
		throw new CustomError('Password does not match', 400);
	}

	user.password = password;
	user.forgotPasswordToken = undefined; //preventing garbage value to store in DB
	user.forgotPasswordExpiry = undefined; // preventing garbage value to store in DB

	await user.save();

	// Create token and send it as response
	const token = user.getJwtToken();
	user.password = undefined;

	// Helper method for cookie can be added here
	res.cookie('token', token, cookieOptions);
	res.status(200).json({
		success: true,
		user,
	});
});
