export function BrandMark({
  size = 24,
  className = "",
  colour = "#B9FF66",
  background = "transparent",
}: {
  size?: number;
  className?: string;
  colour?: string;
  background?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="tutor."
      role="img"
    >
      {background !== "transparent" && (
        <rect width="100" height="100" rx="14" fill={background} />
      )}
      {/* T — horizontal bar */}
      <rect x="22" y="22" width="62" height="18" fill={colour} />
      {/* T — vertical stem */}
      <rect x="44" y="22" width="18" height="62" fill={colour} />
      {/* period */}
      <rect x="18" y="72" width="14" height="14" fill={colour} />
    </svg>
  );
}
