export default function Badge({ achieved, size = 'sm' }) {
  if (achieved === null || achieved === undefined) {
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
        待录入
      </span>
    );
  }
  if (achieved) {
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-achieved-bg text-achieved border border-achieved-border ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
        达标
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-unachieved-bg text-unachieved border border-unachieved-border ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
      未达标
    </span>
  );
}
