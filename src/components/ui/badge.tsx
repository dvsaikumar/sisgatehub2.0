import * as React from 'react';
import { cn } from '../../lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Badge Component
 * 
 * A styled badge component following shadcn/ui patterns.
 * Uses class-variance-authority for variant management.
 */

const badgeVariants = cva(
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    {
        variants: {
            variant: {
                default: 'border-transparent bg-primary-500 text-white hover:bg-primary-600',
                secondary: 'border-transparent bg-surface-hover text-text-secondary hover:bg-border',
                destructive: 'border-transparent bg-error text-white hover:bg-red-600',
                outline: 'border-border text-text-primary',
                success: 'border-transparent bg-success text-white',
                warning: 'border-transparent bg-warning text-white',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
