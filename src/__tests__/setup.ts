import { act } from 'react';

import { ReactTestInstance } from 'react-test-renderer';

import { fireEvent } from '@testing-library/react-native';

import './setup/base';

export const fillAndBlurInput = async (
	input: ReactTestInstance,
	value: string
) => {
	await act(async () => {
		fireEvent.changeText(input, value);
	});

	await act(async () => {
		fireEvent(input, 'blur');
	});
};
