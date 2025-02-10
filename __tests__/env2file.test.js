const fs = require('fs');
const path = require('path');

// Mock fs
jest.mock('fs');

// Import functions from env2file.js
const { parseWriteEnv, writeToFile, decodeContent } = require('../bin/env2file.js');

describe('env2file', () => {
  // Track created files for cleanup
  let createdFiles = [];

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset fs mocks
    fs.mkdirSync.mockClear();
    fs.writeFileSync.mockClear();
    // Reset created files array
    createdFiles = [];

    // Mock fs.writeFileSync to track created files
    fs.writeFileSync.mockImplementation((filePath) => {
      createdFiles.push(filePath);
    });
  });

  afterEach(() => {
    // Clean up any files created during the test
    createdFiles.forEach(filePath => {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          // Also try to remove parent directory if empty
          const dirPath = path.dirname(filePath);
          if (fs.readdirSync(dirPath).length === 0) {
            fs.rmdirSync(dirPath, { recursive: true });
          }
        }
      } catch (error) {
        console.warn(`Failed to clean up file: ${filePath}`, error);
      }
    });
  });

  describe('decodeContent', () => {
    test('should decode base64 content correctly', () => {
      const testContent = 'Hello World';
      const base64Content = Buffer.from(testContent).toString('base64');
      expect(decodeContent(base64Content)).toBe(testContent);
    });

    test('should get content from environment variable when using $ prefix', () => {
      process.env.TEST_VAR = 'test content';
      expect(decodeContent('$TEST_VAR')).toBe('test content');
    });

    test('should decode base64 encoded environment variable when using base64:$ prefix', () => {
      const testContent = 'Hello World';
      process.env.BASE64_VAR = Buffer.from(testContent).toString('base64');
      expect(decodeContent('base64:$BASE64_VAR')).toBe(testContent);
    });

    test('should throw error when referenced environment variable is not set', () => {
      delete process.env.NONEXISTENT_VAR;
      expect(() => {
        decodeContent('$NONEXISTENT_VAR');
      }).toThrow('Error: Environment variable NONEXISTENT_VAR is not set');
    });

    test('should throw error when base64 encoded environment variable is not set', () => {
      delete process.env.NONEXISTENT_BASE64_VAR;
      expect(() => {
        decodeContent('base64:$NONEXISTENT_BASE64_VAR');
      }).toThrow('Error: Environment variable NONEXISTENT_BASE64_VAR is not set');
    });
  });

  describe('parseWriteEnv', () => {
    test('should throw error when WRITE env is not set', () => {
      delete process.env.WRITE;
      expect(() => {
        parseWriteEnv();
      }).toThrow('Error: WRITE environment variable is not set');
    });

    test('should throw error when WRITE env has invalid format', () => {
      process.env.WRITE = 'invalid-format';
      expect(() => {
        parseWriteEnv();
      }).toThrow('Error: Invalid WRITE environment variable format');
    });

    test('should parse valid WRITE env correctly', () => {
      const testPath = './test.txt';
      const testContent = 'Hello World';
      const base64Content = Buffer.from(testContent).toString('base64');
      process.env.WRITE = `[${testPath}](${base64Content})`;

      const result = parseWriteEnv();
      expect(result).toEqual([{
        filePath: testPath,
        content: testContent
      }]);
    });

    test('should parse multiple write instructions correctly', () => {
      const file1 = { path: './test1.txt', content: 'Hello World 1' };
      const file2 = { path: './test2.txt', content: 'Hello World 2' };
      const base64Content1 = Buffer.from(file1.content).toString('base64');
      const base64Content2 = Buffer.from(file2.content).toString('base64');
      process.env.WRITE = `[${file1.path}](${base64Content1});[${file2.path}](${base64Content2})`;

      const result = parseWriteEnv();
      expect(result).toEqual([
        { filePath: file1.path, content: file1.content },
        { filePath: file2.path, content: file2.content }
      ]);
    });

    test('should parse environment variable references correctly', () => {
      process.env.CONTENT_VAR = 'Hello from env';
      process.env.WRITE = '[./test.txt]($CONTENT_VAR)';

      const result = parseWriteEnv();
      expect(result).toEqual([{
        filePath: './test.txt',
        content: 'Hello from env'
      }]);
    });

    test('should handle multiple environment variable references', () => {
      process.env.CONTENT1 = 'First content';
      process.env.CONTENT2 = 'Second content';
      process.env.WRITE = '[./test1.txt]($CONTENT1);[./test2.txt]($CONTENT2)';

      const result = parseWriteEnv();
      expect(result).toEqual([
        { filePath: './test1.txt', content: 'First content' },
        { filePath: './test2.txt', content: 'Second content' }
      ]);
    });

    test('should throw error when referenced environment variable is not set', () => {
      delete process.env.NONEXISTENT_VAR;
      process.env.WRITE = '[./test.txt]($NONEXISTENT_VAR)';

      expect(() => {
        parseWriteEnv();
      }).toThrow('Error: Environment variable NONEXISTENT_VAR is not set');
    });
  });

  describe('writeToFile', () => {
    test('should create directory if it does not exist', () => {
      const testPath = './nested/dir/test.txt';
      const testContent = 'Hello World';

      writeToFile(testPath, testContent);

      expect(fs.mkdirSync).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ recursive: true })
      );
    });

    test('should write content to file', () => {
      const testPath = './test.txt';
      const testContent = 'Hello World';

      writeToFile(testPath, testContent);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.any(String),
        testContent
      );
    });

    test('should handle write errors', () => {
      const testPath = './test.txt';
      const testContent = 'Hello World';

      fs.writeFileSync.mockImplementation(() => {
        throw new Error('Write error');
      });

      expect(() => {
        writeToFile(testPath, testContent);
      }).toThrow('Error writing to file: Write error')
    });
  });
});