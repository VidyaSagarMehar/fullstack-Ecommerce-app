const asyncHandler = (fn) => async (req, res, next) => {
	try {
		await fn(req, res, next);
	} catch (err) {
		res.status(err.code || 500).json({
			success: false,
			message: err.message,
		});
	}
};

export default asyncHandler;

// Steps of creatinf HOF
// const asyncHandler = () => {};
// const asyncHandler = (fn) => {};
// const asyncHandler = (fn) => () => {};
// const asyncHandler = (fn) => async () => {};
