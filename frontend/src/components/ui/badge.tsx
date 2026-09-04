import * as React from "react"
import { badgeVariants } from "@/constants/badge_variant"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge }
