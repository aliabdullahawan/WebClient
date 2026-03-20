import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavigationItem {
  label: string;
  hasDropdown?: boolean;
  onClick?: () => void;
}

interface ProgramCard {
  image: string;
  category: string;
  title: string;
  onClick?: () => void;
}

interface PulseFitHeroProps {
  logo?: string;
  navigation?: NavigationItem[];
  ctaButton?: {
    label: string;
    onClick: () => void;
  };
  title: string;
  subtitle: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  disclaimer?: string;
  socialProof?: {
    avatars: string[];
    text: string;
  };
  programs?: ProgramCard[];
  className?: string;
  children?: React.ReactNode;
}

export function PulseFitHero({
  logo = "PulseFit",
  navigation = [
    { label: "Features" },
    { label: "Programs", hasDropdown: true },
    { label: "Testimonials" },
    { label: "Pricing" },
    { label: "Contact" },
  ],
  ctaButton,
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  disclaimer,
  socialProof,
  programs = [],
  className,
  children,
}: PulseFitHeroProps) {
  return (
    <section
      className={cn(
        "relative w-full min-h-screen flex flex-col overflow-hidden",
        className
      )}
      style={{
        background: "linear-gradient(180deg, #FDE8ED 0%, #FFF5F7 50%, #FFFFFF 100%)",
      }}
      role="banner"
      aria-label="Hero section"
    >
      {/* Header handled by navbar component ideally, removing internal nav elements here to allow navbar to float above */}

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col items-center text-center max-w-4xl"
          style={{ gap: "32px" }}
        >
          {/* Title */}
          <h1
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 800,
              fontSize: "clamp(46px, 8vw, 82px)",
              lineHeight: "1.1",
              color: "#1a1a1a",
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 400,
              fontSize: "clamp(16px, 2vw, 20px)",
              lineHeight: "1.6",
              color: "#4a5568",
              maxWidth: "600px",
            }}
          >
            {subtitle}
          </p>

          {/* Action Buttons */}
          {(primaryAction || secondaryAction) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center gap-4 mt-4"
            >
              {primaryAction && (
                <button
                  onClick={primaryAction.onClick}
                  className="flex flex-row items-center gap-2 px-8 py-4 rounded-full transition-all hover:scale-105"
                  style={{
                    background: "#ec4899", // pink-500
                    fontFamily: "Inter, sans-serif",
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "#FFFFFF",
                    boxShadow: "0 4px 16px rgba(236, 72, 153, 0.4)",
                  }}
                >
                  {primaryAction.label}
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M7 10H13M13 10L10 7M13 10L10 13"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}

              {secondaryAction && (
                <button
                  onClick={secondaryAction.onClick}
                  className="px-8 py-4 rounded-full transition-all hover:scale-105"
                  style={{
                    background: "transparent",
                    border: "2px solid #ec4899",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "#ec4899",
                  }}
                >
                  {secondaryAction.label}
                </button>
              )}
            </motion.div>
          )}

          {/* Social Proof */}
          {socialProof && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-row items-center gap-3 mt-8"
            >
              <div className="flex flex-row -space-x-4">
                {socialProof.avatars.map((avatar, index) => (
                  <img
                    key={index}
                    src={avatar}
                    alt={`User ${index + 1}`}
                    className="rounded-full border-4 border-white shadow-sm"
                    style={{
                      width: "48px",
                      height: "48px",
                      objectFit: "cover",
                    }}
                  />
                ))}
              </div>
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#4a5568",
                  marginLeft: "12px",
                }}
              >
                {socialProof.text}
              </span>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Program Cards Carousel */}
      {programs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="relative z-10 w-full overflow-hidden"
          style={{
            paddingTop: "20px",
            paddingBottom: "80px",
          }}
        >
          {/* Gradient Overlays */}
          <div
            className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none"
            style={{
              width: "150px",
              background: "linear-gradient(90deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%)",
            }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none"
            style={{
              width: "150px",
              background: "linear-gradient(270deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%)",
            }}
          />

          {/* Scrolling Container */}
          <motion.div
            className="flex items-center"
            animate={{
              x: [0, -((programs.length * 340) / 2)],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: programs.length * 4,
                ease: "linear",
              },
            }}
            style={{
              gap: "24px",
              paddingLeft: "24px",
            }}
          >
            {/* Duplicate programs for seamless loop */}
            {[...programs, ...programs].map((program, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -10 }}
                transition={{ duration: 0.3 }}
                onClick={program.onClick}
                className="flex-shrink-0 cursor-pointer relative overflow-hidden group rounded-3xl"
                style={{
                  width: "316px",
                  height: "440px",
                  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
                }}
              >
                {/* Image */}
                <img
                  src={program.image}
                  alt={program.title}
                  className="group-hover:scale-110 transition-transform duration-700"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />

                {/* Gradient Overlay */}
                <div
                  className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-90"
                  style={{
                    background: "linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(236,72,153, 0.8) 100%)",
                  }}
                />

                {/* Text Content */}
                <div
                  className="absolute bottom-0 left-0 right-0 p-6"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "rgba(255, 255, 255, 0.9)",
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                      backgroundColor: "rgba(0,0,0,0.3)",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      width: "fit-content",
                    }}
                  >
                    {program.category}
                  </span>
                  <h3
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "24px",
                      fontWeight: 700,
                      color: "#FFFFFF",
                      lineHeight: "1.3",
                    }}
                  >
                    {program.title}
                  </h3>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
