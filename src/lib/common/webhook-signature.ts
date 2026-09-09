import { createHmac, timingSafeEqual } from 'crypto';

// FreeScout signs each webhook delivery with:
//   X-FreeScout-Signature = base64(HMAC-SHA1(rawBody, secret))
// where `secret` is the "Secret Key" shown under Manage » Settings » API & Webhooks.
// https://freescout.net/module/api-webhooks/
export function verifyFreescoutSignature(params: {
  rawBody: unknown;
  signatureHeader: string | undefined;
  secret: string | undefined;
}): boolean {
  const { rawBody, signatureHeader, secret } = params;

  // No signing key configured: verification is opt-in, so let everything through.
  if (!secret) {
    return true;
  }
  if (typeof rawBody !== 'string' || !rawBody || !signatureHeader) {
    return false;
  }

  try {
    const expected = createHmac('sha1', secret).update(rawBody, 'utf8').digest('base64');
    const expectedBuffer = Buffer.from(expected);
    const actualBuffer = Buffer.from(signatureHeader);
    if (expectedBuffer.length !== actualBuffer.length) {
      return false;
    }
    return timingSafeEqual(expectedBuffer, actualBuffer);
  } catch {
    return false;
  }
}
