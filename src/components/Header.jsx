import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/main_style.css';

function Header() {
  return (
    <header>
      <div className="header-content">
        <div className="logo">
          <h1>КЛИЕНТ</h1>
        </div>
        <ul className="nav-area">
          <li><Link to="/">Главная</Link></li>
          <li><Link to="/tables">Таблицы</Link></li>
          <li><Link to="/login">Аккаунт</Link></li>
        </ul>
      </div>
    </header>
  );
}

export default Header;