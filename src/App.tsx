import { useRef, useState } from 'react';
import RunHuman from './components/Human'
import InitWebCam from './components/WebCam'
import { PersonResult } from '@vladmandic/human'

function App() {

  const saveRef = useRef<HTMLButtonElement | null>(null);
  const resetRef = useRef<HTMLButtonElement | null>(null);
  const [person, setPerson] = useState<PersonResult | null>(null)

  return (
    <div className='container'>
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
        moreInfo={false}
        faceInfoCb={({ face }) => {
          const person = face?.persons[0]
          if (!person) return
          setPerson(person)
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
              person.face.emotion.map((emotion, index) => (
                <div className="table-row" key={`${emotion.emotion}-${index}`}>
                  <div className="table-data">{emotion.emotion}</div>
                  <div className="table-data">{(emotion.score ?? 0) * 100}%</div>
                </div>
              ))
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
