import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import MainRoutes from './pages/MainRoutes'
import Header from './assets/components/header/Header'
import Footer from './assets/components/footer/Footer'
import { getAuth } from './middlewares/auth/auth'
import { useEffect, useState } from 'react'

function App() {
  const [auth, setAuth] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()

  const guestPages = [
    '/admin/login', '/admin/register',
    '/parent/login', '/parent/register',
    '/tutor/login', '/tutor/register'
  ]

  useEffect(() => {
    const authData = getAuth()
    setAuth(authData)
  }, [])

  useEffect(() => {
    if (!auth) return

    const currentPath = location.pathname

    // Redirect authenticated users away from guest pages
    if (guestPages.includes(currentPath) && auth) {
      const user = auth.user
      navigate(`/${user}/dashboard`, { replace: true })
      return
    }

    // Redirect unauthenticated users from protected pages
    if (!guestPages.includes(currentPath) && !auth && currentPath !== '/') {
      navigate('/', { replace: true })
    }
  }, [auth, location.pathname, navigate])

  // Show loading state while checking authentication
  if (auth === undefined) {
    return <div>Loading...</div> // Or your custom loading component
  }

  return (
    <>
      <Header />
      <Routes>
        {MainRoutes.map((r, i) => (
          <Route key={i} path={r.path} element={<r.element />} />
        ))}
      </Routes>
      <Footer />
    </>
  )
}

export default App