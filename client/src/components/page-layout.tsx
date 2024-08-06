import { ReactNode } from 'react';
import { motion } from 'framer-motion';

import { Separator } from '@/components/ui/separator';
import { containerVariants, itemVariants } from './animation-variants';

interface PageLayoutProps {
  title: string;
  children: ReactNode;
}

export function PageLayout({ title, children }: PageLayoutProps) {
  return (
    <motion.div
      className="mx-auto mt-24 w-full max-w-5xl px-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h1
        className="mb-4 text-3xl font-semibold"
        variants={itemVariants}
      >
        {title}
      </motion.h1>
      <Separator />
      <motion.div variants={itemVariants}>{children}</motion.div>
    </motion.div>
  );
}
