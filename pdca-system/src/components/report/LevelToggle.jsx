export default function LevelToggle({ level, onChange }) {
  const levels = ['科室', '院区', '全院'];
  return (
    <div className="flex rounded-lg border border-gray-200 overflow-hidden">
      {levels.map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          className={`px-4 py-1.5 text-sm transition-colors ${
            level === l
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
