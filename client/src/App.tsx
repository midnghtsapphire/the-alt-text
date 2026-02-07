import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import QADetail from "./pages/QADetail";
import Dashboard from "./pages/Dashboard";
import Resources from "./pages/Resources";
import Sources from "./pages/Sources";
import Bookmarks from "./pages/Bookmarks";
import Search from "./pages/Search";
import Nomad from "./pages/Nomad";
import NomadLocation from "./pages/NomadLocation";
import NomadCompare from "./pages/NomadCompare";
import MyProgress from "./pages/MyProgress";
import Employers from "./pages/Employers";
import CostEstimator from "./pages/CostEstimator";
import Changelog from "./pages/Changelog";
import AdminDashboard from "./pages/AdminDashboard";
import Suggestions from "./pages/Suggestions";
import IndustrialLadder from "./pages/IndustrialLadder";
import TrainingLocator from "./pages/TrainingLocator";
import TaxHome from "./pages/tax/TaxHome";
import TaxExpenses from "./pages/TaxExpenses";
import TaxNotifications from "./pages/TaxNotifications";
import SecurityTools from "./pages/SecurityTools";
import SecurityAssessment from "./pages/SecurityAssessment";
import Partners from "./pages/Partners";
import CareerHighway from "./pages/CareerHighway";
import AffiliateCredentials from "./pages/AffiliateCredentials";
import AffiliateChecklist from "./pages/AffiliateChecklist";
import OZDashboard from "./pages/OZDashboard";
import RewardsDashboard from "./pages/RewardsDashboard";
import AltTextLanding from "./pages/AltTextLanding";
import FreeImages from "./pages/FreeImages";

function Router() {
  return (
    <Switch>
      <Route path="/" component={AltTextLanding} />
      <Route path="/old-home" component={Home} />
      <Route path="/browse" component={Browse} />
      <Route path="/browse/:topicSlug" component={Browse} />
      <Route path="/qa/:slug" component={QADetail} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/resources" component={Resources} />
      <Route path="/sources" component={Sources} />
      <Route path="/bookmarks" component={Bookmarks} />
      <Route path="/search" component={Search} />
      <Route path="/nomad" component={Nomad} />
      <Route path="/nomad/compare" component={NomadCompare} />
      <Route path="/nomad/:slug" component={NomadLocation} />
      <Route path={'/my-progress'} component={MyProgress} />
      <Route path={'/employers'} component={Employers} />
      <Route path={'/cost-estimator'} component={CostEstimator} />
      <Route path={'/changelog'} component={Changelog} />
      <Route path={'/admin'} component={AdminDashboard} />
      <Route path={'/suggestions'} component={Suggestions} />
      <Route path={'/industrial-ladder'} component={IndustrialLadder} />
       <Route path={'/training-locator'} component={TrainingLocator} />
      <Route path={'/tax'} component={TaxHome} />
      <Route path={'/tax/expenses'} component={TaxExpenses} />
      <Route path={'/tax/notifications'} component={TaxNotifications} />
      <Route path={'/security/tools'} component={SecurityTools} />
      <Route path={'/security/assessment'} component={SecurityAssessment} />
      <Route path={'/partners'} component={Partners} />
      <Route path={'/career-highway'} component={CareerHighway} />
      <Route path="/affiliate-credentials" component={AffiliateCredentials} />
      <Route path="/affiliate-checklist" component={AffiliateChecklist} />
      <Route path="/oz-dashboard" component={OZDashboard} />
      <Route path="/rewards" component={RewardsDashboard} />
      <Route path="/free-images" component={FreeImages} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
