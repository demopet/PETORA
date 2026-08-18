import * as React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectOption } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";

interface UserFormProps {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  onSubmit: (_data: { username: string; pin: string; role: string; full_name: string }) => void;
  isLoading?: boolean;
}

export function UserForm({ open, onOpenChange, onSubmit, isLoading }: UserFormProps) {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [pin, setPin] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!username) {
      newErrors.username = "Username is required";
    } else if (!/^[a-z0-9._]+$/.test(username)) {
      newErrors.username =
        "Username must only contain lowercase letters, numbers, dots, and underscores";
    } else if (username.length < 3 || username.length > 50) {
      newErrors.username = "Username must be between 3 and 50 characters";
    }

    if (!fullName) {
      newErrors.fullName = "Full name is required";
    }

    if (!role) {
      newErrors.role = "Role is required";
    }

    if (!pin) {
      newErrors.pin = "PIN is required";
    } else if (!/^\d{6}$/.test(pin)) {
      newErrors.pin = "PIN must be exactly 8 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ username, pin, role, full_name: fullName });
  };

  const handleReset = () => {
    setUsername("");
    setFullName("");
    setRole("");
    setPin("");
    setErrors({});
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) handleReset();
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Staf Baru</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Username" required>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="contoh: john.doe"
              error={errors.username}
              pattern="[a-z0-9._]+"
              minLength={3}
              maxLength={50}
            />
          </FormField>

          <FormField label="Nama Lengkap" required>
            <Input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nama lengkap staf"
              error={errors.fullName}
            />
          </FormField>

          <FormField label="Role" required>
            <Select value={role} onValueChange={setRole} placeholder="Pilih role">
              <SelectOption value="ADMIN">Admin</SelectOption>
              <SelectOption value="DOKTER">Dokter</SelectOption>
              <SelectOption value="KASIR">Kasir</SelectOption>
            </Select>
          </FormField>
          {errors.role && <p className="text-sm text-danger-500">{errors.role}</p>}

          <FormField label="PIN" required>
            <Input
              type="text"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="8 digit angka"
              error={errors.pin}
              maxLength={6}
            />
          </FormField>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
