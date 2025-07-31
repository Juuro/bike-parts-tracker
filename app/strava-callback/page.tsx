"use client";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";

export default function StravaCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Processing Strava authorization...");
  const processedRef = useRef(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    
    // Create unique key for this authorization attempt
    const authKey = `strava_auth_${code}_${state}`;
    
    // Check if we've already processed this exact authorization
    if (processedRef.current || sessionStorage.getItem(authKey)) {
      console.log("Already processed this authorization, skipping...");
      return;
    }
    
    const handleCallback = async () => {
      processedRef.current = true;
      sessionStorage.setItem(authKey, "processed");
      console.log("Starting callback processing...");
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const error = searchParams.get("error");

      console.log("Callback received:", { code: !!code, state, error });

      if (error) {
        setStatus("error");
        setMessage(`Authorization failed: ${error}`);
        setTimeout(() => window.close(), 2000);
        return;
      }

      if (!code) {
        setStatus("error");
        setMessage("No authorization code received.");
        setTimeout(() => window.close(), 2000);
        return;
      }

      // Verify state (basic CSRF protection)
      const storedState = sessionStorage.getItem("strava_oauth_state");
      if (state !== storedState) {
        setStatus("error");
        setMessage("Invalid state parameter.");
        setTimeout(() => window.close(), 2000);
        return;
      }

      try {
        console.log("Sending code to backend...");

        // Send code to our backend
        const response = await fetch("/api/strava/connect", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code, state }),
        });

        const data = await response.json();
        console.log("Backend response:", data);

        if (data.success) {
          setStatus("success");
          setMessage("Successfully connected to Strava!");

          // Notify parent window
          if (window.opener) {
            window.opener.postMessage(
              {
                type: "STRAVA_AUTH_SUCCESS",
                data: data,
              },
              window.location.origin
            );
          }
        } else {
          setStatus("error");
          setMessage(`Failed to connect: ${data.error || "Unknown error"}`);

          if (window.opener) {
            window.opener.postMessage(
              {
                type: "STRAVA_AUTH_ERROR",
                error: data.error || "Unknown error",
              },
              window.location.origin
            );
          }
        }

        setTimeout(() => window.close(), 1500);
      } catch (err) {
        console.error("Error:", err);
        setStatus("error");
        setMessage("An error occurred while connecting to Strava.");

        if (window.opener) {
          window.opener.postMessage(
            {
              type: "STRAVA_AUTH_ERROR",
              error: (err as Error).message,
            },
            window.location.origin
          );
        }

        setTimeout(() => window.close(), 2000);
      }
    };

    handleCallback();
  }, [searchParams]);

  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      default:
        return "text-blue-600";
    }
  };

  const getIcon = () => {
    switch (status) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      default:
        return "🔄";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
        <div className="text-4xl mb-4">{getIcon()}</div>
        <div className={`text-lg font-medium ${getStatusColor()} mb-4`}>
          {message}
        </div>
        {status === "loading" && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        )}
        {status !== "loading" && (
          <p className="text-sm text-gray-500 mt-4">
            This window will close automatically in a few seconds.
          </p>
        )}
      </div>
    </div>
  );
}
