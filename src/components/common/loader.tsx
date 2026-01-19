'use client';

import { motion } from 'framer-motion';
import React from 'react';

const funnyMessages = [
  "Reticulating splines...",
  "Generating witty dialog...",
  "Swapping time and space...",
  "Spinning violently around the y-axis...",
  "Tokenizing real life...",
  "Bending the spoon...",
  "Filtering morale...",
  "Don't think of purple hippos...",
  "We're testing your patience...",
  "Why don't you order a sandwich?",
  "Proving P=NP...",
  "Entangling superstrings...",
  "Mining some bitcoins...",
  "Downloading more RAM...",
  "Dividing by zero...",
  "Spawning extra vertices...",
  "Still faster than Windows update...",
  "Loading the loading screen...",
  "This is not a bug, it's a feature...",
  "Please wait while we wait...",
];

export function Loader() {
  const [message, setMessage] = React.useState(funnyMessages[0]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMessage(funnyMessages[Math.floor(Math.random() * funnyMessages.length)]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-8 w-48 overflow-hidden rounded-md border-2 border-primary bg-background">
          <motion.div
            className="absolute left-0 top-0 h-full bg-primary"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{
              duration: 2,
              ease: 'linear',
              repeat: Infinity,
            }}
          />
        </div>
        <motion.p
          key={message}
          className="text-sm text-muted-foreground font-medium"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
        >
          {message}
        </motion.p>
      </div>
    </div>
  );
}
