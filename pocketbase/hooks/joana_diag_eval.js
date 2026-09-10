// TEMPORARY diagnostic route (read-only) — created by Joana to evaluate the RARO agent.
// Protected by a secret token; will be removed after the analysis.
routerAdd('GET', '/backend/v1/diag/agent-eval', (e) => {
  const token = e.request.header.get('X-Diag-Token') || ''
  if (!token || token !== $secrets.get('DIAG_TOKEN')) {
    return e.json(401, { error: 'unauthorized' })
  }

  const out = { agents: [], conversations: [] }

  // 1) User agents (ai_agents collection) — the "Assistente RARO" prompt lives here
  try {
    const agents = $app.findRecordsByFilter('ai_agents', '', '-created', 0, 0)
    for (const a of agents) {
      out.agents.push({
        id: a.id,
        name: a.getString('name'),
        system_prompt: a.getString('system_prompt'),
        created: a.getDateTime('created').string(),
        updated: a.getDateTime('updated').string,
      })
    }
  } catch (err) {
    out.agents_error = String(err)
  }

  // 2) Hosted agent conversations (whatsapp-manager)
  try {
    const convs = $ai.agent('whatsapp-manager').listConversations({ limit: 200 })
    out.conversations = convs.map((c) => ({
      id: c.id,
      title: c.title,
      user_id: c.user_id,
      created: c.created,
      updated: c.updated,
    }))
  } catch (err) {
    out.conversations_error = String(err)
  }

  return e.json(200, out)
})
