import type { ReactNode } from "react";

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export const Icons = {
  Search: () => (
    <Icon>
      <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
      <path d="M21 21l-4.2-4.2" />
    </Icon>
  ),
  Bell: () => (
    <Icon>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 7H3s3 0 3-7" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </Icon>
  ),
  Dashboard: () => (
    <Icon>
      <path d="M3 13h8V3H3v10Z" />
      <path d="M13 21h8v-6h-8v6Z" />
      <path d="M13 3h8v10h-8V3Z" />
      <path d="M3 21h8v-6H3v6Z" />
    </Icon>
  ),
  Users: () => (
    <Icon>
      <path d="M16 11a4 4 0 1 0-8 0" />
      <path d="M2 21a7 7 0 0 1 20 0" />
      <path d="M20 21a6 6 0 0 0-6-6" />
    </Icon>
  ),
  Book: () => (
    <Icon>
      <path d="M4 19a2 2 0 0 0 2 2h14" />
      <path d="M6 17V5a2 2 0 0 1 2-2h12v16H8a2 2 0 0 0-2 2Z" />
    </Icon>
  ),
  Layers: () => (
    <Icon>
      <path d="m12 2 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 17 9 5 9-5" />
    </Icon>
  ),
  Clipboard: () => (
    <Icon>
      <path d="M9 3h6v4H9V3Z" />
      <path d="M7 7h10v14H7V7Z" />
      <path d="M9 3h6" />
    </Icon>
  ),
  Chart: () => (
    <Icon>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M8 17v-6" />
      <path d="M12 17v-9" />
      <path d="M16 17v-3" />
    </Icon>
  ),
  Settings: () => (
    <Icon>
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M19.4 15a1.8 1.8 0 0 0 .4 2l.1.1-1.6 1.6-.1-.1a1.8 1.8 0 0 0-2-.4 1.8 1.8 0 0 0-1 1.7V21h-2v-.1a1.8 1.8 0 0 0-1-1.7 1.8 1.8 0 0 0-2 .4l-.1.1-1.6-1.6.1-.1a1.8 1.8 0 0 0 .4-2 1.8 1.8 0 0 0-1.7-1H6v-2h.1a1.8 1.8 0 0 0 1.7-1 1.8 1.8 0 0 0-.4-2l-.1-.1L8.9 6.4l.1.1a1.8 1.8 0 0 0 2 .4 1.8 1.8 0 0 0 1-1.7V5h2v.1a1.8 1.8 0 0 0 1 1.7 1.8 1.8 0 0 0 2-.4l.1-.1 1.6 1.6-.1.1a1.8 1.8 0 0 0-.4 2 1.8 1.8 0 0 0 1.7 1H21v2h-.1a1.8 1.8 0 0 0-1.5 1Z" />
    </Icon>
  ),
  Plus: () => (
    <Icon>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </Icon>
  ),
  ArrowRight: () => (
    <Icon>
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </Icon>
  ),
  User: () => (
    <Icon>
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </Icon>
  ),
  Shield: () => (
    <Icon>
      <path d="M12 2 20 6v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4Z" />
      <path d="M9 12l2 2 4-5" />
    </Icon>
  ),
  Palette: () => (
    <Icon>
      <path d="M12 3a9 9 0 1 0 0 18c2 0 3-1 3-2.5 0-1-1-1.5-1.5-2S12 14.5 12 13c0-2 2-3 4-3h1a4 4 0 0 0 0-7h-1" />
      <path d="M7.5 10.5h0" />
      <path d="M9.5 7.5h0" />
      <path d="M14.5 7.5h0" />
      <path d="M16.5 10.5h0" />
    </Icon>
  ),
  Globe: () => (
    <Icon>
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
      <path d="M3 12h18" />
      <path d="M12 3c3 3 3 15 0 18" />
      <path d="M12 3c-3 3-3 15 0 18" />
    </Icon>
  ),
  Sun: () => (
    <Icon>
      <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M4.9 4.9 6.3 6.3" />
      <path d="M17.7 17.7 19.1 19.1" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="M4.9 19.1 6.3 17.7" />
      <path d="M17.7 6.3 19.1 4.9" />
    </Icon>
  ),
  Moon: () => (
    <Icon>
      <path d="M21 12.8A7.5 7.5 0 0 1 11.2 3a6.5 6.5 0 1 0 9.8 9.8Z" />
    </Icon>
  ),
  Monitor: () => (
    <Icon>
      <path d="M4 5h16v11H4V5Z" />
      <path d="M8 21h8" />
      <path d="M12 16v5" />
    </Icon>
  ),
  Logout: () => (
    <Icon>
      <path d="M10 17H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3" />
      <path d="M15 12H9" />
      <path d="m15 12-2-2" />
      <path d="m15 12-2 2" />
      <path d="M19 19V5" />
    </Icon>
  ),
};

