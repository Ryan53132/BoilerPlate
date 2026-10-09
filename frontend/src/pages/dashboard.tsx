import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, setAccessToken, getAccessToken } from '../services/api';
import { useAuth } from '../services/authContext';

export default function Dashboard() {
  const [protectedData, setProtectedData] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleFetchProtected = async () => {
    setMessage('');
    try {
      // Substitua pela sua rota protegida real do backend
      const res = await apiFetch('/menu');
      if (!res.ok) throw new Error('Não autorizado ou rota inexistente');
      const data = await res.json();
      setProtectedData(JSON.stringify(data, null, 2));
    } catch (err) {
      setMessage(`Erro: ${err.message}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Painel Protegido</h2>
      <p>Token de acesso ativo: <strong>{getAccessToken() ? 'Sim' : 'Não'}</strong></p>
      
      {message && <p style={{ color: 'red' }}>{message}</p>}
      
      <div style={{ display: 'flex', gap: '10px', margin: '15px 0' }}>
        <button onClick={handleFetchProtected}>Testar Rota Protegida</button>
        <button onClick={handleLogout} style={{ background: '#ff4d4d', color: '#fff' }}>Sair</button>
      </div>

      {protectedData && (
        <pre style={{ background: '#f4f4f4', padding: '10px', borderRadius: '4px' }}>
          {protectedData}
        </pre>
      )}
    </div>
  );
}