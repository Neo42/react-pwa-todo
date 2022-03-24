import React from 'react'
import {BrowserRouter as Router, Route, Link, Routes} from 'react-router-dom'
import logo from './logo.svg'
import './App.css'
import GreyProfile from './grey_profile.png'
import Back from './back.png'

const ITEMS_URL = 'http://192.168.199.102:4567/items.json'

/**
 * urlBase64ToUint8Array
 *
 * @param {string} base64String a public vavid key
 */
function urlBase64ToUint8Array(base64String) {
  var padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  var base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')

  var rawData = window.atob(base64)
  var outputArray = new Uint8Array(rawData.length)

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

const Profile = () => {
  const [image, setImage] = React.useState(null)
  const [isCameraEnabled, setIsCameraEnabled] = React.useState(false)

  const doesSupportCamera = React.useRef('mediaDevices' in navigator)
  const videoRef = React.useRef(null)
  const canvasRef = React.useRef(null)

  React.useEffect(() => {
    if (isCameraEnabled && videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({video: true})
        .then((stream) => (videoRef.current.srcObject = stream))
    }
  }, [isCameraEnabled, videoRef])

  const onPushMessage = () => {
    global.registration.showNotification('Test Message', {
      icon: '/icon-120.png',
      body: 'Success!',
    })
  }

  const onSubscribe = () => {
    const key =
      'BClkWYXjylL583hsafMJAKvIexe3t7ut5WlNCe-YhPCMUDt1IskA7JXeZxoWhdJN9CBc4sgiD226DzCA0w8invM'
    global.registration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      })
      .then((subscribe) => console.log('Subscribed!'))
      .catch((error) => console.log('Failed to subscribe.'))
  }

  const onToggleCamera = () => {
    setIsCameraEnabled(!isCameraEnabled)
  }

  const onTakeImage = () => {
    const canvas = canvasRef.current
    const video = videoRef.current

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas
      .getContext('2d')
      .drawImage(video, 0, 0, video.videoWidth, video.videoHeight)

    video.srcObject.getVideoTracks().forEach((track) => track.stop())
    setImage(canvas.toDataURL())
    setIsCameraEnabled(false)
  }

  return (
    <div>
      <nav className="navbar navbar-light bg-light">
        <span className="navbar-brand mb-0 h1">
          <Link to="/">
            <img src={Back} alt="logo" style={{height: 30}} />
          </Link>
          Profile
        </span>
      </nav>

      <div style={{textAlign: 'center'}}>
        <img
          src={image ?? GreyProfile}
          alt="profile"
          style={{height: 200, marginTop: 50}}
        />
        <p style={{color: '#888', fontSize: 20}}>username</p>

        {isCameraEnabled ? (
          <div>
            <video
              ref={videoRef}
              controls={false}
              autoPlay
              style={{width: '100%', maxWidth: 300}}></video>
            <br />
            <button onClick={onTakeImage}>Take Image</button>
            <canvas ref={canvasRef} style={{display: 'none'}} />
          </div>
        ) : null}

        <br />
        {doesSupportCamera.current ? (
          <button onClick={onToggleCamera}>Toggle Camera</button>
        ) : null}
        <br />
        <button onClick={onSubscribe}>Subscribe for Notifications</button>
        <br />
        <button onClick={onPushMessage}>Test Push Message</button>
      </div>
    </div>
  )
}

function List() {
  const [items, setItems] = React.useState([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [todoItem, setTodoItem] = React.useState('')
  // navigator.onLine indicates the presence of a network connection, not a server connection
  const [isOffline, setIsOffline] = React.useState(!navigator.onLine)

  React.useEffect(() => {
    fetch(ITEMS_URL)
      .then((response) => response.json())
      .then((items) => {
        setItems(items)
        setIsLoading(false)
      })

    window.addEventListener('online', updateIsOffline)
    window.addEventListener('offline', updateIsOffline)
    return () => {
      window.removeEventListener('online', updateIsOffline)
      window.removeEventListener('offline', updateIsOffline)
    }
  }, [])

  const updateIsOffline = () => setIsOffline(!navigator.onLine)

  const addItem = (e) => {
    e.preventDefault()

    fetch(ITEMS_URL, {
      method: 'POST',
      body: JSON.stringify({item: todoItem}),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((items) => {
        if (items.error) {
          alert(items.error)
        } else {
          setItems(items)
        }
      })

    setTodoItem('')
  }

  const deleteItem = (itemId) => {
    fetch(ITEMS_URL, {
      method: 'DELETE',
      body: JSON.stringify({id: itemId}),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((items) => {
        if (items.error) {
          alert(items.error)
        } else {
          setItems(items)
        }
      })
  }
  return (
    <div className="App">
      <nav className="navbar navbar-light bg-light">
        <span className="navbar-brand mb-0 h1">
          <img src={logo} className="App-logo col-3" alt="logo" />
          PWA Todo List
        </span>
        {isOffline ? (
          <span className="badge badge-danger my-3">Offline</span>
        ) : null}
        <span>
          <Link to="/profile">Profile</Link>
        </span>
      </nav>

      <div className="px-3 py-2">
        <form className="form-inline my-3" onSubmit={addItem}>
          <div className="form-group mb-2 p-0 pr-3 col-8 col-sm-10">
            <input
              className="form-control col-12"
              placeholder="What do you need to do?"
              value={todoItem}
              onChange={(e) => setTodoItem(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary mb-2 col-4 col-sm-2">
            Add
          </button>
        </form>

        {isLoading ? <p>Loading...</p> : null}

        {!isLoading && items.length === 0 && (
          <div className="alert alert-secondary">No items - all done!</div>
        )}

        {!isLoading && items && (
          <table className="table table-striped">
            <tbody>
              {items.map((item, i) => {
                return (
                  <tr key={item.id} className="row">
                    <td className="col-1">{i + 1}</td>
                    <td className="col-10">{item.item}</td>
                    <td className="col-1">
                      <button
                        type="button"
                        className="close"
                        aria-label="Close"
                        onClick={() => deleteItem(item.id)}>
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<List />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
