import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Calender from "./components/Calender";
import Categories from "./components/Categories";
import Category from "./components/Category";
import Event from "./components/Event";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/calander" element={<Calender />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/category" element={<Category />} />
        <Route path="/category/:id" element={<Category />} />
        <Route path="/event" element={<Event />} />
        <Route path="/event/:id" element={<Event />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
