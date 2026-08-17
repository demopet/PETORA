import { useState } from 'react'
import { Plus, MoreVertical, KeyRound, UserX } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { UserForm } from '../components/UserForm'
import { ResetPinForm } from '../components/ResetPinForm'
import { useUsers, useCreateUser, useDeactivateUser, useResetPin } from '../hooks/use-users'
import type { User } from '@/types/user'

type UserSafe = Omit<User, 'pin_hash'>

export default function UserManagementPage() {
  const { data: users, isLoading, error } = useUsers()
  const createMutation = useCreateUser()
  const deactivateMutation = useDeactivateUser()
  const resetPinMutation = useResetPin()

  const [userFormOpen, setUserFormOpen] = useState(false)
  const [resetPinOpen, setResetPinOpen] = useState(false)
  const [deactivateOpen, setDeactivateOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserSafe | null>(null)
  const [actionsMenuOpen, setActionsMenuOpen] = useState<string | null>(null)

  const staffUsers = users?.filter((u) => u.role !== 'OWNER')

  const handleCreateUser = async (data: { username: string; pin: string; role: string; full_name: string }) => {
    try {
      await createMutation.mutateAsync(data)
      toast.success('Staf berhasil ditambahkan')
      setUserFormOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menambahkan staf')
    }
  }

  const handleResetPin = async (newPin: string) => {
    if (!selectedUser) return
    try {
      await resetPinMutation.mutateAsync({ userId: selectedUser.id, newPin })
      toast.success('PIN berhasil direset')
      setResetPinOpen(false)
      setSelectedUser(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal mereset PIN')
    }
  }

  const handleDeactivate = async () => {
    if (!selectedUser) return
    try {
      await deactivateMutation.mutateAsync(selectedUser.id)
      toast.success('Staf berhasil dinonaktifkan')
      setDeactivateOpen(false)
      setSelectedUser(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menonaktifkan staf')
    }
  }

  const openResetPin = (user: UserSafe) => {
    setSelectedUser(user)
    setResetPinOpen(true)
    setActionsMenuOpen(null)
  }

  const openDeactivate = (user: UserSafe) => {
    setSelectedUser(user)
    setDeactivateOpen(true)
    setActionsMenuOpen(null)
  }

  if (isLoading) {
    return <div className="text-slate-500">Memuat data staf...</div>
  }

  if (error) {
    return <div className="text-danger-500">Gagal memuat data staf</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management — Staf</h1>
          <p className="mt-1 text-sm text-slate-500">
            {staffUsers?.length || 0} staf terdaftar
          </p>
        </div>
        <Button onClick={() => setUserFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Tambah
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Username</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Nama</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Role</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {staffUsers && staffUsers.length > 0 ? (
                staffUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{user.username}</td>
                    <td className="px-4 py-3 text-slate-700">{user.full_name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={user.is_active ? 'ACTIVE' : 'ARCHIVED'} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setActionsMenuOpen(actionsMenuOpen === user.id ? null : user.id)}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                        {actionsMenuOpen === user.id && (
                          <div className="absolute right-0 z-10 mt-1 w-48 rounded-md border border-slate-200 bg-white shadow-lg">
                            <button
                              type="button"
                              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                              onClick={() => openResetPin(user)}
                            >
                              <KeyRound className="h-4 w-4" />
                              Reset PIN
                            </button>
                            {user.is_active && (
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-danger-500 hover:bg-slate-50"
                                onClick={() => openDeactivate(user)}
                              >
                                <UserX className="h-4 w-4" />
                                Deactivate
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                    Belum ada staf terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <UserForm
        open={userFormOpen}
        onOpenChange={setUserFormOpen}
        onSubmit={handleCreateUser}
        isLoading={createMutation.isPending}
      />

      <ResetPinForm
        open={resetPinOpen}
        onOpenChange={setResetPinOpen}
        onSubmit={handleResetPin}
        userName={selectedUser?.full_name || ''}
        isLoading={resetPinMutation.isPending}
      />

      <Dialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nonaktifkan Staf</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Apakah Anda yakin ingin menonaktifkan <strong>{selectedUser?.full_name}</strong>?
            Staf ini tidak akan bisa login lagi.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeactivateOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeactivate} disabled={deactivateMutation.isPending}>
              {deactivateMutation.isPending ? 'Memproses...' : 'Nonaktifkan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
