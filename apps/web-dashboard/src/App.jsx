import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import MenuPage from './MenuPage';
import OrderPage from './OderPage'; 
import StaffDashboard from './StaffDashboard';
import WaiterRequestsPage from './WaiterRequestsPage';
import PerformanceInsights from './PerformanceInsights';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/orders" element={<OrderPage />} />
        <Route path="/" element={<LoginPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/dashboard" element={<StaffDashboard />} />
        <Route path="/waiter-requests" element={<WaiterRequestsPage />} />
        <Route path="/performance-insights" element={<PerformanceInsights />} />
        
      </Routes>
    </Router>
  );
}
