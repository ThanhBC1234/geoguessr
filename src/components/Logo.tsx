export function Logo({ small = false }: { small?: boolean }) {
  return (
    <div className={`logo ${small ? "logo--small" : ""}`}>
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="28" r="22" fill="#14b8a6" />
        <path
          d="M14 22c8 4 14-6 22-2s8 10 16 8M12 34c10-2 14 6 24 4s10-8 18-4"
          stroke="#0f172a"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path d="M32 62 22 44h20z" fill="#f59e0b" />
        <circle cx="32" cy="28" r="22" fill="none" stroke="#f59e0b" strokeWidth="4" />
      </svg>
      <span>
        Terra<b>Guess</b>
      </span>
    </div>
  );
}
