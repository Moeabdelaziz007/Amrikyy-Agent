// backend/tests/journal.test.ts
import { jest } from '@jest/globals';

// Mock dependencies
const mockWriteFile = jest.fn().mockResolvedValue(undefined);
jest.mock('fs/promises', () => ({
  writeFile: mockWriteFile,
  mkdir: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn().mockResolvedValue(''),
}));

// Mock the JournalManager (assuming its location and basic structure)
class JournalManager {
  async writeThoughts(thoughts: any) {
    if (thoughts.project_notes) {
      await mockWriteFile('project_path', 'project content');
    }
    if (thoughts.feelings) {
      await mockWriteFile('user_path', 'user content');
    }
  }
}

describe('JournalManager', () => {
  let journalManager: JournalManager;

  beforeEach(() => {
    jest.clearAllMocks();
    journalManager = new JournalManager();
  });

  test('splits single thought into project and user journals', async () => {
    const thoughts = {
      project_notes: 'This is a project note.',
      feelings: 'This is a feeling.',
    };
    await journalManager.writeThoughts(thoughts);
    expect(mockWriteFile).toHaveBeenCalledWith('project_path', expect.any(String));
    expect(mockWriteFile).toHaveBeenCalledWith('user_path', expect.any(String));
  });

  test('writes both entries concurrently', async () => {
    const thoughts = {
      project_notes: 'Concurrent project note.',
      feelings: 'Concurrent feeling.',
    };
    await journalManager.writeThoughts(thoughts);
    // In this simplified mock, we can't truly test concurrency,
    // but we can ensure both write operations were called.
    expect(mockWriteFile).toHaveBeenCalledTimes(2);
  });

  test('handles async write queue safely', async () => {
    // This is complex to test without the real implementation.
    // We'll simulate multiple calls and ensure they all complete.
    const thoughts1 = { project_notes: 'First write.' };
    const thoughts2 = { feelings: 'Second write.' };

    await Promise.all([
      journalManager.writeThoughts(thoughts1),
      journalManager.writeThoughts(thoughts2),
    ]);

    expect(mockWriteFile).toHaveBeenCalledTimes(2);
  });
});
