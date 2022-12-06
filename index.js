import mongoose from 'mongoose';
import app from './app';
import config from './config/index';

// connect to DB as soon as app loads using IIFE
// (async ()=> {})()

(async () => {
	try {
		await mongoose.connect(config.MONGODB_URL);
		console.log('DB CONNECTED SUCCESSFULLY');

		app.on('error', (err) => {
			console.log('ERROR : ', err);
			throw err;
		});

		const onListening = () => {
			console.log(`LISTNING ON ${config.PORT}`);
		};

		app.listen(config.PORT, onListening);
	} catch (err) {
		console.log('ERROR', err);
		throw err;
	}
})();
