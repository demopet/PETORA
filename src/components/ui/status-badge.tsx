import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const statusBadgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-slate-100 text-slate-800',
        success: 'bg-success-500/10 text-success-600',
        warning: 'bg-warning-500/10 text-warning-600',
        danger: 'bg-danger-500/10 text-danger-600',
        info: 'bg-info-500/10 text-info-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  status: string
}

const statusMap: Record<string, { variant: VariantProps<typeof statusBadgeVariants>['variant']; label: string }> = {
  PAID: { variant: 'success', label: 'Paid' },
  UNPAID: { variant: 'danger', label: 'Unpaid' },
  PARTIAL_PAYMENT: { variant: 'warning', label: 'Partial' },
  DONE: { variant: 'success', label: 'Done' },
  WAITING: { variant: 'warning', label: 'Waiting' },
  IN_PROGRESS: { variant: 'info', label: 'In Progress' },
  CANCELLED: { variant: 'danger', label: 'Cancelled' },
  BOOKED: { variant: 'info', label: 'Booked' },
  CHECKED_IN: { variant: 'info', label: 'Checked In' },
  CHECKED_OUT: { variant: 'success', label: 'Checked Out' },
  ACTIVE: { variant: 'success', label: 'Active' },
  ARCHIVED: { variant: 'danger', label: 'Archived' },
  PENDING: { variant: 'warning', label: 'Pending' },
  APPROVED: { variant: 'success', label: 'Approved' },
  REJECTED: { variant: 'danger', label: 'Rejected' },
}

function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const mapped = statusMap[status.toUpperCase()] || { variant: 'default', label: status }

  return (
    <span
      className={cn(statusBadgeVariants({ variant: mapped.variant }), className)}
      {...props}
    >
      {mapped.label}
    </span>
  )
}

export { StatusBadge, statusBadgeVariants }
