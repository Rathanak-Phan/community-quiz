import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import './App.css'

function App() {

  return (
    <div>
      <Router>
        {/* header */}
        <Routes>
          <Route path='/login' element={<Login />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
