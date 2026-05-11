import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import AppLayout from './components/layout/AppLayout';

// 工作台首页
import DashboardPage from './pages/DashboardPage';

// 个人分身
import IncubationDashboard from './pages/incubation/IncubationDashboard';
import AgentChatPage from './pages/incubation/AgentChatPage';
import AgentStudio from './pages/incubation/AgentStudio';

// 组织分身
import ProductionDashboard from './pages/production/ProductionDashboard';
import OrgAgentDetail from './pages/production/OrgAgentDetail';
import TrainingTrack from './pages/production/TrainingTrack';
import OrgAgentBuilder from './pages/production/OrgAgentBuilder';

function App() {
  return (
    <ConfigProvider locale={zhCN} theme={{ token: { colorPrimary: '#1677ff', borderRadius: 6 } }}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/incubation" element={<IncubationDashboard />} />
            <Route path="/incubation/agents/:name" element={<AgentChatPage />} />
            <Route path="/incubation/studio" element={<AgentStudio />} />
            <Route path="/production" element={<ProductionDashboard />} />
            <Route path="/production/agents/:name" element={<OrgAgentDetail />} />
            <Route path="/production/training" element={<TrainingTrack />} />
            <Route path="/production/org-builder" element={<OrgAgentBuilder />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
