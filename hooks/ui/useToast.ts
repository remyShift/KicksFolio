import Toast from 'react-native-toast-message';

const useToast = () => {
	const showInfoToast = (title: string, description: string) => {
		Toast.show({
			type: 'info',
			text1: title,
			text2: description,
		});
	};

	const showSuccessToast = (title: string, description: string) => {
		Toast.show({
			type: 'success',
			text1: title,
			text2: description,
		});
	};

	const showErrorToast = (title: string, description: string) => {
		Toast.show({
			type: 'error',
			text1: title,
			text2: description,
		});
	};

	return {
		showInfoToast,
		showSuccessToast,
		showErrorToast,
	};
};

export default useToast;
