import { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { NumericKeypad } from "./NumericKeypad";

interface LoginFormProps {
  onSubmit: (_credentials: { username: string; pin: string }) => void;
  isLoading?: boolean;
  error?: string | null;
  lockoutUntil?: Date | null;
  remainingAttempts?: number;
}

function formatLockoutMessage(remainingSeconds: number): string {
  const minutes = Math.ceil(remainingSeconds / 60);
  return `Akun terkunci. Coba lagi dalam ${minutes} menit`;
}

export function LoginForm({
  onSubmit,
  isLoading = false,
  error = null,
  lockoutUntil = null,
  remainingAttempts = 3,
}: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);
  const [frontendLockoutRemaining, setFrontendLockoutRemaining] = useState(0);

  const isLockedOut = useMemo(() => {
    if (!lockoutUntil) return false;
    return lockoutUntil.getTime() > Date.now();
  }, [lockoutUntil]);

  useEffect(() => {
    if (!lockoutUntil || lockoutUntil.getTime() <= Date.now()) {
      setLockoutRemaining(0);
      return;
    }

    const updateRemaining = () => {
      const remaining = Math.max(0, Math.ceil((lockoutUntil.getTime() - Date.now()) / 1000));
      setLockoutRemaining(remaining);
      if (remaining <= 0) return;
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  useEffect(() => {
    if (frontendLockoutRemaining <= 0) return;

    const updateRemaining = () => {
      setFrontendLockoutRemaining((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    };

    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [frontendLockoutRemaining]);

  const isFrontendLocked = frontendLockoutRemaining > 0;

  const validate = useCallback((): boolean => {
    let valid = true;

    if (!username.trim()) {
      setUsernameError("Username wajib diisi");
      valid = false;
    } else if (username.trim().length < 3) {
      setUsernameError("Username minimal 3 karakter");
      valid = false;
    } else {
      setUsernameError(null);
    }

    if (!pin) {
      setPinError("PIN wajib diisi");
      valid = false;
    } else if (!/^\d{8}$/.test(pin)) {
      setPinError("PIN harus 8 digit angka");
      valid = false;
    } else {
      setPinError(null);
    }

    return valid;
  }, [username, pin]);

  const handleSubmit = useCallback(() => {
    if (!validate()) return;
    onSubmit({ username: username.trim(), pin });
  }, [validate, onSubmit, username, pin]);

  const handlePinChange = useCallback(
    (value: string) => {
      setPin(value);
      if (pinError) setPinError(null);
    },
    [pinError]
  );

  const combinedError = pinError || error;

  return (
    <div className="flex flex-col gap-6">
      <Input
        type="text"
        label="Username"
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
          if (usernameError) setUsernameError(null);
        }}
        placeholder="Masukkan username"
        error={usernameError ?? undefined}
        disabled={isLoading || isLockedOut || isFrontendLocked}
        autoComplete="username"
      />

      {isLockedOut && lockoutRemaining > 0 && (
        <p className="text-sm font-medium text-danger-600" data-testid="lockout-message">
          {formatLockoutMessage(lockoutRemaining)}
        </p>
      )}

      {isFrontendLocked && (
        <p className="text-sm font-medium text-warning-600">
          Terlalu banyak percobaan. Coba lagi dalam {frontendLockoutRemaining} detik
        </p>
      )}

      {remainingAttempts > 0 && remainingAttempts <= 2 && !isLockedOut && !isFrontendLocked && (
        <p className="text-sm text-warning-600">Sisa percobaan: {remainingAttempts}</p>
      )}

      <NumericKeypad
        value={pin}
        onChange={handlePinChange}
        onSubmit={handleSubmit}
        error={combinedError}
        disabled={isLoading || isLockedOut || isFrontendLocked}
        isLoading={isLoading}
      />

      <p className="text-center text-sm text-slate-500">Lupa PIN? Hubungi admin</p>
    </div>
  );
}
