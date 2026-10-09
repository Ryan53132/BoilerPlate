import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAccessToken } from '../services/api';

export default function LandingPage() {
const navigate = useNavigate();
const isLogged = !!getAccessToken();

return (
<div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1f2937', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

  {/* Header / Navbar */}
  <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', borderBottom: '1px solid #e5e7eb', background: '#ffffff' }}>
    <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2563eb', margin: 0 }}>MeuAppAuth</h1>
    <nav style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
      {isLogged ? (
        <button 
          onClick={() => navigate('/dashboard')}
          style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
        >
          Ir para o Painel
        </button>
      ) : (
        <>
          <Link to="/login" style={{ textDecoration: 'none', color: '#4b5563', fontWeight: 500 }}>Entrar</Link>
          <Link to="/register" style={{ textDecoration: 'none', background: '#2563eb', color: '#fff', padding: '8px 16px', borderRadius: '6px', fontWeight: 600 }}>Cadastre-se</Link>
        </>
      )}
    </nav>
  </header>

  {/* Hero Section */}
  <section style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 20px', background: 'linear-gradient(to bottom, #f9fafb, #ffffff)' }}>
    <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '6px 14px', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 600, marginBottom: '20px' }}>
      Segurança e Performance em Alta
    </span>
    <h2 style={{ fontSize: '2.5rem', maxWidth: '700px', fontWeight: 800, lineHeight: 1.2, margin: '0 0 20px 0', color: '#111827' }}>
      O sistema de autenticação definitivo para o seu negócio
    </h2>
    <p style={{ fontSize: '1.125rem', maxWidth: '600px', color: '#6b7280', margin: '0 0 30px 0' }}>
      Proteja seus dados com tokens de acesso seguros, gerenciamento de sessões avançado e uma experiência de usuário fluida.
    </p>
    <div style={{ display: 'flex', gap: '15px' }}>
      <button 
        onClick={() => navigate('/register')} 
        style={{ background: '#2563eb', color: '#white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' }}
      >
        Começar Gratuitamente
      </button>
      <button 
        onClick={() => navigate('/login')} 
        style={{ background: '#ffffff', color: '#374151', border: '1px solid #d1d5db', padding: '12px 24px', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}
      >
        Já tenho conta
      </button>
    </div>
  </section>

  {/* Features Section */}
  <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', padding: '60px 40px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
    <div style={{ background: '#f9fafb', padding: '24px', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '10px', color: '#1f2937' }}>🔒 JWT Seguro</h3>
      <p style={{ color: 'http://www.w3.org/2000/svg' === '' ? '' : '#6b7280', fontSize: '0.95rem', lineHeight: 1.5 }}>
        Access tokens velozes combinados com cookies HTTP-only para o seu Refresh Token.
      </p>
    </div>
    <div style={{ background: '#f9fafb', padding: '24px', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '10px', color: '#1f2937' }}>⚡ Renovação Automática</h3>
      <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.5 }}>
        Suas requisições renovam o token silenciosamente em segundo plano quando expirado.
      </p>
    </div>
    <div style={{ background: '#f9fafb', padding: '24px', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '10px', color: '#1f2937' }}>🛡️ Controle de Sessão</h3>
      <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.5 }}>
        Monitoramento de User-Agent e revogação dinâmica em caso de atividades suspeitas.
      </p>
    </div>
  </section>

  {/* Footer */}
  <footer style={{ textAlign: 'center', padding: '20px', borderTop: '1px solid #e5e7eb', color: '#9ca3af', fontSize: '0.875rem' }}>
    &copy; {new Date().getFullYear()} MeuAppAuth. Todos os direitos reservados.
  </footer>

</div>


);
}