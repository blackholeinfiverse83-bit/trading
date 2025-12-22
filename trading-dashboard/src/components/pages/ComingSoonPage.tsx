import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface ComingSoonPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function ComingSoonPage({ title, description, icon: Icon }: ComingSoonPageProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6 max-w-md"
      >
        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center border border-slate-700">
          <Icon className="w-12 h-12 text-blue-500" />
        </div>
        <div>
          <h1 className="text-3xl text-white mb-2">{title}</h1>
          <p className="text-slate-400">{description}</p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg">
          <div className="flex gap-1">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-2 h-2 bg-blue-500 rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              className="w-2 h-2 bg-blue-500 rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
              className="w-2 h-2 bg-blue-500 rounded-full"
            />
          </div>
          <span className="text-sm text-slate-300">Coming Soon</span>
        </div>
      </motion.div>
    </div>
  );
}
