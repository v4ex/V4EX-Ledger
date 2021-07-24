import Controller from './controller.js'

// ============================================================================
// Ledger Controller

export default class LedgerController extends Controller {

  // OVERRIDE
  // PROVIDE 
  get canHandle() {
    if (this.url.pathname === '/ledger') {
      return true
    }
    return false
  }

  // OVERRIDDEN
  async handleRequest() {
    switch (this.method) {
      case 'GET': {
        if (this.$key) {
          return this.get()
        } else if (this.$list) {
          return this.list()
        }

        return new Response("Not Found", { status: 404 })

        break
      }
      case 'POST':
      case 'PUT': {
        return this.put()

        break
      }
    }
  }

  async list() {
    const values = await this.env.LEDGER.list({
      prefix: this.$list
    })

    return new Response(JSON.stringify(values), { status: 200 })
  }

  async get() {
    let errorInGettingValue
    const value = await this.env.LEDGER.get(this.$key, {type: 'text'}).catch(error => {
      errorInGettingValue = true
    })
    if (errorInGettingValue) {
      return new Response("Server Internal Error", { status: 500 })
    }

    return new Response(value, { status: 200 })
  }

  async put() {
    // In theory, can handle infinite transactions per millisecond just by adding more writers.
    const id = this.env.LEDGER_WRITER.idFromName('0')
    const stub = this.env.LEDGER_WRITER.get(id)
    const request = new Request(this.request, {
      headers: {
        id: '0'
      }
    })
    const response = await stub.fetch(request)
    const key = await response.text()

    return new Response(key, { status: 200 })
  }

}

// ============================================================================
// Ledger Writer
// Durable Object
// ENV LEDGER_WRITER
// TODO Chain Hash Metadata
// TODO Message signature metadata
// FIXME Remove counter

export class LedgerWriter {

  #id
  #counter = 0
  #counterPrefix
  #ledger

  // PROVIDE this.#ledger
  constructor(state, env){
    this.#id = state.id
    this.#ledger = env.LEDGER
  }

  // TODO Schema Validation
  async fetch(request) {
    this.#id = request.headers.get('id')
    const content = request.body
    const key = this.newKey

    await this.#ledger.put(key, content)

    return new Response(key)
  }

  // ==========================================================================
  // Make New Key

  // PROVIDE this.counter
  get counter() {
    return this.#counter++
  }

  // PROVIDE this.newKey
  get newKey() {
    const date = new Date
    const year = date.getUTCFullYear()
    const month = date.getUTCMonth()
    const day = date.getUTCDate()
    const hours = date.getUTCHours()
    const minutes = date.getUTCMinutes()
    const seconds = date.getUTCSeconds()
    const milliseconds = Date.now().toString().slice(10)
    const prefix = year.toString() + this.#padZero(month + 1) + this.#padZero(day) + this.#padZero(hours) + this.#padZero(minutes) + this.#padZero(seconds) + milliseconds

    // Reset counter for every millisecond
    if (this.#counterPrefix !== prefix) {
      this.#counterPrefix = prefix
      this.#counter = 0
    }

    return prefix + '/' + this.#id + '/' + this.counter
  }

  #padZero(number, size = 2) {
    number = number.toString();
    while (number.length < size) {
      number = '0' + number
    }

    return number
  }

}
