import { useId } from "react";

/** A geometric study of the sculpture, never a replacement for the official logo. */
export function SculptureFallback() {
  const id = useId().replace(/:/g, "");

  return (
    <svg viewBox="0 0 640 640" fill="none" aria-hidden="true" focusable="false" style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id={`${id}-silver`} x1="155" y1="120" x2="426" y2="530" gradientUnits="userSpaceOnUse">
          <stop stopColor="#eaf0f9" />
          <stop offset=".18" stopColor="#89919e" />
          <stop offset=".37" stopColor="#e3e8ef" />
          <stop offset=".52" stopColor="#3b414c" />
          <stop offset=".73" stopColor="#a4afbe" />
          <stop offset="1" stopColor="#252c38" />
        </linearGradient>
        <linearGradient id={`${id}-dark`} x1="177" y1="390" x2="440" y2="132" gradientUnits="userSpaceOnUse">
          <stop stopColor="#252c37" />
          <stop offset=".44" stopColor="#697786" />
          <stop offset=".61" stopColor="#e5edf7" />
          <stop offset="1" stopColor="#4e5967" />
        </linearGradient>
        <linearGradient id={`${id}-edge`} x1="150" y1="200" x2="460" y2="470" gradientUnits="userSpaceOnUse">
          <stop stopColor="#c3cad4" />
          <stop offset=".46" stopColor="#171d27" />
          <stop offset="1" stopColor="#627286" />
        </linearGradient>
        <radialGradient id={`${id}-glow`}>
          <stop stopColor="#2979ff" stopOpacity=".14" />
          <stop offset="1" stopColor="#2979ff" stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-blur`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      <ellipse cx="330" cy="346" rx="280" ry="270" fill={`url(#${id}-glow)`} />
      <g stroke="#7995b7" strokeOpacity=".15">
        <ellipse cx="320" cy="355" rx="269" ry="113" transform="rotate(-22 320 355)" />
        <ellipse cx="320" cy="355" rx="268" ry="114" transform="rotate(52 320 355)" />
        <path d="M61 355H580M320 93V600" strokeDasharray="3 9" />
      </g>
      <g transform="rotate(-9 320 320)">
        <path d="M164 434 351 143 429 157 245 451Z" fill={`url(#${id}-dark)`} stroke="#dce9fa" strokeOpacity=".5" />
        <path d="m164 434 29 33 80 19-28-35Z" fill="#323e4f" />
        <path d="m429 157 27 32-183 297-28-35Z" fill={`url(#${id}-edge)`} />
        <path d="M146 178 235 153 454 446 355 471Z" fill={`url(#${id}-silver)`} stroke="#edf2ff" strokeOpacity=".55" />
        <path d="m146 178-7 41 210 300 6-48Z" fill={`url(#${id}-edge)`} />
        <path d="m355 471-6 48 99-25 6-48Z" fill="#333d4b" />
        <path d="m156 204 200 279 86-23" stroke="#328cff" strokeWidth="3" filter={`url(#${id}-blur)`} />
        <path d="m156 204 200 279 86-23" stroke="#7cbbff" strokeWidth="1.1" />
        <path d="m351 143 78 14M146 178l89-25" stroke="#fff" strokeWidth="1.2" />
      </g>
      <g fill="#7cb5ff">
        <circle cx="80" cy="421" r="2.3" /><circle cx="548" cy="263" r="2" /><circle cx="452" cy="550" r="1.8" />
      </g>
    </svg>
  );
}
