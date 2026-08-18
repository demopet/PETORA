import { useState } from "react";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ChangePinForm } from "../components/ChangePinForm";
import { useAuth } from "@/features/auth/context/AuthContext";

export default function ChangePinPage() {
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);
  const { changePin } = useAuth();

  const handleChangePin = async (oldPin: string, newPin: string) => {
    try {
      await changePin(oldPin, newPin);
      toast.success("PIN berhasil diubah");
      setIsChangePinOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengubah PIN");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ganti PIN</h1>
          <p className="mt-1 text-sm text-slate-500">
            Ubah PIN akun Anda secara berkala untuk keamanan
          </p>
        </div>
        <Button onClick={() => setIsChangePinOpen(true)}>
          <KeyRound className="h-4 w-4" />
          Ganti PIN
        </Button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Informasi PIN</h2>
        <p className="mt-2 text-sm text-slate-500">
          PIN digunakan untuk autentikasi saat login. Jangan bagikan PIN Anda
          kepada siapapun.
        </p>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>PIN harus 6 digit angka</li>
          <li>Hindari menggunakan tanggal lahir atau nomor telepon</li>
          <li>Ganti PIN secara berkala</li>
        </ul>
      </div>

      <ChangePinForm
        open={isChangePinOpen}
        onOpenChange={setIsChangePinOpen}
        onSubmit={handleChangePin}
      />
    </div>
  );
}
