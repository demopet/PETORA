import { Link, useLocation } from 'react-router-dom'
import { PawPrint, LayoutDashboard, Users, Calendar, FileText, Home, Scissors, Package, ShoppingCart, Receipt, Award, Tag, Wallet, BarChart3, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserRole } from '@/types/user'

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['OWNER', 'ADMIN', 'DOKTER', 'KASIR'] as UserRole[] },
  { path: '/customers', label: 'Customers', icon: Users, roles: ['OWNER', 'ADMIN', 'DOKTER', 'KASIR'] as UserRole[] },
  { path: '/pets', label: 'Pets', icon: PawPrint, roles: ['OWNER', 'ADMIN', 'DOKTER', 'KASIR'] as UserRole[] },
  { path: '/appointments', label: 'Appointments', icon: Calendar, roles: ['OWNER', 'ADMIN', 'DOKTER', 'KASIR'] as UserRole[] },
  { path: '/medical-records', label: 'Medical Records', icon: FileText, roles: ['OWNER', 'ADMIN', 'DOKTER'] as UserRole[] },
  { path: '/pet-hotel', label: 'Pet Hotel', icon: Home, roles: ['OWNER', 'ADMIN', 'DOKTER', 'KASIR'] as UserRole[] },
  { path: '/grooming', label: 'Grooming', icon: Scissors, roles: ['OWNER', 'ADMIN', 'DOKTER', 'KASIR'] as UserRole[] },
  { path: '/products', label: 'Products', icon: Package, roles: ['OWNER', 'ADMIN', 'KASIR'] as UserRole[] },
  { path: '/inventory', label: 'Inventory', icon: Package, roles: ['OWNER', 'ADMIN', 'KASIR'] as UserRole[] },
  { path: '/purchase-orders', label: 'Purchase Orders', icon: Package, roles: ['OWNER', 'ADMIN'] as UserRole[] },
  { path: '/pos', label: 'POS', icon: ShoppingCart, roles: ['OWNER', 'ADMIN', 'KASIR'] as UserRole[] },
  { path: '/invoices', label: 'Invoices', icon: Receipt, roles: ['OWNER', 'ADMIN', 'KASIR'] as UserRole[] },
  { path: '/cash-shifts', label: 'Cash Shifts', icon: Wallet, roles: ['OWNER', 'ADMIN', 'KASIR'] as UserRole[] },
  { path: '/loyalty', label: 'Loyalty', icon: Award, roles: ['OWNER', 'ADMIN', 'KASIR'] as UserRole[] },
  { path: '/promotions', label: 'Promotions', icon: Tag, roles: ['OWNER', 'ADMIN'] as UserRole[] },
  { path: '/expenses', label: 'Expenses', icon: Wallet, roles: ['OWNER', 'ADMIN'] as UserRole[] },
  { path: '/reports', label: 'Reports', icon: BarChart3, roles: ['OWNER', 'ADMIN', 'DOKTER', 'KASIR'] as UserRole[] },
  { path: '/settings', label: 'Settings', icon: Settings, roles: ['OWNER'] as UserRole[] },
]

export default function Sidebar() {
  const location = useLocation()
  const userRole: UserRole = 'OWNER'

  const visibleItems = menuItems.filter(item => item.roles.includes(userRole))

  return (
    <aside className="flex w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-slate-200">
        <PawPrint className="h-8 w-8 text-primary-600" />
        <div>
          <h1 className="text-lg font-bold text-slate-900">Petora</h1>
          <p className="text-xs text-slate-500">HaLand PetCare</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {visibleItems.map(item => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
