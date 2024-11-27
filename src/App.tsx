import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { QuotesTablePage } from "./pages/QuotesTablePage/QuotesTablePage";
import { ThemeProvider } from "./components/ui/theme-provider";
import { queryClient } from "./queryClient";
import "./index.css";
import "./reset.css";
import { Suspended } from "./components/utils/Suspended/Suspended";

// expose providers for testing
export function AppProviders(props: {
  children: React.ReactNode;
  queryClient?: QueryClient;
}) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <QueryClientProvider client={props.queryClient ?? queryClient}>
        <Suspended>{props.children}</Suspended>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export function App() {
  return (
    <AppProviders>
      <QuotesTablePage />
    </AppProviders>
  );
}
