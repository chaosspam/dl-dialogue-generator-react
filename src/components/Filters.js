export default function Filters() {
  return (
    <svg width="0" height="0" viewBox="0 0 0 0">
      <defs>
        <filter id="flashback" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feColorMatrix type="saturate" values="0" />
          <feColorMatrix
            type="matrix"
            values="0.929  0  0 0 0
                    0  0.757 0 0 0
                    0  0  0.675 0 0
                    0  0  0 1 0"/>
        </filter>
      </defs>
    </svg>
  );
}
