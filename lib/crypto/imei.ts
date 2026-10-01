/**
 * AES-256-GCM encryption for IMEI numbers stored in the `units` table.
 *
 * Storage format (all hex): "<iv>:<authTag>:<ciphertext>"
 *
 * Required env var:
 *   IMEI_ENCRYPTION_KEY — 64 hex chars (32 bytes)
 *   Generate: openssl rand -hex 32
 */

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  const hex = process.env.IMEI_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      "IMEI_ENCRYPTION_KEY must be set to a 64-character hex string (32 bytes)."
    );
  }
  return Buffer.from(hex, "hex");
}

/**
 * Encrypts a plain-text IMEI.
 * Returns "<iv_hex>:<authTag_hex>:<ciphertext_hex>"
 */
export function encryptImei(imei: string): string {
  const key = getKey();
  const iv = randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(imei, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
}

/**
 * Decrypts an IMEI previously encrypted with `encryptImei`.
 */
export function decryptImei(stored: string): string {
  const key = getKey();
  const parts = stored.split(":");
  if (parts.length !== 3) throw new Error("Invalid IMEI ciphertext format.");

  const [ivHex, authTagHex, ciphertextHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const ciphertext = Buffer.from(ciphertextHex, "hex");

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString(
    "utf8"
  );
}
