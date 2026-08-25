migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('ai_agents')
    col.fields.removeByName('system_prompt')
    col.fields.add(
      new TextField({
        name: 'system_prompt',
        required: true,
        max: 20000,
      }),
    )
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('ai_agents')
    col.fields.removeByName('system_prompt')
    col.fields.add(
      new TextField({
        name: 'system_prompt',
        required: true,
        max: 10000,
      }),
    )
    app.save(col)
  },
)
