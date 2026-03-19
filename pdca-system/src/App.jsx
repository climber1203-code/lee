import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { DataProvider } from './context/DataContext';
import AppShell from './components/layout/AppShell';
import DashboardPage from './pages/DashboardPage';
import DataEntryPage from './pages/DataEntryPage';
import MonthlyReportPage from './pages/MonthlyReportPage';
import PublicReportPage from './pages/PublicReportPage';

export default function App() {
  return (
    <AppProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppShell />}>
              <Route index element={<DashboardPage />} />
              <Route path="entry" element={<DataEntryPage />} />
              <Route path="report" element={<MonthlyReportPage />} />
              <Route path="public" element={<PublicReportPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AppProvider>
  );
}
