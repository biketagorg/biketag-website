import { getSettings } from '../getSettings';
import { ACCOUNT_SETTINGS } from '../../endpoints';

const mockGet = jest.fn();
const MockClient = jest.fn().mockImplementation(() => {
  return {
    get: mockGet,
  };
});

beforeEach(() => {
  MockClient.mockClear();
  mockGet.mockClear();
});

test('getAccessToken calls the correct endpoint and resolves', () => {
  const mockResponse = '{"success":true}';
  mockGet.mockReturnValueOnce(Promise.resolve(mockResponse));

  const promiseResponse = getSettings(new MockClient());

  expect(promiseResponse).resolves.toBe(mockResponse);
  expect(mockGet).toHaveBeenCalledTimes(1);
  expect(mockGet).toHaveBeenCalledWith(ACCOUNT_SETTINGS);
});
