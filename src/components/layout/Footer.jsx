export default function Footer() {
  return (
    <footer
      className="px-6 py-4 mb-[calc(4rem+env(safe-area-inset-bottom))] md:mb-0 flex flex-col sm:flex-row justify-between items-center gap-2 border-t"
      style={{
        backgroundColor: "var(--color-gold-900)",
        borderColor: "var(--color-gold-800)",
      }}
    >
      <span className="text-xs" style={{ color: "var(--color-gold-400)", opacity: 0.6 }}>
        © 2026 Saifco Basmati Rice · Amasia Multigrain Pvt. Ltd.
      </span>
      <span className="text-xs" style={{ color: "var(--color-gold-400)", opacity: 0.6 }}>
        Punjab, India &nbsp;·&nbsp; ISO Certified &nbsp;·&nbsp; Exporting to 20+ Countries
      </span>
    </footer>
  );
}
