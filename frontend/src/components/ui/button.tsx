import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-yellow-500 text-white hover:bg-yellow-600 transition-smooth",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-yellow-500 bg-transparent text-yellow-600 hover:bg-yellow-500 hover:text-white transition-smooth",
        secondary: "bg-yellow-400 text-white hover:bg-yellow-500 transition-smooth",
        ghost: "hover:bg-yellow-100 hover:text-yellow-700 transition-smooth",
        link: "text-yellow-600 underline-offset-4 hover:underline hover:text-yellow-700",
        hero: "bg-yellow-500 text-white hover:bg-yellow-600 hover:shadow-lg hover:scale-[1.02] transition-smooth font-semibold tracking-wide uppercase text-xs",
        gold: "bg-yellow-500 text-white hover:bg-yellow-600 hover:shadow-lg transition-smooth font-medium",
        goldOutline: "border border-yellow-500 text-yellow-600 bg-transparent hover:bg-yellow-500 hover:text-white transition-smooth",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-14 rounded-md px-10 text-sm",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
