"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { Reveal } from "@/components/motion/Reveal";
import Button from "./Button";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function HomeHero({ stats = [], grainCards = [] }) {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center bg-gradient-to-b from-[--color-gold-100] to-[--color-gold-50]">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center"
      >
        <motion.div
          variants={item}
          className="inline-flex items-center gap-2 bg-[--color-gold-500]/10 border border-[--color-gold-500]/30 rounded-full px-4 py-1.5 mb-6"
        >
          <span className="text-sm">🌾</span>
          <span
            className="text-xs font-semibold tracking-widest"
            style={{ color: "var(--color-gold-500)" }}
          >
            PREMIUM BASMATI RICE
          </span>
        </motion.div>

        <motion.h1
          variants={item}
          className="text-4xl sm:text-5xl font-semibold max-w-2xl leading-tight mb-4"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-gold-900)" }}
        >
          Saifco Basmati Rice
        </motion.h1>

        <motion.p
          variants={item}
          className="text-base max-w-xl leading-relaxed mb-8"
          style={{ color: "var(--color-gold-700)" }}
        >
          Manufacturer, Exporter &amp; Supplier of the finest Punjab-grown basmati
          rice. Trusted by 500+ buyers across 20+ countries. ISO Certified.
          24-hour service.
        </motion.p>

        <motion.div variants={item} className="flex gap-4 flex-wrap justify-center">
          <Link
            href="/products"
            className="text-white text-sm font-semibold px-7 py-3 rounded-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg"
            style={{ backgroundColor: "var(--color-gold-500)" }}
          >
            Product Catalogue →
          </Link>
        </motion.div>
      </motion.div>

      <section className="max-w-5xl w-full mx-auto mt-16">
        {grainCards.map((card, i) => (
          <Reveal key={card.id} delay={i * 0.05} y={32}>
            <div
              className={`flex flex-col md:flex-row gap-8 items-center mb-12 p-6 rounded-xl border bg-white/50 ${
                card.reverse ? "md:flex-row-reverse" : ""
              }`}
              style={{ borderColor: "var(--color-gold-200)" }}
            >
              <div className="w-full md:w-1/2 overflow-hidden rounded-lg">
                <Image
                  src={card.image}
                  alt={card.title}
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover rounded-lg transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="w-full md:w-1/2 text-left">
                <h2
                  className="text-xl font-semibold"
                  style={{ fontFamily: "var(--font-display)", color: "var(--color-gold-900)" }}
                >
                  {card.title}
                </h2>
                <p className="text-sm opacity-80">{card.subtitle}</p>
                <p className="mt-3" style={{ color: "var(--color-gold-700)" }}>
                  {card.description}
                </p>
                <p
                  className="mt-2 text-sm font-semibold mb-5"
                  style={{ color: "var(--color-gold-500)" }}
                >
                  {card.tagline}
                </p>

                <Button href="/products">{card.title} →</Button>
              </div>
            </div>
          </Reveal>
        ))}
      </section>

      <Reveal
        className="grid grid-cols-3 gap-8 mt-16 pt-10 max-w-lg w-full border-t"
        style={{ borderColor: "var(--color-gold-200)" }}
      >
        {stats.map(({ value, label }) => (
          <div key={label} className="text-center">
            <p
              className="text-2xl font-semibold"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-gold-500)" }}
            >
              {value}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--color-gold-400)" }}>
              {label}
            </p>
          </div>
        ))}
      </Reveal>
    </main>
  );
}