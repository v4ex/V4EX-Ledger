// import DevController from './controllers/dev-controller.js'

import RootController from './controllers/root-controller.js'

import {default as LedgerController, LedgerWriter } from './controllers/ledger-controller.js'

export {
  LedgerWriter
}

// Default Handler class of "modules" format
export default {
  async fetch(request, env) {

    // ========================================================================
    // Handle dev request

    // const devController = new DevController(request, env)
    // if (devController.canHandle) {
    //   return devController.handleRequest()
    // }

    // ========================================================================
    // Handle Ledger request

    const ledgerController = new LedgerController(request, env)
    if (ledgerController.canHandle) {
      return ledgerController.handleRequest()
    }

    // ========================================================================
    // Handle root request
    
    const rootController = new RootController(request, env)
    if (rootController.canHandle) {
      return rootController.handleRequest()
    }

    // ========================================================================
    // Fallback

    return new Response("Not Found", { status: 404 })

  }
}
