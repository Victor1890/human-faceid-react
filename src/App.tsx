import RunHuman from './components/Human'
import InitWebCam from './components/WebCam'

function App() {

  return (
    <div>
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
        faceInfoCb={console.log}
      />
    </div>
  )
}

export default App
