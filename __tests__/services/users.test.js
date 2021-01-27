import {
  authorize,
  logout,
  logoutEverywhere,
  getLogoutUser,
  disconnect,
} from '../../src/services/users';

const generalUserId = 780;
const nonexistentUserId = 1001;
const authorizeData = {
  userId: generalUserId, socketId: 'sd234rfd.eddas', page: 'main',
};
const anotherPageUserData = {
  userId: generalUserId, socketId: 'sd234rfd.eddas', page: 'kein',
};
const duplicatePageUserData = {
  userId: generalUserId, socketId: 'asdf$$44das', page: 'kein',
};
// const onDisconnectUserData = {
//   userId: generalUserId, socketId: undefined, page: 'lol',
// };

beforeEach(async () => {
  await authorize(authorizeData);
});

describe('Authorize', () => {
  it('Should authorize', async () => {
    const result = await authorize({ userId: 783, socketId: 'sdffrfd.edas', page: 'main' });

    expect(result).toEqual(
      expect.objectContaining({
        user: expect.objectContaining({
          userId: expect.any(Number),
          uniqueSocketIds: expect.arrayContaining([
            expect.any(String),
          ]),
          page: expect.any(String),
        }),
      }),
    );
  });

  it('Should authorize on another site\'s page. isUserExist === true', async () => {
    const result = await authorize(anotherPageUserData);

    expect(result).toEqual(
      expect.objectContaining({
        error: expect.any(Boolean),
        status: expect.any(String),
        text: 'User exist',
        value: null,
      }),
    );
  });

  // TODO: uncomment if it needed.
  // it('Should authorize on Diconnect. onDisconnect === true', async () => {
  //   const result = await authorize(onDisconnectUserData);
  //   // console.log('Should authorize: ', result);

  //   expect(result).toEqual(
  //     expect.objectContaining({
  //       error: expect.any(Boolean),
  //       status: expect.any(String),
  //       text: 'User disconnected',
  //       value: null,
  //     }),
  //   );
  // });

  it('Should not authorize with wrong data format', async () => {
    const result = await authorize({ userId: '783', socketId: '1234', page: 'main' });
    // console.log('Should authorize: ', result);

    expect(result).toEqual(
      expect.objectContaining({
        error: expect.any(Boolean),
        status: expect.any(String),
        text: expect.any(String),
        value: expect.any(String),
      }),
    );
  });

  it('Should not allow duplicate tab', async () => {
    const result = await authorize(duplicatePageUserData);
    // console.log('Should authorize: ', result);

    expect(result).toEqual(
      expect.objectContaining({
        error: expect.any(Boolean),
        status: expect.any(String),
        text: expect.any(String),
        value: null,
      }),
    );
  });

  it('Should not authorize if user doesn\'t exist in DB', async () => {
    const result = await authorize({ userId: undefined, socketId: '1234', page: 'main' });

    expect(result).toEqual(
      expect.objectContaining({
        error: expect.any(Boolean),
        status: expect.any(String),
        text: expect.any(String),
        value: expect.any(String),
      }),
    );
  });
});


describe('Logout', () => {
  it('Should logout', async () => {
    const result = await logout(generalUserId);

    expect(result).toEqual(
      expect.objectContaining({
        error: expect.any(Boolean),
        status: expect.any(String),
        text: expect.any(String),
        value: expect.arrayContaining([]),
      }),
    );
  });

  it('Should not logout with empty data', async () => {
    const result = await logout();

    expect(result).toEqual(
      expect.objectContaining({
        error: expect.any(Boolean),
        status: expect.any(String),
        text: expect.any(String),
        value: null,
      }),
    );
  });

  it('Should not logout with wrong data format', async () => {
    const result = await logout({ userId: generalUserId });

    expect(result).toEqual(
      expect.objectContaining({
        error: expect.any(Boolean),
        status: expect.any(String),
        text: expect.any(String),
      }),
    );

    expect(result.value).toBeNull();
  });

  it('Should not logout with nonexistent id', async () => {
    const result = await logout(nonexistentUserId);

    expect(result).toEqual(
      expect.objectContaining({
        error: expect.any(Boolean),
        status: expect.any(String),
        text: expect.any(String),
      }),
    );

    expect(result.value).toBeNull();
  });
});

