// Test setup file
import { vi } from 'vitest';

// Mock localStorage for tests
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

global.localStorage = localStorageMock;

// Mock environment variables for tests
process.env.VITE_MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017';
process.env.VITE_GEMINI_API_KEY = 'test_gemini_key';

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.getItem.mockReturnValue(null);
});
