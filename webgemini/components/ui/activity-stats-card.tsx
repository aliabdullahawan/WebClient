import * as React from "react";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils"; 

interface StatsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  title: string;
  metric: number;
  metricUnit?: string;
  subtext: string;
  iconContainerClassName?: string;
}

const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  (
    {
      className,
      icon,
      title,
      metric,
      metricUnit,
      subtext,
      iconContainerClassName,
      ...props
    },
    ref
  ) => {
    const metricRef = React.useRef<HTMLHeadingElement>(null);

    React.useEffect(() => {
      const node = metricRef.current;
      if (!node) return;

      const controls = animate(0, metric, {
        duration: 2,
        ease: "easeOut",
        onUpdate(value) {
          node.textContent = value.toFixed(1);
        },
      });

      return () => controls.stop();
    }, [metric]);

    return (
      <div
        ref={ref}
        className={cn(
          "flex w-full max-w-xs flex-col gap-4 rounded-xl border border-pink-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow",
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-500",
              iconContainerClassName
            )}
          >
            {icon}
          </div>
          <p className="text-lg font-medium text-gray-700">{title}</p>
        </div>

        <div className="flex items-baseline gap-1">
          <h2
            ref={metricRef}
            className="text-5xl font-bold tracking-tighter md:text-6xl text-gray-900"
            aria-live="polite"
            aria-atomic="true"
          >
            0
          </h2>
          {metricUnit && (
            <span className="text-4xl font-bold text-gray-400 md:text-5xl">
              {metricUnit}
            </span>
          )}
        </div>

        <p className="text-base text-gray-500">{subtext}</p>
      </div>
    );
  }
);
StatsCard.displayName = "StatsCard";

export { StatsCard };
