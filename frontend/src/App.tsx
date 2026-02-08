import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DevAccountSwitcher } from './components/DevAccountSwitcher';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Trading } from './pages/Trading';
import { Bridge } from './pages/Bridge';
import { MintLoan, Strategies, Portfolios, Liquidity, Insurance } from './pages/Wrappers';

function App() {
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/mint" element={<MintLoan />} />
          <Route path="/trading" element={<Trading />} />
          <Route path="/strategies" element={<Strategies />} />
          <Route path="/bridge" element={<Bridge />} />
          <Route path="/insurance" element={<Insurance />} />
          <Route path="/portfolios" element={<Portfolios />} />
          <Route path="/liquidity" element={<Liquidity />} />
        </Routes>
      </Layout>
      <DevAccountSwitcher />
    </>
  );
}

export default App;
