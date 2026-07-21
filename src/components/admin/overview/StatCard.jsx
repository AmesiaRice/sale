export default function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: "var(--color-gold-200)" }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500">{label}</p>
        {Icon && <Icon size={16} style={{ color: "var(--color-gold-500)" }} />}
      </div>
      <p className="text-2xl font-bold" style={{ color: "var(--color-gold-800)", fontFamily: "var(--font-display)" }}>
        {value}
      </p>
    </div>
  );
}