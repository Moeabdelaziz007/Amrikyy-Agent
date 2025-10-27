/**
 * Stream Service Unit Tests
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-23
 */

const streamService = require('../../../src/services/streamService');

describe('StreamService', () => {
  describe('initializeStream', () => {
    it('should initialize a new stream with proper headers', () => {
      const mockRes = {
        setHeader: jest.fn(),
        on: jest.fn(),
        write: jest.fn()
      };
      
      const result = streamService.initializeStream(mockRes, 'TestAgent', 'user123');
      
      expect(result).toHaveProperty('streamId');
      expect(result).toHaveProperty('stream');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache');
    });
  });
  
  describe('cancelStream', () => {
    it('should cancel an active stream', () => {
      const mockRes = {
        setHeader: jest.fn(),
        on: jest.fn(),
        write: jest.fn(),
        end: jest.fn()
      };
      
      const { streamId } = streamService.initializeStream(mockRes, 'TestAgent');
      streamService.cancelStream(streamId, 'test');
      
      expect(streamService.isCanceled(streamId)).toBe(true);
    });
  });
  
  describe('sendChunk', () => {
    it('should send chunk if stream is active', () => {
      const mockRes = {
        setHeader: jest.fn(),
        on: jest.fn(),
        write: jest.fn()
      };
      
      const { streamId } = streamService.initializeStream(mockRes, 'TestAgent');
      const sent = streamService.sendChunk(streamId, 'test chunk');
      
      expect(sent).toBe(true);
      expect(mockRes.write).toHaveBeenCalled();
    });
    
    it('should not send chunk if stream is canceled', () => {
      const mockRes = {
        setHeader: jest.fn(),
        on: jest.fn(),
        write: jest.fn(),
        end: jest.fn()
      };
      
      const { streamId } = streamService.initializeStream(mockRes, 'TestAgent');
      streamService.cancelStream(streamId, 'test');
      
      const sent = streamService.sendChunk(streamId, 'test chunk');
      expect(sent).toBe(false);
    });
  });
  
  describe('getStats', () => {
    it('should return service statistics', () => {
      const stats = streamService.getStats();
      
      expect(stats).toHaveProperty('totalStreams');
      expect(stats).toHaveProperty('activeStreams');
      expect(stats).toHaveProperty('completedStreams');
      expect(stats).toHaveProperty('canceledStreams');
      expect(stats).toHaveProperty('costSaved');
    });
  });
});
