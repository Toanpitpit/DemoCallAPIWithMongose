import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import DishDetail from './pages/DishDetail'
import Categories from './pages/Categories'
import Chefs from './pages/Chefs'
import Ingredients from './pages/Ingredients'
import Login from './pages/Login'
import AdminDishes from './pages/AdminDishes'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/dishes/:id" element={<DishDetail />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/chefs" element={<Chefs />} />
        <Route path="/ingredients" element={<Ingredients />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin/dishes"
          element={
            <ProtectedRoute>
              <AdminDishes />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  )
}
