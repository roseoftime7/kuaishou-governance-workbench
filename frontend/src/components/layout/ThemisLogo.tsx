// 司衡 Themis — AI驱动的电商治理平台 Logo
// 设计理念：盾形轮廓(治理) + 六边形AI核心 + 多节点连线(多Agent协同) + 天平(司衡/Themis)
export default function ThemisLogo({ size = 32, collapsed = false }: { size?: number; collapsed?: boolean }) {
  const s = size;

  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <defs>
        {/* 主渐变：蓝紫青 */}
        <linearGradient id="logoGradMain" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4f8cff" />
          <stop offset="40%" stopColor="#7b5cf0" />
          <stop offset="100%" stopColor="#06d6a0" />
        </linearGradient>
        {/* 发光渐变 */}
        <linearGradient id="logoGradGlow" x1="20" y1="20" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
        {/* 盾形内渐变 */}
        <linearGradient id="logoGradShield" x1="16" y1="10" x2="48" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(79,140,255,0.15)" />
          <stop offset="100%" stopColor="rgba(6,214,160,0.08)" />
        </linearGradient>
        {/* 节点光晕 */}
        <radialGradient id="logoGradNodeCenter" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="50%" stopColor="#7b5cf0" />
          <stop offset="100%" stopColor="rgba(123,92,240,0)" />
        </radialGradient>
        <radialGradient id="logoGradNodeR1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="50%" stopColor="#4f8cff" />
          <stop offset="100%" stopColor="rgba(79,140,255,0)" />
        </radialGradient>
        <radialGradient id="logoGradNodeR2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="50%" stopColor="#06d6a0" />
          <stop offset="100%" stopColor="rgba(6,214,160,0)" />
        </radialGradient>
        <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="logoGlowStrong" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ===== 盾形轮廓 (治理) ===== */}
      <path
        d="M32 6 L48 12 L52 24 C54 36 48 50 32 58 C16 50 10 36 12 24 L16 12 Z"
        fill="url(#logoGradShield)"
        stroke="url(#logoGradMain)"
        strokeWidth="1.8"
        strokeLinejoin="round"
        opacity="0.85"
      />

      {/* 盾形内细线 */}
      <path
        d="M32 12 L44 17 L47 26 C48.5 35 44 45 32 52 C20 45 15.5 35 17 26 L20 17 Z"
        fill="none"
        stroke="url(#logoGradMain)"
        strokeWidth="0.6"
        strokeLinejoin="round"
        opacity="0.3"
      />

      {/* ===== 天平底座 (Themis/司法) ===== */}
      <g filter="url(#logoGlow)" opacity="0.9">
        {/* 天平立柱 */}
        <line x1="32" y1="48" x2="32" y2="36" stroke="url(#logoGradMain)" strokeWidth="1.2" />
        {/* 天平横梁 */}
        <line x1="22" y1="36" x2="42" y2="36" stroke="url(#logoGradMain)" strokeWidth="1.2" />
        {/* 天平三角底座 */}
        <path d="M28 48 L32 44 L36 48 Z" fill="url(#logoGradMain)" opacity="0.7" />
        {/* 左盘 */}
        <line x1="22" y1="36" x2="20" y2="40" stroke="url(#logoGradMain)" strokeWidth="0.8" />
        <ellipse cx="20" cy="42" rx="4" ry="1.8" fill="none" stroke="url(#logoGradMain)" strokeWidth="0.8" />
        {/* 右盘 */}
        <line x1="42" y1="36" x2="44" y2="40" stroke="url(#logoGradMain)" strokeWidth="0.8" />
        <ellipse cx="44" cy="42" rx="4" ry="1.8" fill="none" stroke="url(#logoGradMain)" strokeWidth="0.8" />
      </g>

      {/* ===== 六边形AI核心 (中心节点) ===== */}
      <g filter="url(#logoGlowStrong)">
        <polygon
          points="32,26 38,29.5 38,36.5 32,40 26,36.5 26,29.5"
          fill="rgba(123,92,240,0.2)"
          stroke="url(#logoGradGlow)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        {/* 六边形中心亮点 */}
        <circle cx="32" cy="33" r="3.5" fill="url(#logoGradNodeCenter)" />
        <circle cx="32" cy="33" r="1.8" fill="#fff" opacity="0.9" />
      </g>

      {/* ===== 外围节点 (多Agent) + 连线 ===== */}
      <g filter="url(#logoGlow)">
        {/* 连线：中心 → 各Agent */}
        <line x1="32" y1="28" x2="32" y2="18" stroke="#4f8cff" strokeWidth="0.7" opacity="0.5" />
        <line x1="37" y1="30" x2="46" y2="22" stroke="#7b5cf0" strokeWidth="0.7" opacity="0.5" />
        <line x1="38" y1="35" x2="50" y2="34" stroke="#06d6a0" strokeWidth="0.7" opacity="0.5" />
        <line x1="35" y1="39" x2="48" y2="47" stroke="#4f8cff" strokeWidth="0.7" opacity="0.5" />
        <line x1="27" y1="38" x2="18" y2="46" stroke="#7b5cf0" strokeWidth="0.7" opacity="0.5" />
        <line x1="26" y1="32" x2="14" y2="30" stroke="#06d6a0" strokeWidth="0.7" opacity="0.5" />

        {/* Agent节点 — 蓝色系 (感知) */}
        <circle cx="32" cy="17" r="2.5" fill="url(#logoGradNodeR1)" />
        <circle cx="32" cy="17" r="1.3" fill="#fff" opacity="0.85" />

        {/* Agent节点 — 紫色系 (研判) */}
        <circle cx="47" cy="22" r="2.2" fill="url(#logoGradNodeCenter)" />
        <circle cx="47" cy="22" r="1.1" fill="#fff" opacity="0.85" />

        {/* Agent节点 — 绿色系 (处置) */}
        <circle cx="50" cy="36" r="2.2" fill="url(#logoGradNodeR2)" />
        <circle cx="50" cy="36" r="1.1" fill="#fff" opacity="0.85" />

        {/* Agent节点 — 青蓝 (补防) */}
        <circle cx="47" cy="48" r="2" fill="url(#logoGradNodeR1)" />
        <circle cx="47" cy="48" r="1" fill="#fff" opacity="0.8" />

        {/* Agent节点 — 紫色 (巡检) */}
        <circle cx="17" cy="46" r="2" fill="url(#logoGradNodeCenter)" />
        <circle cx="17" cy="46" r="1" fill="#fff" opacity="0.8" />

        {/* Agent节点 — 绿色 (咨询) */}
        <circle cx="13" cy="30" r="2.2" fill="url(#logoGradNodeR2)" />
        <circle cx="13" cy="30" r="1.1" fill="#fff" opacity="0.85" />
      </g>

      {/* ===== 数据流粒子 (动感) ===== */}
      <g opacity="0.6">
        <circle cx="32" cy="22" r="0.6" fill="#fff" />
        <circle cx="40" cy="27" r="0.5" fill="#fff" />
        <circle cx="42" cy="33" r="0.6" fill="#fff" />
        <circle cx="39" cy="41" r="0.5" fill="#fff" />
        <circle cx="25" cy="37" r="0.5" fill="#fff" />
        <circle cx="22" cy="27" r="0.6" fill="#fff" />
      </g>

      {/* ===== 左右天平盘中的微缩AI标记 ===== */}
      <g opacity="0.5">
        {/* 左盘：数据点 */}
        <circle cx="20" cy="41" r="1" fill="#4f8cff" />
        {/* 右盘：校验点 */}
        <circle cx="44" cy="41" r="1" fill="#06d6a0" />
      </g>
    </svg>
  );
}
