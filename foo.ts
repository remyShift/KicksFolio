const fooApiAction = async () => {
	const response = await fetch('https://api.example.com/foo');
	const data = await response.json();
	return data;
};

const fooApiInterface = async (fooApiAction: () => Promise<string>) => {
	const data = await fooApiAction();
	return data;
};

const fooHook = () => {
	const fooAction = async () => {
		fooApiInterface(fooApiAction);
	};

	return { fooAction };
};
