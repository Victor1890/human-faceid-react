import RunHuman from './components/Human'
import InitWebCam from './components/WebCam'

function App() {

  return (
    <div>
      <canvas id="canvas" />
      <video id="video" autoPlay muted />
      <InitWebCam
        elementId="video"
      />
      <RunHuman
        inputId="video"
        outputId="canvas"
      />
    </div>
  )
}

export default App
