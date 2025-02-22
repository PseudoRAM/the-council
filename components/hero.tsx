"use client";

import React from "react";
import { motion } from "motion/react";

import Link from "next/link";
import { cardVariants, transition, variants } from "@/lib/data";
import { ArrowRight } from "lucide-react";

const text = "Curate your council. Get mentorship.";

const images = [
  {
    src: "/samples/head1.jpg",
    position: {
      md: { top: "5vh", left: "10%" },
      sm: { top: "5vh", left: "4%" },
    },
    rotation: -15.11,
    scale: 1.1,
    delay: 0.1,
  },
  {
    src: "/samples/head2.jpg",
    position: {
      md: { top: "10vh", right: "10%" },
      sm: { top: "15vh", right: "4%" },
    },
    rotation: 14,
    scale: 1,
    delay: 0.2,
  },
  {
    src: "/samples/head3.jpg",
    position: {
      md: { bottom: "15vh", left: "6%" },
      sm: { bottom: "40vh", left: "3%" },
    },
    rotation: 12,
    scale: 1.6,
    delay: 0.3,
  },
  {
    src: "/samples/head4.jpg",
    position: {
      md: { bottom: "10vh", left: "28%" },
      sm: { bottom: "30vh", left: "18%" },
    },
    rotation: -20,
    scale: 1.6,
    delay: 0.3,
  },
  {
    src: "/samples/head5.jpg",
    position: {
      md: { bottom: "18vh", right: "16%" },
      sm: { bottom: "25vh", right: "4%" },
    },
    rotation: -19,
    scale: 1,
    delay: 0.3,
  },
  {
    src: "/samples/head6.jpg",
    position: {
      md: { bottom: "18vh", right: "7%" },
      sm: { bottom: "45vh", right: "18%" },
    },
    rotation: -12,
    scale: 1,
    delay: 0.6,
  },
  {
    src: "/samples/head7.jpg",
    position: {
      md: { top: "19vh", left: "20%" },
      sm: { top: "8vh", left: "16%" },
    },
    rotation: 10,
    scale: 1.2,
    delay: 0.3,
  },
  {
    src: "/samples/head8.jpg",
    position: {
      md: { top: "19vh", right: "20%" },
      sm: { top: "18vh", left: "20%" },
    },
    rotation: 18,
    scale: 1.1,
    delay: 0.4,
  },
  {
    src: "/samples/head9.jpg",
    position: {
      md: { bottom: "20vh", left: "32%" },
      sm: { bottom: "35vh", left: "32%" },
    },
    rotation: -15,
    scale: 1.3,
    delay: 0.3,
  },
  {
    src: "/samples/head10.jpg",
    position: {
      md: { bottom: "14vh", right: "35%" },
      sm: { bottom: "22vh", right: "48%" },
    },
    rotation: 22,
    scale: 1.2,
    delay: 0.5,
  },
  {
    src: "/samples/head11.jpg",
    position: {
      md: { top: "5vh", right: "30%" },
      sm: { top: "6vh", right: "40%" },
    },
    rotation: -12,
    scale: 1.15,
    delay: 0.35,
  },
];

export const Hero = () => {
  const words = text.split(" ");
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-[calc(100dvh-100px)] relative rounded-[35px] border border-[#E6E6E6] overflow-hidden"
    >
      <div
        className="absolute -z-20 top-0 left-0 w-full h-full"
        style={{
          backgroundImage: "radial-gradient(circle, #762496 1px, #e6a5ee 1px)",
          backgroundSize: "10px 10px",
        }}
      />

      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute -z-10`}
          style={{
            ...Object.entries(image.position.md).reduce(
              (acc, [key, value]) => ({
                ...acc,
                [key]: value,
              }),
              {}
            ),
          }}
        >
          <motion.div
            className={`md:block ${Object.entries(image.position.sm)
              .map(([key, value]) => `sm:${key}-[${value}]`)
              .join(" ")}`}
            variants={{
              hidden: {
                opacity: 0,
                transform: `scale(0.8) rotate(1deg)`,
              },
              visible: {
                opacity: 1,
                transform: `scale(${image.scale}) rotate(${image.rotation}deg)`, // Keep rotation in final state
              },
            }}
            initial="hidden"
            whileInView="visible"
            transition={{
              delay: image.delay,
              duration: 0.5,
              ease: "easeOut",
            }}
          >
            <img
              src={image.src}
              alt={`head-${index + 1}`}
              className="md:h-48 md:w-40 h-32 w-24 rounded-lg object-cover object-top"
            />
          </motion.div>
        </div>
      ))}

      <motion.div
        initial="hidden"
        whileInView="visible"
        transition={{ staggerChildren: 0.04 }}
        className="w-full min-h-screen py-16 flex flex-col items-center justify-center"
      >
        <h1
          className="md:text-6xl text-2xl font-bold text-white text-center md:w-4/6 w-full mt-8"
          style={{
            textShadow: "2px 3px black",
          }}
        >
          {words.map((word, index) => (
            <React.Fragment key={index}>
              <motion.span
                className="inline-block"
                transition={transition}
                variants={variants}
              >
                {word}
              </motion.span>
              {index < words.length - 1 && " "}
            </React.Fragment>
          ))}
        </h1>
        <motion.p
          transition={transition}
          variants={variants}
          className="md:text-lg text-sm font-medium leading-[23px] text-center tracking-tight max-w-2xl mx-auto w-[95%] mt-9 text-white"
        >
          Your personal curated council of opinions, help to guide and formulate
          your thoughts and decisions.
        </motion.p>
        <Link href="/sign-up">
          <motion.button
            transition={transition}
            variants={variants}
            style={{ boxShadow: "0px 4px 14.8px rgba(0, 0, 0, 0.2)" }}
            className="flex items-center justify-center w-56 h-12 mt-9 rounded-xl border bg-black  text-base font-semibold text-white"
          >
            Get started
            <ArrowRight className="h-4 w-4 ml-2" />
          </motion.button>
        </Link>
      </motion.div>
    </motion.div>
  );
};