describe('LogoutEverywhere', () => {
  it('Should logout everywhere', async () => {
    const result = await logoutEverywhere({ userId: generalUserId, page: 'main' });

    expect(result).toEqual(
      expect.objectContaining({
        error: expect.any(Boolean),
        status: expect.any(String),
        text: expect.any(String),
        value: expect.objectContaining({
          page: expect.any(String),
          uniqueSocketIds: null,
          userId: expect.any(Number),
        }),
      }),
    );
  });

  it('Should not logoutEverywhere with empty data', async () => {
    const result = await logoutEverywhere();

    expect(result).toEqual(
      expect.objectContaining({
        error: expect.any(Boolean),
        status: expect.any(String),
        text: expect.any(String),
        value: expect.any(String),
      }),
    );
  });

  it('Should not logout everywhere with wrong data format', async () => {
    const result = await logoutEverywhere({ userId: generalUserId, pageg: 'main' });

    expect(result).toEqual(
      expect.objectContaining({
        error: expect.any(Boolean),
        status: expect.any(String),
        text: expect.any(String),
        value: expect.any(String),
      }),
    );
  });

  it('Should not logout everywhere with nonexistent user', async () => {
    const result = await logoutEverywhere({ userId: nonexistentUserId, page: 'main' });

    expect(result).toEqual(
      expect.objectContaining({
        error: expect.any(Boolean),
        status: expect.any(String),
        text: expect.any(String),
        value: expect.any(String),
      }),
    );
  });
});

describe('getLogoutUser', () => {
  it('Should Get logout user', async () => {
    const result = await getLogoutUser(generalUserId);

    expect(result).toEqual(
      expect.objectContaining({
        userId: expect.any(Number),
        uniqueSocketIds: expect.arrayContaining([
          expect.any(String),
        ]),
        page: expect.any(String),
      }),
    );
  });

  it('Should not getLogoutUser with empty data', async () => {
    const result = await getLogoutUser();

    expect(result).toEqual(
      expect.objectContaining({
        error: expect.any(Boolean),
        status: expect.any(String),
        text: expect.any(String),
        value: expect.any(String),
      }),
    );
  });

  it('Should not Get logout user with wrong data format', async () => {
    const result = await getLogoutUser({ userId: generalUserId });

    expect(result).toEqual(
      expect.objectContaining({
        error: expect.any(Boolean),
        status: expect.any(String),
        text: expect.any(String),
        value: expect.any(String),
      }),
    );
  });

  it('Should not Get logout user with nonexistent user', async () => {
    const result = await getLogoutUser(nonexistentUserId);

    expect(result).toEqual(
      expect.objectContaining({
        error: expect.any(Boolean),
        status: expect.any(String),
        text: expect.any(String),
        value: expect.any(String),
      }),
    );
  });
});

describe('Disconnect', () => {
  it('Should Disconnect', async () => {
    const result = await disconnect('sd234rfd.eddas');

    expect(result).toEqual(
      expect.objectContaining({
        error: expect.any(Boolean),
        status: expect.any(String),
        text: expect.any(String),
        value: expect.any(String),
      }),
    );
  });

  it('Should not Disconnect with empty data', async () => {
    const result = await disconnect();

    expect(result).toEqual(
      expect.objectContaining({
        error: expect.any(Boolean),
        status: expect.any(String),
        text: expect.any(String),
        value: expect.any(String),
      }),
    );
  });

  it('Should not Disconnect with wrong data format', async () => {
    const result = await disconnect({ socketId: 'sd234rfd.eddas' });

    expect(result).toEqual(
      expect.objectContaining({
        error: expect.any(Boolean),
        status: expect.any(String),
        text: expect.any(String),
        value: expect.any(String),
      }),
    );
  });

  it('Should not Disconnect with nonexistent socket', async () => {
    const result = await disconnect('sdfsfsdfff31212');

    expect(result).toEqual(
      expect.objectContaining({
        error: expect.any(Boolean),
        status: expect.any(String),
        text: expect.any(String),
        value: null,
      }),
    );
  });
});
