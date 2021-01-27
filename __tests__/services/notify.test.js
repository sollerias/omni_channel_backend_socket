import {
  addSocketId,
  getSocketIdArray,
  removeSockeIdFromArray,
} from '../../src/services/notify';

const socketId = 'asdf4e1345dfs';
const newSocketId = 'g;kjlhiedff3455';
const nonExistentSocketId = '000fsdrwoejfwerjf';

beforeEach(async () => {
  await addSocketId(socketId);
});

// afterEach(async () => {
//   await removeSockeIdFromArray(socketId);
// });

describe('addSocketId', () => {
  it('Should work', async () => {
    const result = await addSocketId(newSocketId);
    // console.log('000000', result);

    expect(result).toEqual(
      expect.objectContaining({
        error: false,
        status: '00',
        text: expect.any(String),
        value: expect.any(String),
      }),
    );
  });

  it('Should not work with wrong format data', async () => {
    const result = await addSocketId(878);
    // console.log('000000', result);

    expect(result).toEqual(
      expect.objectContaining({
        error: true,
        status: expect.any(String),
        text: expect.any(String),
        value: expect.any(String),
      }),
    );
  });

  it('Should not work with duplicate socketId', async () => {
    const result = await addSocketId(socketId);
    // console.log('000000', result);

    expect(result).toEqual(
      expect.objectContaining({
        error: true,
        status: expect.any(String),
        text: expect.any(String),
        value: expect.any(String),
      }),
    );
  });
});

describe('getSocketIdArray', () => {
  it('Should work', async () => {
    const result = await getSocketIdArray();
    // console.log('000000', result);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.any(String),
      ]),
    );
  });
});

describe('removeSockeIdFromArray', () => {
  it('Should work', async () => {
    const result = await removeSockeIdFromArray(socketId);

    expect(result).toEqual(
      expect.objectContaining({
        error: false,
        status: '00',
        text: expect.any(String),
        value: expect.any(String),
      }),
    );
  });

  it('Should not work with nonexistent socketId', async () => {
    const result = await removeSockeIdFromArray(nonExistentSocketId);

    expect(result).toEqual(
      expect.objectContaining({
        error: true,
        status: expect.any(String),
        text: expect.any(String),
        value: expect.any(String),
      }),
    );
  });
});
