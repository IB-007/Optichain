import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Forecasting from './components/Forecasting';
import Allocation from './components/Allocation';
import Simulation from './components/Simulation';
import { ViewState } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);

  const renderView = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard />;
      case ViewState.FORECASTING:
        return <Forecasting />;
      case ViewState.ALLOCATION:
        return <Allocation />;
      case ViewState.SIMULATION:
        return <Simulation />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

export default App;