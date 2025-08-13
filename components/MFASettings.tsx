"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  QrCode,
  Shield,
  Smartphone,
  Key,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import QRCode from "qrcode";

interface MFAStatus {
  mfaEnabled: boolean;
  webauthnEnabled: boolean;
  backupCodesCount: number;
  backupCodesGeneratedAt: string | null;
  authenticators: Array<{
    id: string;
    deviceType: string;
    createdAt: string;
    lastUsedAt: string | null;
  }>;
}

export function MFASettings() {
  const [status, setStatus] = useState<MFAStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [setupStep, setSetupStep] = useState<"none" | "qr" | "verify">("none");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedCodes, setCopiedCodes] = useState(false);

  useEffect(() => {
    fetchMFAStatus();
  }, []);

  const generateQRCode = async (totpUrl: string) => {
    try {
      const dataUrl = await QRCode.toDataURL(totpUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrCodeDataUrl(dataUrl);
    } catch (error) {
      toast.error("Failed to generate QR code");
    }
  };

  const fetchMFAStatus = async () => {
    try {
      const response = await fetch("/api/mfa/status", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      } else {
        toast.error("Failed to fetch MFA status");
      }
    } catch (error) {
      toast.error("Error fetching MFA status");
    } finally {
      setLoading(false);
    }
  };

  const startMFASetup = async () => {
    try {
      const response = await fetch("/api/mfa/setup", {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setQrCodeUrl(data.qrCodeUrl);
        await generateQRCode(data.qrCodeUrl);
        setSetupStep("qr");
        toast.success("Scan the QR code with your authenticator app");
      } else {
        const error = await response.text();
        toast.error(error || "Failed to setup MFA");
      }
    } catch (error) {
      toast.error("Error setting up MFA");
    }
  };

  const verifyAndEnableMFA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Please enter a 6-digit verification code");
      return;
    }

    try {
      const response = await fetch("/api/mfa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ verificationCode }),
      });

      if (response.ok) {
        const data = await response.json();
        setBackupCodes(data.backupCodes);
        setSetupStep("verify");
        toast.success("MFA enabled successfully!");
        // Don't fetch status immediately - let user see backup codes first
      } else {
        const error = await response.text();
        toast.error(error || "Failed to verify code");
      }
    } catch (error) {
      toast.error("Error enabling MFA");
    }
  };

  const disableMFA = async () => {
    const code = prompt(
      "Enter your current MFA code or backup code to disable MFA:"
    );
    if (!code) return;

    try {
      // Clean the code and determine if it's a backup code or verification code
      const cleanedCode = code.replace(/[\s-]/g, "").toUpperCase();
      const isBackupCode = /^[A-F0-9]{8}$/i.test(cleanedCode);
      const body = isBackupCode
        ? { backupCode: cleanedCode }
        : { verificationCode: code };

      const response = await fetch("/api/mfa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success("MFA disabled successfully");
        setSetupStep("none");
        fetchMFAStatus();
      } else {
        const error = await response.text();
        toast.error(error || "Failed to disable MFA");
      }
    } catch (error) {
      toast.error("Error disabling MFA");
    }
  };

  const copyBackupCodes = () => {
    const codesText = backupCodes.join("\n");
    navigator.clipboard.writeText(codesText);
    setCopiedCodes(true);
    toast.success("Backup codes copied to clipboard");
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  const finishSetup = () => {
    setSetupStep("none");
    setQrCodeUrl("");
    setQrCodeDataUrl("");
    setVerificationCode("");
    setBackupCodes([]);
    // Now fetch the updated status to show MFA is enabled
    fetchMFAStatus();
  };

  if (loading) {
    return <div className="flex justify-center p-4">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Multi-Factor Authentication (MFA)
          </h2>
          <p className="text-sm text-gray-600">
            Add an extra layer of security to your account
          </p>
        </div>
        <div className="space-y-4">
          {status?.mfaEnabled ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800"
                  >
                    Enabled
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    MFA is protecting your account
                  </span>
                </div>
                <Button variant="destructive" size="sm" onClick={disableMFA}>
                  Disable MFA
                </Button>
              </div>

              {status.backupCodesCount > 0 && (
                <Alert>
                  <Key className="h-4 w-4" />
                  <AlertDescription>
                    You have {status.backupCodesCount} unused backup codes
                    remaining. These can be used to access your account if you
                    lose your authenticator app.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {setupStep === "none" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Set up an authenticator app like Google Authenticator,
                    Authy, or 1Password to secure your account.
                  </p>
                  <Button
                    onClick={startMFASetup}
                    className="flex items-center gap-2"
                  >
                    <Smartphone className="h-4 w-4" />
                    Set Up MFA
                  </Button>
                </div>
              )}

              {setupStep === "qr" && (
                <div className="space-y-4">
                  <Alert>
                    <QrCode className="h-4 w-4" />
                    <AlertDescription>
                      Scan this QR code with your authenticator app, then enter
                      the 6-digit code below.
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-center p-4 bg-white rounded-lg border">
                    {qrCodeDataUrl ? (
                      <img
                        src={qrCodeDataUrl}
                        alt="MFA QR Code"
                        className="w-48 h-48"
                      />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded">
                        <span className="text-gray-500">
                          Generating QR code...
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) =>
                        setVerificationCode(
                          e.target.value.replace(/\D/g, "").slice(0, 6)
                        )
                      }
                      className="text-center text-lg tracking-widest"
                      maxLength={6}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={verifyAndEnableMFA}
                        disabled={verificationCode.length !== 6}
                      >
                        Verify & Enable MFA
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSetupStep("none")}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {setupStep === "verify" && backupCodes.length > 0 && (
                <div className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Important:</strong> Save these backup codes in a
                      secure location. You can use them to access your account
                      if you lose your authenticator app.
                    </AlertDescription>
                  </Alert>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Backup Codes</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyBackupCodes}
                        className="flex items-center gap-1"
                      >
                        {copiedCodes ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        {copiedCodes ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                      {backupCodes.map((code, index) => (
                        <div
                          key={index}
                          className="p-2 bg-white rounded border"
                        >
                          {code}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button onClick={finishSetup} className="w-full">
                    I've Saved My Backup Codes
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
