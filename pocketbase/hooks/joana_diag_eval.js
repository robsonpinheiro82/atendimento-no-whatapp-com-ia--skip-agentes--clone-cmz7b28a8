// TEMPORARY diagnostic route (read-only) — created by Joana to evaluate the RARO agent.
// Protected by a secret token; will be removed after the analysis.
routerAdd('GET', '/backend/v1/diag/agent-eval', (e) => {
  const token = e.request.header.get('X-Diag-Token') || ''
  if (!token || token !== $secrets.get('DIAG_TOKEN')) {
    return e.json(401, { error: 'unauthorized' })
  }

  const out = {}
  try {
    const raw = $ai
      .agent('whatsapp-manager')
      .listConversations({ user_id: 'oenuceq0hvpecdv', limit: 200 })
    out.raw_type = typeof raw
    out.raw_keys = raw ? Object.keys(raw) : null
    out.raw = raw
  } catch (err) {
    out.error = String(err)
  }
  return e.json(200, out)
})
