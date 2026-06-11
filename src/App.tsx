import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Elevators from "@/pages/Elevators";
import Maintenance from "@/pages/Maintenance";
import Reminders from "@/pages/Reminders";
import Reports from "@/pages/Reports";
import Rectifications from "@/pages/Rectifications";
import Faults from "@/pages/Faults";
import Home from "@/pages/Home";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="elevators" element={<Elevators />} />
          <Route path="elevators/new" element={<Elevators />} />
          <Route path="elevators/:id" element={<Elevators />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="reminders" element={<Reminders />} />
          <Route path="reports" element={<Reports />} />
          <Route path="reports/:id" element={<Reports />} />
          <Route path="rectifications" element={<Rectifications />} />
          <Route path="faults" element={<Faults />} />
        </Route>
      </Routes>
    </Router>
  );
}
