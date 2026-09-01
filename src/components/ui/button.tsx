"use client";

import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold cursor-pointer select-none transition-[transform,box-shadow,background-color,border-color,color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:translate-y-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover hover:shadow-md hover:-translate-y-px",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md hover:-translate-y-px",
        outline:
          "border border-border-strong bg-transparent text-foreground hover:border-primary/45 hover:bg-primary-soft hover:text-primary",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/70",
        ghost: "text-foreground/80 hover:bg-secondary hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "bg-primary text-primary-foreground shadow-md hover:bg-primary-hover hover:shadow-lg hover:-translate-y-px",
        accent:
          "bg-accent text-accent-foreground shadow-sm hover:bg-accent-hover hover:shadow-md hover:-translate-y-px",
        soft: "bg-secondary text-secondary-foreground hover:bg-primary-soft hover:text-primary",
        glow: "bg-primary text-primary-foreground shadow-md hover:bg-primary-hover hover:shadow-lg hover:-translate-y-px",
        glass:
          "border border-white/30 bg-white/12 text-white backdrop-blur-md hover:border-white/45 hover:bg-white/20",
        onDark:
          "bg-white text-ink shadow-sm hover:bg-white/92 hover:-translate-y-px hover:shadow-md",
        gradient: "bg-primary text-primary-foreground hover:bg-primary-hover",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 px-6 text-[0.9375rem]",
        xl: "h-13 rounded-xl px-7 text-base",
        icon: "size-10 rounded-lg",
        "icon-sm": "size-8 rounded-md",
        "icon-lg": "size-11 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    // asChild renders the caller's own element (usually a router Link).
    // `Slottable` has to be a *direct* child of Slot — wrapping the children in
    // a fragment makes Slot merge its props onto the fragment instead, which
    // silently drops every class and handler the button just computed.
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...(isDisabled ? { "aria-disabled": true } : {})}
          {...props}
        >
          {leftIcon ? <span className="mr-1">{leftIcon}</span> : null}
          <Slottable>{children}</Slottable>
          {rightIcon ? <span className="ml-1">{rightIcon}</span> : null}
        </Slot>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <>
            <LoadingSpinner />
            <span className="opacity-0">{children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-1">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-1">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  },
);
Button.displayName = "Button";

// Loading spinner component
function LoadingSpinner() {
  return (
    <svg
      className="absolute size-5 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// Icon button with ripple effect
interface IconButtonProps extends ButtonProps {
  "aria-label": string;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = "ghost", size = "icon", children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn("relative overflow-hidden", className)}
        {...props}
      >
        {children}
      </Button>
    );
  },
);
IconButton.displayName = "IconButton";

// Floating action button
const FloatingButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          "fixed bottom-6 right-6 z-50 size-14 rounded-full shadow-2xl hover:shadow-3xl",
          className,
        )}
        size="icon-lg"
        variant="hero"
        {...props}
      >
        {children}
      </Button>
    );
  },
);
FloatingButton.displayName = "FloatingButton";

export { Button, IconButton, FloatingButton, buttonVariants };
