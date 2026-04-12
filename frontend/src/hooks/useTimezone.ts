import { useEffect, useState } from "react";

import { getStoredTimezone, subscribeLocaleSettings, type AppTimezone } from "@/i18n/storage";

export function useTimezone(): AppTimezone {
  const [tz, setTz] = useState<AppTimezone>(() => getStoredTimezone());

  useEffect(() => subscribeLocaleSettings(() => setTz(getStoredTimezone())), []);

  return tz;
}
