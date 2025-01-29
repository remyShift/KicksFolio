import '@testing-library/jest-native/extend-expect';
import { expect } from '@jest/globals';

expect.extend({
    toHaveProperty(received, property, value) {
        const hasProperty = received.hasOwnProperty(property);
        if (arguments.length === 2) {
            return {
                message: () =>
                    `expected ${received} to have property ${property}`,
                pass: hasProperty,
            };
        }
        return {
            message: () =>
                `expected ${received} to have property ${property} with value ${value}`,
            pass: hasProperty && received[property] === value,
        };
    },
    toBeValid(received) {
        return {
            message: () => `expected ${received} to be valid`,
            pass: received === true
        };
    }
}); 