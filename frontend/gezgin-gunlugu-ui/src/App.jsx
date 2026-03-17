import React from 'react';
import { Outlet } from 'react-router-dom';

// DÜZELTME: Dosya adı sisteminizde 'NavBar.jsx' olduğu için import yolunu buna göre güncelledik.
import Navbar from './components/NavBar.jsx'; 

function App() {
  return (
    <div className="App">
      {/* Bileşen adı da Navbar olarak düzeltildi */}
      <Navbar /> 

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default App;