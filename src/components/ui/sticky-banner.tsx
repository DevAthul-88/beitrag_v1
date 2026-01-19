"use client";
import React, { SVGProps, useState } from "react";
import { motion, useMotionValueEvent, useScroll, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export const StickyBanner = ({
  className,
  children,
  hideOnScroll = false,
}: {
  className?: string;
  children: React.ReactNode;
  hideOnScroll?: boolean;
}) => {
  const [open, setOpen] = useState(true);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (!hideOnScroll) return;
    setOpen(latest <= 40);
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={cn(
            "sticky inset-x-0 top-0 z-40 flex w-full items-center justify-center bg-transparent px-2 py-2",
            className,
          )}
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          {children}

          <button
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() => setOpen(false)}
          >
            <CloseIcon className="h-4 w-4 text-white" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const CloseIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </svg>
);
