import { useLogin } from "../hooks/useLogin";
import { LoginForm } from "../components/LoginForm";

export default function LoginPage() {
  const { login, isLoading, error, lockoutUntil, failedAttempts, remainingAttempts } = useLogin();

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 bg-primary-600 items-center justify-center p-12">
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold">🐾 Petora</h1>
          <p className="mt-4 text-xl opacity-90">Sistem Manajemen Terpadu</p>
          <p className="text-xl opacity-90">Petshop & Petcare</p>
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-slate-900">Selamat Datang</h2>
            <p className="mt-2 text-sm text-slate-500">Masuk ke akun Petora Anda</p>
          </div>

          <div className="text-center lg:hidden">
            <h1 className="text-3xl font-bold text-primary-600">🐾 Petora</h1>
          </div>

          <LoginForm
            onSubmit={login}
            isLoading={isLoading}
            error={error}
            lockoutUntil={lockoutUntil}
            failedAttempts={failedAttempts}
            remainingAttempts={remainingAttempts}
          />
        </div>
      </div>
    </div>
  );
}
