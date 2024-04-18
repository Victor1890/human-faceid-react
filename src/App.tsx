import { useRef } from 'react';
import RunHuman from './components/Human'
import InitWebCam from './components/WebCam'

function App() {

  const saveRef = useRef<HTMLButtonElement | null>(null);
  const resetRef = useRef<HTMLButtonElement | null>(null);

  return (
    <div className='container'>
      <canvas id="canvas" />
      <video id="video" autoPlay muted />
      <canvas id="source" />

      <InitWebCam
        elementId="video"
      />
      <RunHuman
        inputId="video"
        outputId="canvas"
        sourceId="source"
        saveRef={saveRef!}
        resetRef={resetRef!}
        moreInfo={false}
      />
      <div>
        <button ref={saveRef}>Save</button>
        <button ref={resetRef}>Reset</button>
      </div>
    </div>
  )
}

export default App
