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
import AdminIngredients from './pages/AdminIngredients'
import AdminChefs from './pages/AdminChefs'
import AdminCategories from './pages/AdminCategories'

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
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute>
              <AdminCategories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/chefs"
          element={
            <ProtectedRoute allowChef>
              <AdminChefs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/ingredients"
          element={
            <ProtectedRoute allowChef>
              <AdminIngredients />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  )
}
