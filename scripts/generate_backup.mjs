import fs from 'fs'
import path from 'path'

// Lista de arquivos a incluir no backup consolidado
export const filesToInclude = [
  // 1. Configurações & Documentação da Raiz
  'CLAUDE.md',
  'README.md',
  'package.json',
  'vite.config.ts',
  'tailwind.config.ts',
  'tsconfig.json',
  'tsconfig.app.json',
  'tsconfig.node.json',
  'postcss.config.js',
  'components.json',
  'index.html',
  '.oxlintrc.json',
  '.oxfmtrc.json',
  '.gitignore',
  '.npmrc',
  '.skip.config.json',
  'vite-plugin-react-uid.js',

  // 2. PocketBase Hooks
  'pocketbase/hooks/crm_add_from_chat.js',
  'pocketbase/hooks/cron_backfill_conversation_timestamps.js',
  'pocketbase/hooks/cron_enrich_conversations.js',
  'pocketbase/hooks/cron_finish_stale_imports.js',
  'pocketbase/hooks/on_user_signup.js',
  'pocketbase/hooks/team_create_member.js',
  'pocketbase/hooks/team_invite.js',
  'pocketbase/hooks/team_leave.js',
  'pocketbase/hooks/team_members.js',
  'pocketbase/hooks/team_remove.js',
  'pocketbase/hooks/whatsapp_ai_response.js',
  'pocketbase/hooks/whatsapp_archive_conversation.js',
  'pocketbase/hooks/whatsapp_backfill_timestamps.js',
  'pocketbase/hooks/whatsapp_create.js',
  'pocketbase/hooks/whatsapp_debug_webhook.js',
  'pocketbase/hooks/whatsapp_disconnect.js',
  'pocketbase/hooks/whatsapp_factory_reset.js',
  'pocketbase/hooks/whatsapp_link_preview.js',
  'pocketbase/hooks/whatsapp_reimport_history.js',
  'pocketbase/hooks/whatsapp_send_media.js',
  'pocketbase/hooks/whatsapp_send_message.js',
  'pocketbase/hooks/whatsapp_status.js',
  'pocketbase/hooks/whatsapp_sync_all_conversations.js',
  'pocketbase/hooks/whatsapp_sync_conversation.js',
  'pocketbase/hooks/whatsapp_update_contact_name.js',
  'pocketbase/hooks/whatsapp_webhook.js',

  // 3. PocketBase Migrations
  'pocketbase/migrations/0001_create_whatsapp_collections.js',
  'pocketbase/migrations/0002_seed_data.js',
  'pocketbase/migrations/0003_add_message_participant.js',
  'pocketbase/migrations/0004_add_media_fields.js',
  'pocketbase/migrations/0005_add_conv_picture_sync.js',
  'pocketbase/migrations/0006_add_message_reactions.js',
  'pocketbase/migrations/0007_add_link_preview.js',
  'pocketbase/migrations/0008_add_group_size.js',
  'pocketbase/migrations/0009_fix_timestamps.js',
  'pocketbase/migrations/0010_add_enrich_debug.js',
  'pocketbase/migrations/0011_create_mark_read_queue.js',
  'pocketbase/migrations/0012_mark_read_queue_csv.js',
  'pocketbase/migrations/0013_create_crm_contacts.js',
  'pocketbase/migrations/0014_history_sync_fields.js',
  'pocketbase/migrations/0015_qrcode_cache.js',
  'pocketbase/migrations/0016_history_import_progress.js',
  'pocketbase/migrations/0017_last_message_timestamp.js',
  'pocketbase/migrations/0018_backfill_last_message_timestamp.js',
  'pocketbase/migrations/0019_sync_period_days.js',
  'pocketbase/migrations/0020_fix_qrcode_field_max.js',
  'pocketbase/migrations/0021_qrcode_field_explicit_max.js',
  'pocketbase/migrations/0022_add_archived_to_conversations.js',
  'pocketbase/migrations/0023_cleanup_self_contact_names.js',
  'pocketbase/migrations/0024_create_crm_companies.js',
  'pocketbase/migrations/0025_seed_admin_user.js',
  'pocketbase/migrations/0026_create_ai_agents.js',
  'pocketbase/migrations/0027_ai_response_fields.js',
  'pocketbase/migrations/0028_cleanup_stale_ai_responses.js',
  'pocketbase/migrations/0029_core_structure.js',
  'pocketbase/migrations/0030_crm_feature.js',
  'pocketbase/migrations/0031_ai_feature.js',
  'pocketbase/migrations/0032_system_seeds.js',
  'pocketbase/migrations/0033_system_seeds.js',
  'pocketbase/migrations/0034_create_whatsapp_collections.js',
  'pocketbase/migrations/0035_create_crm_contacts.js',
  'pocketbase/migrations/0036_create_crm_companies.js',
  'pocketbase/migrations/0037_create_ai_agents.js',
  'pocketbase/migrations/0038_core_structure.js',
  'pocketbase/migrations/0039_crm_feature.js',
  'pocketbase/migrations/0040_ai_feature.js',
  'pocketbase/migrations/0041_system_seeds.js',
  'pocketbase/migrations/0042_create_tasks.js',
  'pocketbase/migrations/0043_create_accounts_and_migrate.js',
  'pocketbase/migrations/0044_update_api_rules_for_accounts.js',
  'pocketbase/migrations/0046_add_assigned_to.js',
  'pocketbase/migrations/0047_repopulate_orphan_account_ids.js',
  'pocketbase/migrations/0048_create_categories.js',
  'pocketbase/migrations/0049_update_qrcode_max_constraint.js',
  'pocketbase/migrations/0050_update_qrcode_max_constraint_v2.js',
  'pocketbase/migrations/0051_update_ai_agents_schema.js',
  'pocketbase/migrations/0052_define_whatsapp_agent.js',
  'pocketbase/migrations/0053_add_ai_conversation_id.js',
  'pocketbase/migrations/0054_create_crm_stages.js',
  'pocketbase/migrations/0059_add_task_statuses.js',
  'pocketbase/migrations/0060_increase_system_prompt_max.js',
  'pocketbase/migrations/0061_increase_system_prompt_to_10000.js',
  'pocketbase/migrations/0062_add_default_ai_agent_id.js',
  'pocketbase/migrations/0063_increase_system_prompt_to_20000.js',

  // 4. Frontend - Types & Stores & Services
  'src/types/models.ts',
  'src/stores/useAppStore.tsx',
  'src/services/ai_agents.ts',
  'src/services/categories.ts',
  'src/services/crm_companies_service.ts',
  'src/services/crm_service.ts',
  'src/services/crm_stages_service.ts',
  'src/services/tasks.ts',
  'src/services/team.ts',
  'src/services/whatsapp_service.ts',

  // 5. Frontend - Libs & Hooks
  'src/lib/colors.ts',
  'src/lib/format-time.ts',
  'src/lib/mock-data.ts',
  'src/lib/skipAi.ts',
  'src/lib/skipConnectors.ts',
  'src/lib/stage-colors.ts',
  'src/lib/task-meta.ts',
  'src/lib/utils.ts',
  'src/lib/whatsapp-mappers.ts',
  'src/lib/pocketbase/client.ts',
  'src/lib/pocketbase/errors.ts',
  'src/lib/pocketbase/schema.json',
  'src/hooks/use-auth.tsx',
  'src/hooks/use-categories.ts',
  'src/hooks/use-crm-companies.ts',
  'src/hooks/use-crm-stages.ts',
  'src/hooks/use-crm.ts',
  'src/hooks/use-current-account.ts',
  'src/hooks/use-history-sync.ts',
  'src/hooks/use-link-preview.ts',
  'src/hooks/use-long-press.ts',
  'src/hooks/use-mobile.tsx',
  'src/hooks/use-qr-connection.ts',
  'src/hooks/use-realtime.ts',
  'src/hooks/use-tasks.ts',
  'src/hooks/use-team-members.ts',
  'src/hooks/use-toast.ts',
  'src/hooks/use-whatsapp.ts',

  // 6. Frontend - Entry & Pages & Components
  'src/main.tsx',
  'src/main.css',
  'src/vite-env.d.ts',
  'src/App.tsx',
  'src/components/Layout.tsx',
  'src/components/TaskViewDialog.tsx',
  'src/components/agentes/AgenteCard.tsx',
  'src/components/agentes/AgenteFormDialog.tsx',
  'src/components/categories/CategoriesSheet.tsx',
  'src/components/categories/CategoryPicker.tsx',
  'src/components/chat/AgenteConversaToggle.tsx',
  'src/components/chat/ChatArea.tsx',
  'src/components/chat/ChatList.tsx',
  'src/components/chat/ImportProgressBanner.tsx',
  'src/components/chat/TaskActionBar.tsx',
  'src/components/chat/TaskFormDialog.tsx',
  'src/components/chat/TaskViewDialog.tsx',
  'src/components/crm/AddToCrmDialog.tsx',
  'src/components/crm/CompanyAutocomplete.tsx',
  'src/components/crm/ContactTaskCarousel.tsx',
  'src/components/crm/ContactTaskCarouselInline.tsx',
  'src/components/crm/CrmCompaniesList.tsx',
  'src/components/crm/CrmCompanyDetail.tsx',
  'src/components/crm/CrmContactDetail.tsx',
  'src/components/crm/CrmPipelineBoard.tsx',
  'src/components/crm/PipelineEditorSheet.tsx',
  'src/components/skip/ConnectorButton.tsx',
  'src/pages/Agentes.tsx',
  'src/pages/CRM.tsx',
  'src/pages/Conversas.tsx',
  'src/pages/Equipe.tsx',
  'src/pages/Home.tsx',
  'src/pages/Index.tsx',
  'src/pages/NotFound.tsx',
  'src/pages/Tarefas.tsx',

  // 7. UI Components (shadcn)
  'src/components/ui/accordion.tsx',
  'src/components/ui/alert-dialog.tsx',
  'src/components/ui/alert.tsx',
  'src/components/ui/aspect-ratio.tsx',
  'src/components/ui/avatar.tsx',
  'src/components/ui/badge.tsx',
  'src/components/ui/breadcrumb.tsx',
  'src/components/ui/button.tsx',
  'src/components/ui/calendar.tsx',
  'src/components/ui/card.tsx',
  'src/components/ui/carousel.tsx',
  'src/components/ui/chart.tsx',
  'src/components/ui/checkbox.tsx',
  'src/components/ui/collapsible.tsx',
  'src/components/ui/command.tsx',
  'src/components/ui/context-menu.tsx',
  'src/components/ui/dialog.tsx',
  'src/components/ui/drawer.tsx',
  'src/components/ui/dropdown-menu.tsx',
  'src/components/ui/form.tsx',
  'src/components/ui/hover-card.tsx',
  'src/components/ui/input-otp.tsx',
  'src/components/ui/input.tsx',
  'src/components/ui/label.tsx',
  'src/components/ui/menubar.tsx',
  'src/components/ui/navigation-menu.tsx',
  'src/components/ui/pagination.tsx',
  'src/components/ui/popover.tsx',
  'src/components/ui/progress.tsx',
  'src/components/ui/radio-group.tsx',
  'src/components/ui/resizable.tsx',
  'src/components/ui/scroll-area.tsx',
  'src/components/ui/select.tsx',
  'src/components/ui/separator.tsx',
  'src/components/ui/sheet.tsx',
  'src/components/ui/sidebar.tsx',
  'src/components/ui/skeleton.tsx',
  'src/components/ui/slider.tsx',
  'src/components/ui/sonner.css',
  'src/components/ui/sonner.tsx',
  'src/components/ui/switch.tsx',
  'src/components/ui/table.tsx',
  'src/components/ui/tabs.tsx',
  'src/components/ui/textarea.tsx',
  'src/components/ui/toast.tsx',
  'src/components/ui/toaster.tsx',
  'src/components/ui/toggle-group.tsx',
  'src/components/ui/toggle.tsx',
  'src/components/ui/tooltip.tsx',
  'src/components/ui/use-toast.ts',
]

