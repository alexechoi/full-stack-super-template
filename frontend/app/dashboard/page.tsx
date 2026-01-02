"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/app/components/AuthProvider";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";
import { apiGet } from "@/app/lib/api";
import { signOut } from "@/app/lib/firebase/auth";
import { getUserDocument } from "@/app/lib/firebase/firestore";

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
}

interface ApiTestResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiTestResult, setApiTestResult] = useState<ApiTestResult | null>(
    null,
  );
  const [apiTestLoading, setApiTestLoading] = useState(false);

  useEffect(() => {
    async function fetchUserData() {
      if (user) {
        try {
          const data = await getUserDocument(user.uid);
          if (data) {
            setUserData(data as UserData);
          }
        } catch {
          // User doc might not exist
        }
      }
      setLoading(false);
    }

    fetchUserData();
  }, [user]);

  async function handleTestProtectedRoute() {
    setApiTestLoading(true);
    setApiTestResult(null);

    try {
      const data = await apiGet("/me");
      setApiTestResult({ success: true, data });
    } catch (err) {
      setApiTestResult({
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setApiTestLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      router.push("/auth/login");
    } catch {
      // Handle error silently
    }
  }

  const displayName = userData?.firstName
    ? `${userData.firstName} ${userData.lastName || ""}`.trim()
    : user?.displayName || user?.email || "User";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Dashboard
          </h1>
          <button
            onClick={handleSignOut}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12">
        <div className="rounded-xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
          {loading ? (
            <div className="text-zinc-500">Loading...</div>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                Welcome, {displayName}
              </h2>
              <p className="mt-2 text-zinc-500 dark:text-zinc-400">
                You are signed in as {user?.email}
              </p>

              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
                  <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    Account Status
                  </div>
                  <div className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    Active
                  </div>
                </div>

                <div className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
                  <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    Email Verified
                  </div>
                  <div className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {user?.emailVerified ? "Yes" : "No"}
                  </div>
                </div>

                <div className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
                  <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    User ID
                  </div>
                  <div className="mt-1 truncate font-mono text-sm text-zinc-900 dark:text-zinc-100">
                    {user?.uid}
                  </div>
                </div>
              </div>

              {/* API Test Section */}
              <div className="mt-8 rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Backend API Test
                </h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Test the protected /me endpoint with your Firebase token
                </p>

                <button
                  onClick={handleTestProtectedRoute}
                  disabled={apiTestLoading}
                  className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                >
                  {apiTestLoading ? "Testing..." : "Test Protected Route"}
                </button>

                {apiTestResult && (
                  <div
                    className={`mt-4 rounded-lg p-4 ${
                      apiTestResult.success
                        ? "bg-green-50 dark:bg-green-900/20"
                        : "bg-red-50 dark:bg-red-900/20"
                    }`}
                  >
                    <div
                      className={`text-sm font-medium ${
                        apiTestResult.success
                          ? "text-green-800 dark:text-green-200"
                          : "text-red-800 dark:text-red-200"
                      }`}
                    >
                      {apiTestResult.success ? "✓ Success" : "✗ Failed"}
                    </div>
                    <pre
                      className={`mt-2 overflow-auto text-xs ${
                        apiTestResult.success
                          ? "text-green-700 dark:text-green-300"
                          : "text-red-700 dark:text-red-300"
                      }`}
                    >
                      {JSON.stringify(
                        apiTestResult.data || apiTestResult.error,
                        null,
                        2,
                      )}
                    </pre>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
