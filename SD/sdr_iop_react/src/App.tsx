import React from 'react';
import './App.css';
// @ts-expect-error 2691
import Canvas from "./components/canvas/Canvas.tsx"
function App() {
  return (
    <div className="App" >
      <Canvas width={window.innerWidth} height={window.innerHeight}></Canvas>
    </div>
  );
}

export default App;
