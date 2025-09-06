import React from "react";
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from './components/Header';
import Login from "./components/Login";
import Signup from "./components/Signup";
import Info from "./components/Info";
import Find from "./components/Find";
import Home from "./components/Home";
import Mypage from "./components/Mypage";

function App() {
  return (
    <>
      <Header />
      <div className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/find" element={<Find />} />
          <Route path="/info" element={<Info />} />
          <Route path="/about" element={<h1>서비스소개</h1>} />
          <Route path="/mypage" element={<Mypage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
