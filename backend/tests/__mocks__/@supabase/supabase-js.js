const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  neq: jest.fn().mockReturnThis(),
  gt: jest.fn().mockReturnThis(),
  lt: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  like: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  is: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  contains: jest.fn().mockReturnThis(),
  containedBy: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({ data: {}, error: null }),
  rpc: jest.fn().mockResolvedValue({ data: {}, error: null }),
  auth: {
    signUp: jest.fn().mockResolvedValue({ data: { user: {} }, error: null }),
    signInWithPassword: jest.fn().mockResolvedValue({ data: { user: {} }, error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    getUser: jest.fn().mockResolvedValue({ data: { user: {} }, error: null }),
  },
  storage: {
    from: jest.fn().mockReturnThis(),
    upload: jest.fn().mockResolvedValue({ data: {}, error: null }),
    download: jest.fn().mockResolvedValue({ data: {}, error: null }),
    getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: '' } }),
    listBuckets: jest.fn().mockResolvedValue({ data: [], error: null })
  },
};

module.exports = {
  createClient: jest.fn(() => mockSupabase),
};