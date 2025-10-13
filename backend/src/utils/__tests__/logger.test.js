/**
 * Unit Tests for Logger Utility
 * Testing all logging levels, file operations, and child logger functionality
 */

const Logger = require('../logger');
const fs = require('fs');
const path = require('path');

// Mock console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

describe('Logger Utility', () => {
  let logger;
  let consoleOutput = [];
  let testLogDir;

  beforeEach(() => {
    // Create test log directory
    testLogDir = path.join(__dirname, '../../../logs-test');
    
    // Reset console output
    consoleOutput = [];
    
    // Mock console methods
    console.log = jest.fn((...args) => consoleOutput.push(args.join(' ')));
    console.error = jest.fn((...args) => consoleOutput.push(args.join(' ')));
    console.warn = jest.fn((...args) => consoleOutput.push(args.join(' ')));
    
    // Create logger instance
    logger = new Logger({
      logLevel: 'trace',
      logToFile: true,
      logDir: testLogDir,
      logFile: 'test.log'
    });
  });

  afterEach(() => {
    // Restore console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    
    // Clean up test log directory
    if (fs.existsSync(testLogDir)) {
      const files = fs.readdirSync(testLogDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(testLogDir, file));
      });
      fs.rmdirSync(testLogDir);
    }
  });

  describe('Logger Initialization', () => {
    test('should create logger with default options', () => {
      const defaultLogger = new Logger();
      expect(defaultLogger).toBeDefined();
      expect(defaultLogger.logLevel).toBe('info');
    });

    test('should create logger with custom options', () => {
      const customLogger = new Logger({
        logLevel: 'debug',
        logToFile: false
      });
      expect(customLogger.logLevel).toBe('debug');
      expect(customLogger.logToFile).toBe(false);
    });

    test('should create log directory if it does not exist', () => {
      expect(fs.existsSync(testLogDir)).toBe(true);
    });
  });

  describe('Log Levels', () => {
    test('should log error messages', () => {
      logger.error('Test error message');
      expect(console.error).toHaveBeenCalled();
      expect(consoleOutput[0]).toContain('ERROR');
      expect(consoleOutput[0]).toContain('Test error message');
    });

    test('should log warning messages', () => {
      logger.warn('Test warning message');
      expect(console.warn).toHaveBeenCalled();
      expect(consoleOutput[0]).toContain('WARN');
      expect(consoleOutput[0]).toContain('Test warning message');
    });

    test('should log info messages', () => {
      logger.info('Test info message');
      expect(console.log).toHaveBeenCalled();
      expect(consoleOutput[0]).toContain('INFO');
      expect(consoleOutput[0]).toContain('Test info message');
    });

    test('should log debug messages', () => {
      logger.debug('Test debug message');
      expect(console.log).toHaveBeenCalled();
      expect(consoleOutput[0]).toContain('DEBUG');
      expect(consoleOutput[0]).toContain('Test debug message');
    });

    test('should log trace messages', () => {
      logger.trace('Test trace message');
      expect(console.log).toHaveBeenCalled();
      expect(consoleOutput[0]).toContain('TRACE');
      expect(consoleOutput[0]).toContain('Test trace message');
    });

    test('should log success messages', () => {
      logger.success('Test success message');
      expect(console.log).toHaveBeenCalled();
      expect(consoleOutput[0]).toContain('INFO');
      expect(consoleOutput[0]).toContain('Test success message');
    });
  });

  describe('Log Level Filtering', () => {
    test('should respect log level - error only', () => {
      const errorLogger = new Logger({
        logLevel: 'error',
        logToFile: false
      });
      
      errorLogger.error('Error message');
      errorLogger.warn('Warning message');
      errorLogger.info('Info message');
      
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.log).not.toHaveBeenCalled();
    });

    test('should respect log level - warn and above', () => {
      const warnLogger = new Logger({
        logLevel: 'warn',
        logToFile: false
      });
      
      warnLogger.error('Error message');
      warnLogger.warn('Warning message');
      warnLogger.info('Info message');
      
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.log).not.toHaveBeenCalled();
    });

    test('should respect log level - info and above', () => {
      const infoLogger = new Logger({
        logLevel: 'info',
        logToFile: false
      });
      
      infoLogger.error('Error message');
      infoLogger.warn('Warning message');
      infoLogger.info('Info message');
      infoLogger.debug('Debug message');
      
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledTimes(1);
    });
  });

  describe('Metadata Support', () => {
    test('should include metadata in log messages', () => {
      const metadata = { userId: 123, action: 'test' };
      logger.info('Test with metadata', metadata);
      
      expect(consoleOutput[0]).toContain('Test with metadata');
      expect(consoleOutput[0]).toContain(JSON.stringify(metadata));
    });

    test('should handle empty metadata', () => {
      logger.info('Test without metadata');
      expect(consoleOutput[0]).toContain('Test without metadata');
    });
  });

  describe('File Logging', () => {
    test('should write logs to file', () => {
      logger.info('Test file logging');
      
      const logPath = path.join(testLogDir, 'test.log');
      expect(fs.existsSync(logPath)).toBe(true);
      
      const logContent = fs.readFileSync(logPath, 'utf8');
      expect(logContent).toContain('Test file logging');
      expect(logContent).toContain('INFO');
    });

    test('should not write to file when logToFile is false', () => {
      const noFileLogger = new Logger({
        logToFile: false,
        logDir: testLogDir,
        logFile: 'no-file.log'
      });
      
      noFileLogger.info('This should not be in file');
      
      const logPath = path.join(testLogDir, 'no-file.log');
      expect(fs.existsSync(logPath)).toBe(false);
    });

    test('should append to existing log file', () => {
      logger.info('First message');
      logger.info('Second message');
      
      const logPath = path.join(testLogDir, 'test.log');
      const logContent = fs.readFileSync(logPath, 'utf8');
      
      expect(logContent).toContain('First message');
      expect(logContent).toContain('Second message');
    });
  });

  describe('Child Logger', () => {
    test('should create child logger with prefix', () => {
      const childLogger = logger.child('TestModule');
      childLogger.info('Child message');
      
      expect(consoleOutput[0]).toContain('[TestModule]');
      expect(consoleOutput[0]).toContain('Child message');
    });

    test('should inherit parent log level', () => {
      const parentLogger = new Logger({
        logLevel: 'warn',
        logToFile: false
      });
      
      const childLogger = parentLogger.child('Child');
      childLogger.info('Info message');
      childLogger.warn('Warning message');
      
      expect(console.log).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledTimes(1);
    });

    test('should support nested child loggers', () => {
      const child1 = logger.child('Parent');
      const child2 = child1.child('Child');
      
      child2.info('Nested message');
      
      expect(consoleOutput[0]).toContain('[Child]');
      expect(consoleOutput[0]).toContain('Nested message');
    });
  });

  describe('Utility Methods', () => {
    test('should clear log file', () => {
      logger.info('Message before clear');
      
      const logPath = path.join(testLogDir, 'test.log');
      expect(fs.existsSync(logPath)).toBe(true);
      
      logger.clearLogs();
      expect(fs.existsSync(logPath)).toBe(false);
    });

    test('should return log file path', () => {
      const logPath = logger.getLogPath();
      expect(logPath).toBe(path.join(testLogDir, 'test.log'));
    });

    test('should format timestamp correctly', () => {
      const timestamp = logger.getTimestamp();
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('Error Handling', () => {
    test('should handle logging with logToFile disabled', () => {
      // Create logger with file logging disabled
      const noFileLogger = new Logger({
        logToFile: false
      });
      
      // Should not throw error
      expect(() => {
        noFileLogger.info('Test message');
        noFileLogger.error('Error message');
        noFileLogger.warn('Warning message');
      }).not.toThrow();
    });
  });

  describe('Default Logger Export', () => {
    test('should export default logger instance', () => {
      const { logger: defaultLogger } = require('../logger');
      expect(defaultLogger).toBeDefined();
      expect(defaultLogger.info).toBeDefined();
    });

    test('should export Logger class', () => {
      const LoggerClass = require('../logger');
      expect(typeof LoggerClass).toBe('function');
      expect(new LoggerClass()).toBeInstanceOf(LoggerClass);
    });
  });
});
