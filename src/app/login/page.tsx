import { auth, signIn } from "~/server/auth";
import { redirect } from "next/navigation";
import { DiscordIcon } from "~/app/_components/icons/discord";

export default async function SignInPage() {
  const session = await auth();

  // Redirect authenticated users to home
  if (session?.user) {
    redirect("/");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-12 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950">
      <div className="bg-shape shape1"></div>
      <div className="bg-shape shape2"></div>
      <div className="bg-shape shape3"></div>
      {/* Main glassmorphic card */}
      <div className="relative w-full max-w-md">
        {/* Glassmorphic container */}
        <div className="glass-card sm:p-12">
          {/* Logo/Title Section */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg ring-4 ring-white/50 dark:ring-white/10">
              <svg
                className="h-10 w-10 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Finance Tracker
            </h1>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 sm:text-base">
              Track your finances with ease
            </p>
          </div>

          {/* Sign in section */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-100">
                Welcome back
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sign in to continue to your account
              </p>
            </div>

            {/* Discord Sign In Button */}
            <form
              action={async () => {
                "use server";
                await signIn("discord", { redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="group relative w-full overflow-hidden rounded-2xl bg-[#5865F2] px-6 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-[#5865F2]/50 sm:px-8 sm:py-5"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#5865F2] to-[#4752C4] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative flex items-center justify-center gap-3">
                  <DiscordIcon className="h-6 w-6" />
                  <span className="text-base sm:text-lg">
                    Sign in with Discord
                  </span>
                </div>
              </button>
            </form>

            {/* Decorative divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white/40 px-4 text-gray-500 backdrop-blur-xl dark:bg-gray-900/40 dark:text-gray-400">
                  Secure authentication
                </span>
              </div>
            </div>

            {/* Info text */}
            <div className="space-y-3 text-center text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
              <p>
                By signing in, you agree to our Terms of Service and Privacy
                Policy
              </p>
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="h-4 w-4 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">
                  Your data is encrypted and secure
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle reflection effect */}
        <div className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
    </div>
  );
}
