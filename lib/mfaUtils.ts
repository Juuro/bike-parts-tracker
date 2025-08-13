// MFA utility functions for TOTP and backup codes
import { authenticator } from "@otplib/preset-default";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export interface BackupCode {
  code: string;
  hash: string;
}

export interface MFASetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: BackupCode[];
}

/**
 * Generate a new TOTP secret and QR code URL for MFA setup
 */
export function generateMFASecret(
  userEmail: string,
  issuer: string = "Bike Parts Tracker"
): { secret: string; qrCodeUrl: string } {
  const secret = authenticator.generateSecret();
  const qrCodeUrl = authenticator.keyuri(userEmail, issuer, secret);

  return { secret, qrCodeUrl };
}

/**
 * Verify a TOTP code against a secret
 */
export function verifyMFACode(code: string, secret: string): boolean {
  return authenticator.check(code, secret);
}

/**
 * Generate backup codes for account recovery
 */
export async function generateBackupCodes(
  count: number = 8
): Promise<BackupCode[]> {
  const codes: BackupCode[] = [];

  for (let i = 0; i < count; i++) {
    // Generate a 8-character hex backup code (32 bits of entropy)
    const code = crypto.randomBytes(4).toString("hex").toUpperCase();

    // Hash the code for storage
    const hash = await bcrypt.hash(code, 12);

    codes.push({
      code,
      hash,
    });
  }

  return codes;
}

/**
 * Verify a backup code against a hash
 * Supports both old format (XXXX-XXXX) and new format (XXXXXXXX)
 */
export async function verifyBackupCode(
  code: string,
  hash: string
): Promise<boolean> {
  // Try original input first
  let isValid = await bcrypt.compare(code, hash);
  if (isValid) return true;

  // Try cleaned format (new format: XXXXXXXX)
  const cleanedCode = code.replace(/[\s-]/g, "").toUpperCase();
  if (cleanedCode.length === 8 && cleanedCode !== code) {
    isValid = await bcrypt.compare(cleanedCode, hash);
    if (isValid) return true;
  }

  // Try formatted version (old format: XXXX-XXXX)
  if (cleanedCode.length === 8 && !code.includes("-")) {
    const formattedCode = `${cleanedCode.slice(0, 4)}-${cleanedCode.slice(
      4,
      8
    )}`;
    isValid = await bcrypt.compare(formattedCode, hash);
    if (isValid) return true;
  }

  return false;
}

/**
 * Generate a secure random recovery code for emergency access
 */
export function generateRecoveryCode(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Validate MFA code format (6 digits)
 */
export function isValidMFACodeFormat(code: string): boolean {
  return /^\d{6}$/.test(code);
}

/**
 * Validate backup code format (8 hex characters)
 */
export function isValidBackupCodeFormat(code: string): boolean {
  return /^[A-F0-9]{8}$/.test(code.toUpperCase());
}

/**
 * Clean and format a backup code for verification
 */
export function formatBackupCode(code: string): string {
  return code.replace(/[\s-]/g, "").toUpperCase();
}
