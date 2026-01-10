import { useTheme } from '../contexts/ThemeContext';

export const PredictionSkeleton = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  
  return (
    <div className={`${isLight ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'} border rounded-lg p-4 animate-pulse`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`h-6 w-20 ${isLight ? 'bg-gray-200' : 'bg-slate-700'} rounded`}></div>
        <div className={`h-4 w-16 ${isLight ? 'bg-gray-200' : 'bg-slate-700'} rounded-full`}></div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <div className={`h-3 w-16 ${isLight ? 'bg-gray-200' : 'bg-slate-700'} rounded mb-2`}></div>
          <div className={`h-5 w-12 ${isLight ? 'bg-gray-200' : 'bg-slate-700'} rounded`}></div>
        </div>
        <div>
          <div className={`h-3 w-16 ${isLight ? 'bg-gray-200' : 'bg-slate-700'} rounded mb-2`}></div>
          <div className={`h-5 w-12 ${isLight ? 'bg-gray-200' : 'bg-slate-700'} rounded`}></div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className={`h-4 w-16 ${isLight ? 'bg-gray-200' : 'bg-slate-700'} rounded`}></div>
        <div className={`h-2 w-24 ${isLight ? 'bg-gray-200' : 'bg-slate-700'} rounded-full`}></div>
      </div>
    </div>
  );
};

export const CardSkeleton = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  
  return (
    <div className={`${isLight ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'} border rounded-lg p-6 animate-pulse`}>
      <div className={`h-6 w-32 ${isLight ? 'bg-gray-200' : 'bg-slate-700'} rounded mb-4`}></div>
      <div className="space-y-3">
        <div className={`h-4 w-full ${isLight ? 'bg-gray-200' : 'bg-slate-700'} rounded`}></div>
        <div className={`h-4 w-3/4 ${isLight ? 'bg-gray-200' : 'bg-slate-700'} rounded`}></div>
        <div className={`h-4 w-1/2 ${isLight ? 'bg-gray-200' : 'bg-slate-700'} rounded`}></div>
      </div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  
  return (
    <div className={`${isLight ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'} border rounded-lg overflow-hidden`}>
      <div className={`${isLight ? 'bg-gray-50' : 'bg-slate-700'} p-4`}>
        <div className={`h-5 w-48 ${isLight ? 'bg-gray-200' : 'bg-slate-600'} rounded animate-pulse`}></div>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-slate-700">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className={`h-4 w-24 ${isLight ? 'bg-gray-200' : 'bg-slate-700'} rounded`}></div>
              <div className={`h-4 w-16 ${isLight ? 'bg-gray-200' : 'bg-slate-700'} rounded`}></div>
              <div className={`h-4 w-20 ${isLight ? 'bg-gray-200' : 'bg-slate-700'} rounded`}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ChartSkeleton = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  
  return (
    <div className={`${isLight ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'} border rounded-lg p-6 animate-pulse`}>
      <div className={`h-6 w-40 ${isLight ? 'bg-gray-200' : 'bg-slate-700'} rounded mb-4`}></div>
      <div className={`h-64 w-full ${isLight ? 'bg-gray-100' : 'bg-slate-700'} rounded`}></div>
    </div>
  );
};