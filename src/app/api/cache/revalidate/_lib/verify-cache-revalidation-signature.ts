import { createHmac, timingSafeEqual } from 'node:crypto';

const SIGNATURE_PATTERN = /^sha256=([a-f0-9]{64})$/;
const REPLAY_WINDOW_SECONDS = 300;

type VerifyInput = {
  rawBody: string;
  timestampHeader: string | null;
  signatureHeader: string | null;
  secret: string;
  nowSeconds?: number;
};

export function verifyCacheRevalidationSignature({
  rawBody,
  timestampHeader,
  signatureHeader,
  secret,
  nowSeconds = Math.floor(Date.now() / 1000),
}: VerifyInput): boolean {
  if (!/^\d+$/.test(timestampHeader ?? '')) return false;

  const timestamp = Number(timestampHeader);
  if (!Number.isSafeInteger(timestamp)) return false;
  if (Math.abs(nowSeconds - timestamp) > REPLAY_WINDOW_SECONDS) return false;

  const signatureMatch = signatureHeader?.match(SIGNATURE_PATTERN);
  if (!signatureMatch) return false;

  const expected = createHmac('sha256', secret)
    .update(`${timestampHeader}.${rawBody}`, 'utf8')
    .digest();
  const received = Buffer.from(signatureMatch[1], 'hex');

  return received.length === expected.length && timingSafeEqual(received, expected);
}
