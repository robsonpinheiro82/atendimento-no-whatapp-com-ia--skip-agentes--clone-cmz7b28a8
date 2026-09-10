// TEMPORARY diagnostic route (read-only) — created by Joana to evaluate the RARO agent.
// Protected by a secret token; will be removed after the analysis.
routerAdd('GET', '/backend/v1/diag/agent-eval', (e) => {
  const token = e.request.header.get('X-Diag-Token') || ''
  if (!token || token !== $secrets.get('DIAG_TOKEN')) {
    return e.json(401, { error: 'unauthorized' })
  }

  const out = { users: [], conversations: [] }

  try {
    const users = $app.findRecordsByFilter('users', '', '-created', 0, 0)
    for (const u of users) {
      out.users.push({ id: u.id, email: u.getString('email') })
    }
  } catch (err) {
    out.users_error = String(err)
  }

  for (const u of out.users) {
    try {
      const res = $ai.agent('whatsapp-manager').listConversations({ user_id: u.id, limit: 200 })
      const convs = res && res.conversations ? res.conversations : []
      for (const c of convs) {
        const entry = { id: c.id, user_email: u.email, updated: c.updated, messages: [] }
        try {
          const mres = $ai
            .agent('whatsapp-manager')
            .listMessages({ conversation_id: c.id, user_id: u.id, limit: 200 })
          const msgs = mres && mres.messages ? mres.messages : Array.isArray(mres) ? mres : []
          for (const m of msgs) {
            entry.messages.push({
              role: m.role,
              content: (m.content || '').substring(0, 4000),
              created: m.created,
            })
          }
        } catch (err) {
          entry.messages_error = String(err)
        }
        out.conversations.push(entry)
      }
    } catch (err) {
      out.conversations_error = String(err)
    }
  }

  return e.json(200, out)
})
