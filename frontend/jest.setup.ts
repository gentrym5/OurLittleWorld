// jest.setup.ts
// Extends Jest's built-in expect() with @testing-library/jest-dom custom matchers.
// This file is referenced by jest.config.js setupFilesAfterEnv.
import '@testing-library/jest-dom';

// jsdom does not implement scrollIntoView — mock it so component tests
// that call element.scrollIntoView() do not throw.
Element.prototype.scrollIntoView = jest.fn();
