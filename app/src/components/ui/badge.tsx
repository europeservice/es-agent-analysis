import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-mono font-medium',
  {
    variants: {
      variant: {
        default:     'border-border bg-surface2 text-gray-300',
        blue:        'border-blue-500/40 bg-blue-500/20 text-blue-300',
        green:       'border-green-500/40 bg-green-500/20 text-green-300',
        yellow:      'border-yellow-500/40 bg-yellow-500/20 text-yellow-300',
        red:         'border-red-500/40 bg-red-500/20 text-red-300',
        teal:        'border-teal-500/40 bg-teal-500/20 text-teal-300',
        purple:      'border-purple-500/40 bg-purple-500/20 text-purple-300',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
