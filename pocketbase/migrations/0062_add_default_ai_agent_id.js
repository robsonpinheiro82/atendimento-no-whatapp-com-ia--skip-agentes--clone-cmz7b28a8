migrate(
  (app) => {
    const instances = app.findCollectionByNameOrId('whatsapp_instances')
    const aiAgents = app.findCollectionByNameOrId('ai_agents')

    if (!instances.fields.getByName('default_ai_agent_id')) {
      instances.fields.add(
        new RelationField({
          name: 'default_ai_agent_id',
          type: 'relation',
          required: false,
          collectionId: aiAgents.id,
          cascadeDelete: false,
          maxSelect: 1,
        }),
      )
      app.save(instances)
    }

    // Buscar o agente "Assistente RARO"
    let raroAgent = null
    try {
      raroAgent = app.findFirstRecordByFilter('ai_agents', 'name = {:name}', {
        name: 'Assistente RARO',
      })
    } catch (_) {
      try {
        const allAgents = app.findRecordsByFilter('ai_agents', '', '-created', 1, 0)
        if (allAgents && allAgents.length > 0) {
          raroAgent = allAgents[0]
        }
      } catch (_) {}
    }

    if (raroAgent) {
      // Atualizar instâncias existentes com o default_ai_agent_id
      try {
        const instancesList = app.findRecordsByFilter('whatsapp_instances', '', '-created', 50, 0)
        for (const inst of instancesList) {
          if (!inst.getString('default_ai_agent_id')) {
            inst.set('default_ai_agent_id', raroAgent.id)
            app.save(inst)
          }
        }
      } catch (_) {}
    }
  },
  (app) => {
    const instances = app.findCollectionByNameOrId('whatsapp_instances')
    instances.fields.removeByName('default_ai_agent_id')
    app.save(instances)
  },
)
