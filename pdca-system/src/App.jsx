import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { DataProvider } from './context/DataContext';
import AppShell from './components/layout/AppShell';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const DataEntryPage = lazy(() => import('./pages/DataEntryPage'));
const MonthlyReportPage = lazy(() => import('./pages/MonthlyReportPage'));
const PublicReportPage = lazy(() => import('./pages/PublicReportPage'));

export default function App() {
  return (
    <AppProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppShell />}>
              <Route index element={<Suspense fallback={null}><DashboardPage /></Suspense>} />
              <Route path="entry" element={<Suspense fallback={null}><DataEntryPage /></Suspense>} />
              <Route path="report" element={<Suspense fallback={null}><MonthlyReportPage /></Suspense>} />
              <Route path="public" element={<Suspense fallback={null}><PublicReportPage /></Suspense>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AppProvider>
  );
}
