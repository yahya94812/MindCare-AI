import React from 'react';
import { cn } from '@/lib/utils';

const Alert = React.forwardRef(({ className, variant = 'default', ...props }, ref) => {
  const variants = {
    default: 'bg-background text-foreground shadow',
    destructive: 'border-destructive/50 bg-destructive/10 text-destructive dark:border-destructive [&>svg]:text-destructive shadow-md',
    warning: 'border-yellow-400/70 bg-yellow-50 text-yellow-700 [&>svg]:text-yellow-600 shadow-md',
    success: 'border-green-400/70 bg-green-50 text-green-700 [&>svg]:text-green-600 shadow-md'
  };

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
Alert.displayName = 'Alert';

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertDescription };
