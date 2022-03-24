import React from 'react'
import logo from './logo.svg'
import './App.css'

function App() {
  const [items, setItems] = React.useState([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [todoItem, setTodoItem] = React.useState('')
  // navigator.onLine indicates the presence of a network connection, not a server connection
  const [isOffline, setIsOffline] = React.useState(!navigator.onLine)

  React.useEffect(() => {
    fetch('http://localhost:4567/items.json')
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

    fetch('http://localhost:4567/items.json', {
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
    fetch('http://localhost:4567/items.json', {
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

export default App
