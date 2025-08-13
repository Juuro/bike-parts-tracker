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
    // Generate a readable backup code (format: XXXX-XXXX)
    const code = crypto.randomBytes(4).toString("hex").toUpperCase();
    const formattedCode = `${code.slice(0, 4)}-${code.slice(4, 8)}`;

    // Hash the code for storage
    const hash = await bcrypt.hash(formattedCode, 12);

    codes.push({
      code: formattedCode,
      hash,
    });
  }

  return codes;
}

/**
 * Verify a backup code against a hash
 */
export async function verifyBackupCode(
  code: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(code, hash);
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
 * Validate backup code format (XXXX-XXXX)
 */
export function isValidBackupCodeFormat(code: string): boolean {
  return /^[A-F0-9]{4}-[A-F0-9]{4}$/.test(code.toUpperCase());
}

/**
 * Clean and format a backup code for verification
 */
export function formatBackupCode(code: string): string {
  return code.replace(/\s/g, "").toUpperCase();
}
