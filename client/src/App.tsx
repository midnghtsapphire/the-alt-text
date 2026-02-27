import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Router as WouterRouter } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import Home from "./pages/Home";
import Pricing from "./pages/Pricing";
import Dashboard from "./pages/Dashboard";
import Generate from "./pages/Generate";
import Bulk from "./pages/Bulk";
import ApiKeys from "./pages/ApiKeys";
import ApiDocs from "./pages/ApiDocs";
import Settings from "./pages/Settings";
import RoiCalculator from "./pages/RoiCalculator";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Changelog from "./pages/Changelog";
import Features from "./pages/Features";
import Blog from "./pages/Blog";
import Industries from "./pages/Industries";
import IndustryRouter from "./pages/IndustryRouter";
import { Privacy, Terms, Vpat, AccessibilityStatement } from "./pages/Legal";
function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/generate" component={Generate} />
      <Route path="/bulk" component={Bulk} />
      <Route path="/api-keys" component={ApiKeys} />
      <Route path="/api-docs" component={ApiDocs} />
      <Route path="/settings" component={Settings} />
      <Route path="/roi-calculator" component={RoiCalculator} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/changelog" component={Changelog} />
      <Route path="/features" component={Features} />
      <Route path="/blog" component={Blog} />
      <Route path="/industries" component={Industries} />
      <Route path="/industries/:slug" component={IndustryRouter} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/vpat" component={Vpat} />
      <Route path="/accessibility-statement" component={AccessibilityStatement} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <AccessibilityProvider>
          <TooltipProvider>
            <Toaster />
            <WouterRouter base="/thealttext">
              <AppRouter />
            </WouterRouter>
          </TooltipProvider>
        </AccessibilityProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
export default App;
