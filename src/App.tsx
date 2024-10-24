import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
//@ts-ignore
import DaoInterface from './components/DaoInterface'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <DaoInterface />
    </>
  )
}

export default App
