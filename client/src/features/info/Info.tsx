import { motion } from 'framer-motion';
import { PageLayout } from '@/components/page-layout';
import { itemVariants } from '@/components/animation-variants';
import InfoAccordion from './info-accordion';

export default function Info() {
  return (
    <PageLayout title="Info">
      <motion.div variants={itemVariants}>
        <InfoAccordion className="mb-20 w-full mx-auto max-w-5xl" />
      </motion.div>
    </PageLayout>
  );
}
