import React from 'react';
import './App.css';
// @ts-expect-error 2691
import Canvas from "./components/canvas/Canvas.tsx"
function App() {
  return (
    <div className="App">
      <Canvas width={1080} height={720}></Canvas>
    </div>
  );
}

export default App;
