import React, { useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './app/AppRoutes'
import { AuthProvider } from './features/auth'
import { ThemeProvider } from './features/theme'
import ProductCompareModal from './features/products/ProductCompareModal'

function App() {
  const [compareProducts, setCompareProducts] = useState([]);

  const toggleCompare = (product) => {
    setCompareProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      return exists ? prev.filter((p) => p.id !== product.id) : [...prev, product];
    });
  };

  const clearCompare = () => setCompareProducts([]);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes compareProducts={compareProducts} toggleCompare={toggleCompare} clearCompare={clearCompare} />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
