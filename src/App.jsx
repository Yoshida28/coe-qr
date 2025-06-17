import { Routes, Route } from 'react-router-dom';
import AuthProvider from './components/AuthProvider';
import Login from './components/Login';
import Home from './components/Home';
import './styles.css';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;