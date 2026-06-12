"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface PageHeaderProps {
  title: string;
  desc?: React.ReactNode;
}

export default function PageHeader({ title, desc }: PageHeaderProps) {
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(true); }, []);

  const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

  return (
    <section className="ph-section" style={{
      position: "relative",
      minHeight: "62vh",
      overflow: "hidden",
      display: "flex",
      alignItems: "flex-end",
    }}>
      {/* 台形の黒エリア（画面左から斜めに切れる） */}
      <motion.div
        aria-hidden="true"
        className="ph-trapezoid"
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--navy)",
          clipPath: "polygon(0 0, 58% 0, 72% 100%, 0 100%)",
          transformOrigin: "left center",
        }}
        initial={{ opacity: 0, scaleX: 0.92 }}
        animate={show ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0.92 }}
        transition={{ duration: 1.0, ease }}
      />

      {/* テキスト */}
      <div className="ph-text" style={{
        position: "relative",
        zIndex: 1,
        padding: "5.5rem clamp(1.5rem, 5vw, 6rem) 3rem",
        maxWidth: "54%",
      }}>
        <motion.p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "clamp(2rem, 4.5vw, 4rem)",
            fontWeight: 900,
            color: "#ffffff",
            lineHeight: 1,
            letterSpacing: "-0.02em",
            margin: "0 0 1.25rem",
            textTransform: "uppercase",
          }}
          initial={{ opacity: 0, y: 24 }}
          animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.85, ease, delay: 0.15 }}
        >
          {title}
        </motion.p>

        {desc && (
          <motion.p
            style={{
              fontSize: "0.875rem",
              color: "rgba(255,255,255,0.6)",
              lineHeight: 2.0,
              maxWidth: 360,
              margin: 0,
            }}
            initial={{ opacity: 0, y: 16 }}
            animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.75, ease, delay: 0.3 }}
          >
            {desc}
          </motion.p>
        )}
      </div>
    </section>
  );
}
