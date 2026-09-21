export function Footer() {
  return (
    <footer
      style={{
        background: 'var(--green)',
        color: '#cfe0d4',
        padding: '26px 16px',
        marginBlockStart: 40,
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          marginInline: 'auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          fontSize: 12,
        }}
      >
        <span style={{ color: '#f4f1e6' }}>اسبان — دستیار هوشمند سوارکار</span>
        <span>محصول پوشیدنی: اسبان‌پالس</span>
      </div>
    </footer>
  );
}
