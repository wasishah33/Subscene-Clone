import { useState } from 'react';
import Modal from './Modal';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export default function AuthModal({ isOpen, onClose, initialView = 'login' }) {
  const [currentView, setCurrentView] = useState(initialView);
  
  const handleSwitchToLogin = () => setCurrentView('login');
  const handleSwitchToRegister = () => setCurrentView('register');
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={currentView === 'login' ? 'Sign In' : 'Create an Account'}
    >
      {currentView === 'login' ? (
        <LoginForm 
          onClose={onClose} 
          onSwitchToRegister={handleSwitchToRegister} 
        />
      ) : (
        <RegisterForm 
          onClose={onClose} 
          onSwitchToLogin={handleSwitchToLogin} 
        />
      )}
    </Modal>
  );
} 