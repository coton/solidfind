const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { pathToFileURL } = require('url');

const projectRoot = path.join(__dirname, '..');
const verificationModuleUrl = pathToFileURL(
  path.join(projectRoot, 'src/lib/auth-verification.mjs')
).href;

test('sanitizeVerificationCode keeps only digits so pasted codes with spaces or hyphens still verify', async () => {
  const { sanitizeVerificationCode } = await import(verificationModuleUrl);

  assert.equal(sanitizeVerificationCode(' 12 3-4a5_6 '), '123456');
  assert.equal(sanitizeVerificationCode(''), '');
});

test('isVerificationCodeComplete only accepts full six-digit codes after sanitizing', async () => {
  const { isVerificationCodeComplete } = await import(verificationModuleUrl);

  assert.equal(isVerificationCodeComplete('123456'), true);
  assert.equal(isVerificationCodeComplete('12 34-56'), true);
  assert.equal(isVerificationCodeComplete('12345'), false);
  assert.equal(isVerificationCodeComplete('abcdef'), false);
});

test('getVerificationErrorMessage turns expired Clerk codes into a resend hint', async () => {
  const { getVerificationErrorMessage } = await import(verificationModuleUrl);

  assert.equal(
    getVerificationErrorMessage(
      { errors: [{ message: 'Code expired. Please request a new code.' }] },
      {
        fallbackMessage: 'Invalid verification code.',
        expiredMessage: 'This code expired. Please request a new one.',
      }
    ),
    'This code expired. Please request a new one.'
  );
});

test('getVerificationErrorMessage preserves non-expired Clerk messages and falls back when needed', async () => {
  const { getVerificationErrorMessage } = await import(verificationModuleUrl);

  assert.equal(
    getVerificationErrorMessage(
      { errors: [{ message: 'Incorrect code.' }] },
      {
        fallbackMessage: 'Invalid verification code.',
        expiredMessage: 'This code expired. Please request a new one.',
      }
    ),
    'Incorrect code.'
  );

  assert.equal(
    getVerificationErrorMessage(
      {},
      {
        fallbackMessage: 'Invalid verification code.',
        expiredMessage: 'This code expired. Please request a new one.',
      }
    ),
    'Invalid verification code.'
  );
});

test('getAuthStatusMessage explains when Clerk needs a second factor instead of silently stalling', async () => {
  const { getAuthStatusMessage } = await import(verificationModuleUrl);

  assert.equal(
    getAuthStatusMessage('needs_second_factor', {
      fallbackMessage: 'Login requires additional verification.',
      needsSecondFactorMessage: 'This account requires two-factor authentication. The current popup cannot complete the second step yet.',
    }),
    'This account requires two-factor authentication. The current popup cannot complete the second step yet.'
  );
});

test('getAuthStatusMessage falls back for other incomplete Clerk statuses', async () => {
  const { getAuthStatusMessage } = await import(verificationModuleUrl);

  assert.equal(
    getAuthStatusMessage('needs_identifier', {
      fallbackMessage: 'Login requires additional verification.',
      needsSecondFactorMessage: 'This account requires two-factor authentication. The current popup cannot complete the second step yet.',
    }),
    'Login requires additional verification.'
  );

  assert.equal(
    getAuthStatusMessage(undefined, {
      fallbackMessage: 'Login requires additional verification.',
      needsSecondFactorMessage: 'This account requires two-factor authentication. The current popup cannot complete the second step yet.',
    }),
    'Login requires additional verification.'
  );
});
