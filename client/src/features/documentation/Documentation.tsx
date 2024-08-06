import { motion } from 'framer-motion';
import { PageLayout } from '@/components/page-layout';
import { itemVariants } from '@/components/animation-variants';
import QuestionsAccordion from '@/components/QuestionsAccordion';

export default function Documentation() {
  return (
    <PageLayout title="Documentation">
      <motion.div variants={itemVariants}>
        <QuestionsAccordion className="mb-20w-full mx-auto max-w-5xl" />
      </motion.div>
    </PageLayout>
  );
}
