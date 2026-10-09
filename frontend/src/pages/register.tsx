import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../services/api';

export default function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ nome, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(data.error));
      
      alert('Usuário registrado com sucesso!');
      navigate('/login');
    } catch (err) {
      setMessage(`Erro: ${err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Criar Conta</h2>
      {message && <p style={{ color: 'red' }}>{message}</p>}
      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input type="text" placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} required />
        <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Senha (mín. 6 caracteres)" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Registrar</button>
      </form>
      <p style={{ marginTop: '15px' }}>Já tem uma conta? <Link to="/login">Entrar</Link></p>
    </div>
  );
}