import { useEffect, useMemo, useState } from 'react';
import { Layout } from './components/Layout';
import { health, sources } from './lib/api';
import type { HealthResponse, PageKey } from './lib/types';
import HomePage from './pages/HomePage';
import { ChatPage } from './pages/ChatPage';
import { GuidePage } from './pages/GuidePage';
import { ComparePage } from './pages/ComparePage';
import { MisinformationPage } from './pages/MisinformationPage';
import { ReadinessPage } from './pages/ReadinessPage';
import { SimulatorPage } from './pages/SimulatorPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageKey>('home');
  const [healthState, setHealthState] = useState<'loading' | 'healthy' | 'degraded'>('loading');
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [sourceCount, setSourceCount] = useState(0);

  useEffect(() => {
    let alive = true;

    async function loadStatus() {
      try {
        const [healthResponse, sourceResponse] = await Promise.all([health(), sources()]);
        if (!alive) return;
        setHealthData(healthResponse);
        setSourceCount(sourceResponse.sources.length);
        setHealthState('healthy');
      } catch {
        if (!alive) return;
        setHealthState('degraded');
      }
    }

    loadStatus();
    return () => {
      alive = false;
    };
  }, []);

  const page = useMemo(() => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} health={healthData} sourcesCount={sourceCount} />;
      case 'chat':
        return <ChatPage />;
      case 'guide':
        return <GuidePage />;
      case 'compare':
        return <ComparePage />;
      case 'misinformation':
        return <MisinformationPage />;
      case 'readiness':
        return <ReadinessPage />;
      case 'simulate':
        return <SimulatorPage />;
      default:
        return <HomePage onNavigate={setCurrentPage} health={healthData} sourcesCount={sourceCount} />;
    }
  }, [currentPage, healthData, sourceCount]);

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage} healthState={healthState}>
      {page}
    </Layout>
  );
}
