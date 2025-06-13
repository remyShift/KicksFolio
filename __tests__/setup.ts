import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react-native';
import { afterEach, vi } from 'vitest';

afterEach(() => {
	cleanup();
});

// Mock pour les composants natifs
vi.mock('react-native/Libraries/Components/View/View', () => 'View');
vi.mock('react-native/Libraries/Text/Text', () => 'Text');
vi.mock('react-native/Libraries/Image/Image', () => 'Image');
