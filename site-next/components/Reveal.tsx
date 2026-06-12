"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
  className?: string;
}

export default function Reveal({ children, delay = 0, style, className }: RevealProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
  }, []);

  return (
    <motion.div
      style={style}
      className={className}
      initial={{ opacity: 0, y: 18 }}
      animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
