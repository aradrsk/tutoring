export default function VerifyEmailPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16 text-center">
      <h1 className="mb-4 text-2xl font-semibold tracking-tight">Check your email</h1>
      <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        We sent a verification link to the email you signed up with. Click it to
        activate your account, then come back and log in. You must verify before
        you can book a session.
      </p>
    </main>
  );
}
