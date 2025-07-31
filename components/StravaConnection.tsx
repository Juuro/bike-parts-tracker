"use client";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import toast from "react-hot-toast";
import { ExternalLink, Unlink, Check, AlertCircle } from "lucide-react";

interface StravaConnectionProps {
  onConnectionChange?: (connected: boolean) => void;
}

interface StravaStatus {
  connected: boolean;
  strava_id?: string;
  connected_at?: string;
  needsReauth?: boolean;
}

export default function StravaConnection({
  onConnectionChange,
}: StravaConnectionProps) {
  const [stravaStatus, setStravaStatus] = useState<StravaStatus>({
    connected: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Check Strava connection status on component mount
  useEffect(() => {
    checkStravaStatus();
  }, []);

  const checkStravaStatus = async () => {
    try {
      const response = await fetch("/api/strava/status");
      if (response.ok) {
        const status = await response.json();
        console.log("Strava status check:", status);

        // Just update the status without showing a toast
        // The popup callback handles success messages
        setStravaStatus(status);
        onConnectionChange?.(status.connected);
      }
    } catch (error) {
      console.error("Error checking Strava status:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const connectToStrava = () => {
    setIsConnecting(true);

    // Generate random state for security
    const state = Math.random().toString(36).substring(2, 15);

    const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
    const redirectUri = `${window.location.origin}/strava-callback`;
    const scope = "read,activity:read_all,profile:read_all";

    console.log("OAuth parameters:", {
      clientId,
      redirectUri,
      scope,
      state,
    });

    const stravaAuthUrl =
      `https://www.strava.com/oauth/authorize?` +
      `client_id=${clientId}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `approval_prompt=force&` +
      `scope=${scope}&` +
      `state=${state}`;

    // Store state for validation
    sessionStorage.setItem("strava_oauth_state", state);

    // Open Strava authorization in new window
    const popup = window.open(
      stravaAuthUrl,
      "strava-auth",
      "width=600,height=700,scrollbars=yes,resizable=yes"
    );

    // Listen for popup close or message
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        setIsConnecting(false);
        // Check status again after popup closes with a longer delay
        // to allow the backend to process the connection
        setTimeout(() => {
          console.log("Popup closed, checking connection status...");
          checkStravaStatus();
        }, 3000); // Increased delay to 3 seconds
      }
    }, 1000);

    // Listen for messages from popup
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "STRAVA_AUTH_SUCCESS") {
        clearInterval(checkClosed);
        popup?.close();
        setIsConnecting(false);
        toast.success("Successfully connected to Strava!");
        checkStravaStatus();
        window.removeEventListener("message", handleMessage);
      } else if (event.data.type === "STRAVA_AUTH_ERROR") {
        clearInterval(checkClosed);
        popup?.close();
        setIsConnecting(false);
        // Only show error toast if we get an explicit error message
        const errorMessage = event.data.error || "Connection failed";
        toast.error(`Failed to connect to Strava: ${errorMessage}`);
        window.removeEventListener("message", handleMessage);
      }
    };

    window.addEventListener("message", handleMessage);
  };

  const disconnectFromStrava = async () => {
    setIsDisconnecting(true);

    try {
      const response = await fetch("/api/strava/disconnect", {
        method: "POST",
      });

      if (response.ok) {
        setStravaStatus({ connected: false });
        onConnectionChange?.(false);
        toast.success("Disconnected from Strava");
      } else {
        toast.error("Failed to disconnect from Strava");
      }
    } catch (error) {
      console.error("Error disconnecting from Strava:", error);
      toast.error("Failed to disconnect from Strava");
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-orange-500"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.181" />
          </svg>
          <span className="font-medium text-gray-900">Strava Integration</span>
        </div>

        {stravaStatus.connected ? (
          <div className="flex items-center gap-2 text-green-600">
            <Check size={16} />
            <span className="text-sm">Connected</span>
          </div>
        ) : stravaStatus.needsReauth ? (
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle size={16} />
            <span className="text-sm">Needs Reauth</span>
          </div>
        ) : (
          <span className="text-sm text-gray-500">Not connected</span>
        )}
      </div>

      {stravaStatus.connected ? (
        <div className="space-y-3">
          <div className="text-sm text-gray-600">
            Connected to Strava ID:{" "}
            <span className="font-mono">{stravaStatus.strava_id}</span>
            {stravaStatus.connected_at && (
              <div className="text-xs text-gray-500 mt-1">
                Connected on{" "}
                {new Date(stravaStatus.connected_at).toLocaleDateString()}
              </div>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={disconnectFromStrava}
            disabled={isDisconnecting}
            className="w-full text-red-600 border-red-300 hover:bg-red-50"
          >
            <Unlink size={16} className="mr-2" />
            {isDisconnecting ? "Disconnecting..." : "Disconnect Strava"}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Connect your Strava account to sync activities and bike data
            automatically.
          </p>

          <Button
            type="button"
            onClick={connectToStrava}
            disabled={isConnecting}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            <ExternalLink size={16} className="mr-2" />
            {isConnecting ? "Connecting..." : "Connect to Strava"}
          </Button>

          {stravaStatus.needsReauth && (
            <p className="text-xs text-amber-600">
              Your Strava connection has expired. Please reconnect to continue
              syncing data.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
