const { request } = require('@playwright/test');
const { config } = require('../config/config');

// Spartacus keeps the session in one localStorage entry. Writing it before the
// app boots is enough to start a scenario already signed in, which skips the
// two-step login form when logging in is only a precondition.
const AUTH_STORAGE_KEY = 'spartacus⚿⚿auth';

// The storefront's own OAuth client credentials -- they travel in plain sight in
// every browser request and are not user secrets. The account itself still comes
// from .env.
const OAUTH_CLIENT = { client_id: 'trusted_client', client_secret: 'secret' };

async function fetchAccessToken({ phone, password }) {
  const api = await request.newContext({ baseURL: config.apiUrl });
  try {
    const response = await api.post('/authorizationserver/oauth/token', {
      form: {
        ...OAUTH_CLIENT,
        grant_type: 'password',
        username: phone,
        password,
        captcha_token: 'null',
      },
    });

    if (!response.ok()) {
      const body = (await response.text()).slice(0, 200);
      throw new Error(`API girişi başarısız (HTTP ${response.status()}): ${body}`);
    }
    return response.json();
  } finally {
    await api.dispose();
  }
}

function sessionStorageValue(token) {
  return JSON.stringify({ token, userId: 'current', redirectUrl: '' });
}

module.exports = { fetchAccessToken, sessionStorageValue, AUTH_STORAGE_KEY };
