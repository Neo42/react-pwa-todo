/* eslint-disable no-restricted-globals */

// This service worker can be customized!
// See https://developers.google.com/web/tools/workbox/modules
// for the list of available Workbox modules, or add any other
// code you'd like.
// You can also remove this file if you'd prefer not to use a
// service worker, and the Workbox build step will be skipped.

// import {createInstance} from 'localforage'
import {clientsClaim, skipWaiting} from 'workbox-core'
import {precacheAndRoute} from 'workbox-precaching'
import {registerRoute} from 'workbox-routing'
import {
  CacheFirst,
  NetworkFirst,
  StaleWhileRevalidate,
} from 'workbox-strategies'

// const itemStore = createInstance({
//   name: 'pwa-todo-app',
//   storeName: 'items',
// })
// const inputStore = createInstance({
//   name: 'pwa-todo-app',
//   storeName: 'input',
// })

skipWaiting()
clientsClaim()

// // these two events will only be fired on the first initialization
// // self.addEventListener('install', (event) => {
// const asyncInstall = new Promise((resolve) => {
//   console.log('Waiting to resolve...')
//   setTimeout(resolve, 5000)
// })
// // the awaited promise has to be settled eventually
// // otherwise the wait before installation will last forever
// event.waitUntil(asyncInstall)
// })

self.addEventListener('activate', (event) => {
  console.log('activate')
})

// make cdn resources available by using service worker cache without browser cache disabled during downtime
registerRoute(
  new RegExp('https:.*min.(css|js)'),
  new StaleWhileRevalidate({cacheName: 'cdn-cache'}), // cache first & also request latest in the background
)

// cache response from server
registerRoute(
  new RegExp('http://.*:4567.*.json'),
  new NetworkFirst({cacheName: 'server-cache'}),
)

// alert for offline POST requests
addEventListener('fetch', (event) => {
  if (event.request.method === 'POST' || event.request.method === 'DELETE') {
    event.respondWith(
      fetch(event.request).catch(
        (error) =>
          new Response(
            JSON.stringify({
              error: 'This action is disabled while the app is offline.',
            }),
            {headers: {'Content-Type': 'application/json'}},
          ),
      ),
    )
  }
  // localforage with server data routed to cache
  // if (event.request.url.includes('items.json')) {
  //   event.respondWith(
  //     (async function () {
  //       const response = await fetch(event.request)
  //       let data = await response.clone().json()
  //       console.log(data)
  //       // if (data.items.length > 0) {
  //       //   data.items.forEach(({id, item}) => itemStore.setItem(id, item))
  //       // }
  //       // return response
  //     })(),
  //   )
  // }
})

self.addEventListener('push', (event) => {
  event.waitUntil(
    self.registration.showNotification('Todo List', {
      icon: '/icon-120.png',
      body: event.data.text(),
    }),
  )
})

precacheAndRoute(self.__WB_MANIFEST || [])