export function buildBackupText(rootDir = process.cwd(), options = {}) {
  const now = options.fixedDate ? new Date(options.fixedDate) : new Date()
  const dateFormatted = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC'

  const validFiles = []
  for (const relPath of filesToInclude) {
    const fullPath = path.resolve(rootDir, relPath)
    if (fs.existsSync(fullPath)) {
      validFiles.push(relPath)
    } else {
      console.warn('Arquivo não encontrado:', relPath)
    }
  }

  const header = `================================================================
BACKUP CONSOLIDADO DO CÓDIGO-FONTE DO PROJETO
Projeto: Atendimento no WhatsApp com IA (Skip Agentes) Clone
Data de Geração: ${dateFormatted}
Total de Arquivos Catalogados: ${validFiles.length} arquivos
Ambiente: React + TypeScript + Vite + TailwindCSS + PocketBase (Skip Cloud)
================================================================

ÍNDICE DE ARQUIVOS INCLUÍDOS NESTE BACKUP:
${validFiles.map((f, i) => `${String(i + 1).padStart(3, ' ')}. ${f}`).join('\n')}

================================================================
CONTEÚDO INTEGRAL DOS ARQUIVOS
================================================================
`

  const parts = [header]

  for (const relPath of validFiles) {
    parts.push(`\n===== ARQUIVO: ${relPath} =====\n`)
    const fullPath = path.resolve(rootDir, relPath)
    const content = fs.readFileSync(fullPath, 'utf8')
    parts.push(content)
    if (!content.endsWith('\n')) {
      parts.push('\n')
    }
  }

  parts.push(`\n================================================================\n`)
  parts.push(`FIM DO BACKUP CONSOLIDADO (${validFiles.length} ARQUIVOS)\n`)
  parts.push(`================================================================\n`)

  const fullContent = parts.join('')
  return {
    fullContent,
    validFiles,
  }
}

export function generateBackup(options = {}) {
  const rootDir = options.rootDir || process.cwd()
  const docsDir = path.resolve(rootDir, 'docs')
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true })
  }

  const outPath = path.resolve(rootDir, 'docs/backup-codigo-completo.txt')
  const { fullContent, validFiles } = buildBackupText(rootDir, options)
  fs.writeFileSync(outPath, fullContent, 'utf8')

  console.log(`Backup gerado com sucesso em ${outPath}`)
  console.log(`Total de arquivos: ${validFiles.length}`)
  const stats = fs.statSync(outPath)
  console.log(
    `Tamanho do arquivo: ${(stats.size / 1024 / 1024).toFixed(2)} MB (${stats.size} bytes)`,
  )

  return {
    outPath,
    totalFiles: validFiles.length,
    size: stats.size,
    content: fullContent,
  }
}

// Execução direta via Node.js
if (process.argv[1] && process.argv[1].endsWith('generate_backup.mjs')) {
  generateBackup()
}
