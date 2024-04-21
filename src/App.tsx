import { Fragment, useRef, useState } from 'react';
import RunHuman from './components/Human'
import InitWebCam from './components/WebCam'
import { PersonResult } from '@vladmandic/human'

function App() {

  const saveRef = useRef<HTMLButtonElement | null>(null);
  const resetRef = useRef<HTMLButtonElement | null>(null);
  const [person, setPerson] = useState<PersonResult | null>(null)
  const [fps, setFps] = useState(0)

  return (
    <div className='container'>
      <h3>Face Recognition</h3>
      <h3>FPS: {fps.toFixed(1).padStart(5, " ")}</h3>
      <canvas id="canvas" />
      <video id="video" autoPlay muted />
      <canvas id="source" style={{ display: "none" }} />

      <InitWebCam
        elementId="video"
      />
      <RunHuman
        inputId="video"
        outputId="canvas"
        sourceId="source"
        saveRef={saveRef!}
        resetRef={resetRef!}
        setFps={setFps}
        moreInfo={true}
        faceInfoCb={({ data, width }) => {
          const person = data?.persons[0]
          if (!person) return

          setPerson(person)

          const face = person.face.annotations;

          if (face?.leftEyeIris) {
            const irisSize = Math.max(Math.abs(face.leftEyeIris[3][0] - face.leftEyeIris[1][0]), Math.abs(face.rightEyeIris[3][0] - face.rightEyeIris[1][0])) / width;
            // pixel x and y distance of centers of left and right iris, you can use edges instead
            const irisDistanceXY = [face.leftEyeIris[0][0] - face.rightEyeIris[0][0], face.leftEyeIris[0][1] - face.rightEyeIris[0][1]];
            // absolute distance bewtween eyes in 0..1 range to account for head pitch (we can ignore yaw)
            const irisDistance = Math.sqrt((irisDistanceXY[0] * irisDistanceXY[0]) + (irisDistanceXY[1] * irisDistanceXY[1])) / width;
            // distance of eye from camera in meters
            const cameraDistance = 1.17 / irisSize / 100;
            // distance between eyes in meters
            const eyesDistance = 1.17 * irisDistance / irisSize / 100;
            console.log("data: ", cameraDistance, eyesDistance);
          }

          console.log("person: ", person)
        }}
      />
      <div className="grid">
        <button ref={saveRef}>Save</button>
        <button ref={resetRef}>Reset</button>
      </div>

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
  )
}

export default App
