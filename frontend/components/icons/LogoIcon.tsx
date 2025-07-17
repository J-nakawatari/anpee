"use client";

export function LogoIcon({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="20" fill="#fbcf36"/>
      <circle cx="18" cy="18" r="2" fill="#4f1910"/>
      <circle cx="30" cy="18" r="2" fill="#4f1910"/>
      <path d="M16 30 Q24 36 32 30" stroke="#4f1910" strokeWidth="2" fill="none"/>
    </svg>
  );
}