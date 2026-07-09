"use client";

import { SWRConfig } from "swr";

export default function SWRProvider({ children }) {
  return (
    <SWRConfig
      value={{
        provider: () => new Map(),
      }}
    >
      {children}
    </SWRConfig>
  );
}