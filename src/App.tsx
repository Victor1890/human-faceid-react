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

      <h2>Face Information</h2>
      <div className="table">
        <div className="table-header">
          <div className="header__item"><a id="name" className="filter__link" href="#">Name</a></div>
          <div className="header__item"><a id="wins" className="filter__link filter__link--number" href="#">Wins</a></div>e
        </div>
        <div className="table-content">
          <div className="table-row">
            <div className="table-data">Tom</div>
            <div className="table-data">2</div>
            <div className="table-data">0</div>
            <div className="table-data">1</div>
            <div className="table-data">5</div>
          </div>
          <div className="table-row">
            <div className="table-data">Dick</div>
            <div className="table-data">1</div>
            <div className="table-data">1</div>
            <div className="table-data">2</div>
            <div className="table-data">3</div>
          </div>
          <div className="table-row">
            <div className="table-data">Harry</div>
            <div className="table-data">0</div>
            <div className="table-data">2</div>
            <div className="table-data">2</div>
            <div className="table-data">2</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
