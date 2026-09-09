import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { ToastProvider } from "./components/Toast";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import CitizenReport from "./pages/CitizenReport";
import Volunteers from "./pages/Volunteers";
import Resources from "./pages/Resources";
import Simulation from "./pages/Simulation";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";

function Shell() {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  if (isLanding) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 min-w-0 flex flex-col">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/report" element={<CitizenReport />} />
          <Route path="/volunteers" element={<Volunteers />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/simulation" element={<Simulation />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Shell />
      </ToastProvider>
    </BrowserRouter>
  );
}
