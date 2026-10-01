import { getScopedItem, setScopedItem } from "@/lib/scoped-storage";
import { useState } from "react";

const CDI_RATE_STORAGE_KEY = "currentCdiRate";
const DEFAULT_CDI_RATE = "14.15";

export function useCurrentCdiRate() {
  const [rate, setRateState] = useState(() => getScopedItem(CDI_RATE_STORAGE_KEY) ?? DEFAULT_CDI_RATE);

  function setRate(value: string) {
    setRateState(value);
    setScopedItem(CDI_RATE_STORAGE_KEY, value);
  }

  return [rate, setRate] as const;
}
