import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import './App.css'
import Login from './page/auth/Login'

function App() {

  return (
    <div>
      <Router>
        {/* header */}
        <Routes>
          {/* <Route path='/' element={< />} /> */}
          <Route path='/login' element={<Login />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
