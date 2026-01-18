import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Events from './pages/Events';
import About from './pages/About';
import ChatWidget from './components/ChatWidget';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Navbar />
        <ChatWidget />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <footer className="bg-white border-t mt-auto py-8 text-center text-gray-500 text-sm">
          <p>© 2024 Sydney Events. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
