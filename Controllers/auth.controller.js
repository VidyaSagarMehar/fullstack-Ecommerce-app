import User from '../models/user.schema';
import asyncHandler from '../services/asyncHandler';
import CustomError from '../utils/customError';

export const cookieOptions = {
	expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
	httpOnly: true,
	// could be in separate file in utils
};

/******************************************
 * @SIGNUP
 * @route http://localhost:4000/api/auth/signup
 * description User signup Controller for creating new user
 * @parameter name, email, password
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