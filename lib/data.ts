export const transition = { duration: 1, ease: [0.25, 0.1, 0.25, 1] };
export const variants = {
  hidden: { transform: "translateY(20%)", opacity: 0 },
  visible: { transform: "translateY(0)", opacity: 1 },
};
export const cardVariants = {
  hidden: { opacity: 0, transform: "scale(0.9) rotate(5deg)" },
  visible: { opacity: 1, transform: "scale(1) rotate(0deg)" },
};
