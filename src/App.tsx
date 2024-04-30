import { Fragment, useRef, useState } from 'react';
import RunHuman from './components/human'
import InitWebCam from './components/WebCam'
import { PersonResult } from '@vladmandic/human'

function App() {

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sourceRef = useRef<HTMLCanvasElement | null>(null);
  const divRef = useRef<HTMLDivElement | null>(null);
  const saveRef = useRef<HTMLButtonElement | null>(null);
  const resetRef = useRef<HTMLButtonElement | null>(null);
  const [person] = useState<PersonResult | null>(null)
  const [fps, setFps] = useState(0)

  return (
    <Fragment>
      <div id='random' className='face-effect' />
      <div className='container'>
        <h3>Face Recognition</h3>
        <h3>FPS: {fps.toFixed(1).padStart(5, " ")}</h3>

        <InitWebCam
          video={videoRef}
          canvas={canvasRef}
          source={sourceRef}
        />
        <RunHuman
          videoRef={videoRef}
          canvasRef={canvasRef}
          sourceRef={sourceRef}
          divRef={divRef}
          saveRef={saveRef}
          resetRef={resetRef}
          setFps={setFps}
        />

        <div ref={divRef}></div>

        {/* <div className="grid">
          <button ref={saveRef}>Save</button>
          <button ref={resetRef}>Reset</button>
        </div> */}

        {person && (
          <div className="table">
            <div className="table-header">
              <div className="header__item">
                <a className="filter__link" href="#">Face Information</a>
              </div>
            </div>
            <div className="table-content">
              <div className="table-row">
                <div className="table-data">Real</div>
                <div className="table-data">{(person.face.real ?? 0) * 100}%</div>
              </div>
              <div className="table-row">
                <div className="table-data">Gender</div>
                <div className="table-data">{(person.face.gender ?? "none")}</div>
              </div>
              <div className="table-row">
                <div className="table-data">Live</div>
                <div className="table-data">{(person.face.live ?? 0) * 100}%</div>
              </div>
              <div className="table-row">
                <div className="table-data">Age</div>
                <div className="table-data">{(person.face.age ?? 0)} age old</div>
              </div>
              {(person.face?.emotion) ? (
                <Fragment>
                  <div className="table-row">
                    <div className="table-data">Are you real?</div>
                    <div className="table-data">{((person.face.real ?? 0) * 100).toFixed(2)}% / {((person.face.real ?? 0) * 100) >= 50 ? "✅" : "❌"}</div>
                  </div>
                  {person.face.emotion.map((emotion, index) => (
                    <div className="table-row" key={`${emotion.emotion}-${index}`}>
                      <div className="table-data">{emotion.emotion}</div>
                      <div className="table-data">{(emotion.score ?? 0) * 100}%</div>
                    </div>
                  ))}
                </Fragment>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </Fragment>
  )
}

export default App
