import { checkUserExists, registerUser, loginUser, getIsValidToken } from '@/services/authfunctions';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import authClient from '@/services/authclient';

vi.mock('axios');
vi.mock('@/services/authclient', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('Auth Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should check if a user exists', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: { exists: true } });
    
    const result = await checkUserExists();
    expect(result.exists).toBe(true);
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/get_user_exists'));
  });

  it('should register a user successfully', async () => {
    const response = { message: 'User registered successfully', email_sent: true };
    vi.mocked(axios.post).mockResolvedValueOnce({ data: response });
    
    const result = await registerUser('email@test.com', 'password');
    expect(result.success).toBe(true);
    expect(result.data).toEqual(response);
  });

  it('should handle login user success', async () => {
    const response = { access_token: 'mock-access-token' };
    vi.mocked(axios.post).mockResolvedValueOnce({ data: response });
    
    const result = await loginUser('password');
    expect(result.access_token).toBe('mock-access-token');
  });

  it('should validate token correctly', async () => {
    vi.mocked(authClient.get).mockResolvedValueOnce({ data: { valid: true } });
    
    const result = await getIsValidToken();
    expect(result).toBe(true);
  });
});