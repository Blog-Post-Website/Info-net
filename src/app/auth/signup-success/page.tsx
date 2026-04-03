export default function SignupSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-emerald-200 bg-white p-8 shadow-lg text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
          <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="mt-4 text-2xl font-bold text-slate-900">Check Your Email</h1>
        <p className="mt-2 text-slate-600">
          We&apos;ve sent you a confirmation link. Please check your email and click the link to activate your account.
        </p>

        <p className="mt-6 text-sm text-slate-500">
          Once confirmed, you can{" "}
          <a href="/auth/login" className="font-medium text-emerald-600 hover:text-emerald-700">
            sign in here
          </a>
          .
        </p>
      </div>
    </main>
  );
}
