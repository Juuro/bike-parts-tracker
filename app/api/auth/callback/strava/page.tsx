"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function StravaCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Processing Strava authorization...");
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const error = searchParams.get("error");

      if (error) {
        setStatus("error");
        setMessage("Authorization was cancelled or failed.");
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
        // Send code to our backend
        const response = await fetch("/api/strava/connect", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code, state }),
        });

        const data = await response.json();

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
          setMessage("Failed to connect to Strava.");

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

        setTimeout(() => window.close(), 2000);
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
        <div className={`text-lg font-medium ${getStatusColor()}`}>
          {message}
        </div>
        {status === "loading" && (
          <div className="mt-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
}
