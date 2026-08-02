migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('tasks')
    col.fields.removeByName('status')
    col.fields.add(
      new SelectField({
        name: 'status',
        required: true,
        values: [
          'pendente',
          'em_andamento',
          'aguardando_contato',
          'aguardando_suporte',
          'concluida',
          'cancelada',
        ],
        maxSelect: 1,
      }),
    )
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('tasks')
    col.fields.removeByName('status')
    col.fields.add(
      new SelectField({
        name: 'status',
        required: true,
        values: ['pendente', 'em_andamento', 'concluida', 'cancelada'],
        maxSelect: 1,
      }),
    )
    app.save(col)
  },
)
