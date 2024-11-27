import type React from "react";
import { createContext, useContext } from "react";
import * as api from "./pocketBaseService";

type QuoteService = typeof api.pocketBaseService;

const ServiceOverrideContext = createContext<Partial<QuoteService> | undefined>(
  undefined
);

interface ServiceProviderProps {
  children: React.ReactNode;
  override?: Partial<QuoteService>;
}

export function ApiServiceProvider({
  children,
  override,
}: ServiceProviderProps) {
  return (
    <ServiceOverrideContext.Provider value={override}>
      {children}
    </ServiceOverrideContext.Provider>
  );
}

export const useApiService = (): QuoteService => {
  const context = useContext(ServiceOverrideContext);
  if (!context) return api.pocketBaseService;
  return { ...api.pocketBaseService, ...context };
};
