routerAdd(
  'POST',
  '/backend/v1/whatsapp/sync-all-conversations',
  (e) => {
    function tsToUnixSecondsSync(ts) {
      if (ts == null) return 0
      if (typeof ts === 'number') {
        if (!isFinite(ts) || ts <= 0) return 0
        return ts > 1e12 ? Math.floor(ts / 1000) : Math.floor(ts)
      }
      if (typeof ts === 'string') {
        const n = parseInt(ts, 10)
        if (!isFinite(n) || n <= 0) return 0
        return n > 1e12 ? Math.floor(n / 1000) : n
      }
      if (typeof ts === 'object') {
        if (typeof ts.low === 'number' && typeof ts.high === 'number') {
          const n = ts.high * 4294967296 + (ts.low >>> 0)
          if (!isFinite(n) || n <= 0) return 0
          return n > 1e12 ? Math.floor(n / 1000) : n
        }
        if (typeof ts.toNumber === 'function') {
          try {
            const n = ts.toNumber()
            if (typeof n === 'number' && isFinite(n) && n > 0) {
              return n > 1e12 ? Math.floor(n / 1000) : n
            }
          } catch (_) {}
        }
      }
      return 0
    }

    try {
      const authId = e.auth.id

      let accountId = ''
      try {
        const member = $app.findFirstRecordByFilter('account_members', 'user_id = {:userId}', {
          userId: authId,
        })
        accountId = member.getString('account_id')
      } catch (_) {
        return e.badRequestError('account_not_found')
      }

      if (!accountId) {
        return e.badRequestError('account_not_found')
      }

      let instances = []
      try {
        instances = $app.findRecordsByFilter(
          'whatsapp_instances',
          'account_id = {:accountId} && status = "connected"',
          '-created',
          10,
          0,
          { accountId },
        )
      } catch (_) {}

      if (!instances || instances.length === 0) {
        return e.json(400, { success: false, error: 'no_connected_instance' })
      }

      const instanceRecord = instances[0]
      const instanceName = instanceRecord.getString('instance_name')
      const instanceUserId = instanceRecord.getString('user_id')

      const urlStr = $secrets.get('EVOLUTION_API_URL') || ''
      const apiUrl = urlStr.endsWith('/') ? urlStr.slice(0, -1) : urlStr
      const apiKey = $secrets.get('EVOLUTION_API_KEY') || ''

      if (!apiUrl || !apiKey) {
        return e.json(500, { success: false, error: 'evolution_config_missing' })
      }

      let res
      try {
        res = $http.send({
          url: apiUrl + '/chat/findChats/' + instanceName,
          method: 'GET',
          headers: { apikey: apiKey },
          timeout: 30,
        })
      } catch (httpErr) {
        $app.logger().error('sync_all_convs_evolution_error', 'error', String(httpErr))
        return e.json(502, { success: false, error: 'evolution_request_failed' })
      }

      if (res.statusCode !== 200 && res.statusCode !== 201) {
        $app.logger().error('sync_all_convs_evolution_status', 'status', res.statusCode)
        return e.json(502, {
          success: false,
          error: 'evolution_returned_error',
          statusCode: res.statusCode,
        })
      }

      let allChats = []
      if (Array.isArray(res.json)) {
        allChats = res.json
      } else if (res.json && Array.isArray(res.json.chats)) {
        allChats = res.json.chats
      } else if (res.json && Array.isArray(res.json.records)) {
        allChats = res.json.records
      } else if (res.json && res.json.data && Array.isArray(res.json.data)) {
        allChats = res.json.data
      }

      let totalFound = allChats.length
      let alreadyExisted = 0
      let created = 0

      const convCol = $app.findCollectionByNameOrId('conversations')

      for (const chat of allChats) {
        try {
          const remoteJid = chat.remoteJid || chat.id || (chat.key && chat.key.remoteJid) || ''
          if (!remoteJid || remoteJid.length < 5) continue

          const isGroup = remoteJid.endsWith('@g.us')
          const pushName = chat.pushName || chat.name || chat.verifiedName || ''
          const phone = remoteJid.split('@')[0]

          let lastMsgText = ''
          let lastMsgTs = 0

          if (chat.lastMessage) {
            const lm = chat.lastMessage
            lastMsgTs = tsToUnixSecondsSync(lm.messageTimestamp)
            if (lm.message) {
              const msgKeys = Object.keys(lm.message)
              const typeKey = msgKeys.find(function (k) {
                return k !== 'messageContextInfo'
              })
              if (typeKey === 'conversation') {
                lastMsgText = lm.message.conversation || ''
              } else if (typeKey === 'extendedTextMessage') {
                lastMsgText =
                  (lm.message.extendedTextMessage && lm.message.extendedTextMessage.text) || ''
              } else if (
                typeKey &&
                [
                  'imageMessage',
                  'videoMessage',
                  'audioMessage',
                  'documentMessage',
                  'stickerMessage',
                ].indexOf(typeKey) !== -1
              ) {
                lastMsgText = (lm.message[typeKey] && lm.message[typeKey].caption) || '[Mídia]'
              } else if (typeKey) {
                lastMsgText = '[Mensagem]'
              }
            }
          }
          if (!lastMsgTs && chat.lastMessageTimestamp) {
            lastMsgTs = tsToUnixSecondsSync(chat.lastMessageTimestamp)
          }
          if (!lastMsgTs && chat.timestamp) {
            lastMsgTs = tsToUnixSecondsSync(chat.timestamp)
          }
          if (!lastMsgText) lastMsgText = 'Conversa sincronizada'
          if (!lastMsgTs) lastMsgTs = Math.floor(Date.now() / 1000)

          let convRecord = null
          try {
            convRecord = $app.findFirstRecordByFilter(
              'conversations',
              'remote_jid = {:jid} && instance_name = {:name} && account_id = {:accountId}',
              { jid: remoteJid, name: instanceName, accountId: accountId },
            )
          } catch (_) {}

          if (convRecord) {
            let updated = false
            if (pushName && !convRecord.getString('contact_name')) {
              convRecord.set('contact_name', pushName)
              updated = true
            }
            if (phone && !convRecord.getString('contact_phone')) {
              convRecord.set('contact_phone', phone)
              updated = true
            }
            if (isGroup && convRecord.getString('type') !== 'group') {
              convRecord.set('type', 'group')
              convRecord.set('is_group', true)
              updated = true
            } else if (!isGroup && convRecord.getString('type') !== 'individual') {
              convRecord.set('type', 'individual')
              convRecord.set('is_group', false)
              updated = true
            }
            if (!convRecord.getString('last_message')) {
              convRecord.set('last_message', lastMsgText)
              updated = true
            }
            if (
              (!convRecord.getInt('last_message_timestamp') ||
                convRecord.getInt('last_message_timestamp') === 0) &&
              lastMsgTs > 0
            ) {
              convRecord.set('last_message_timestamp', lastMsgTs)
              updated = true
            }
            if (updated) {
              $app.save(convRecord)
            }
            alreadyExisted++
          } else {
            const newConv = new Record(convCol)
            newConv.set('user_id', instanceUserId)
            newConv.set('account_id', accountId)
            newConv.set('instance_name', instanceName)
            newConv.set('remote_jid', remoteJid)
            newConv.set('is_group', isGroup)
            newConv.set('type', isGroup ? 'group' : 'individual')
            newConv.set('unread_count', chat.unreadCount || 0)
            newConv.set('last_message', lastMsgText)
            newConv.set('last_message_timestamp', lastMsgTs)
            if (pushName) newConv.set('contact_name', pushName)
            if (phone) newConv.set('contact_phone', phone)
            $app.save(newConv)
            created++
          }
        } catch (chatErr) {
          $app.logger().warn('sync_all_convs_chat_error', 'error', String(chatErr))
        }
      }

      $app
        .logger()
        .info(
          'sync_all_convs_done',
          'total',
          totalFound,
          'existed',
          alreadyExisted,
          'created',
          created,
        )

      return e.json(200, {
        success: true,
        total_found: totalFound,
        already_existed: alreadyExisted,
        created: created,
      })
    } catch (err) {
      $app.logger().error('sync_all_convs_fatal', 'error', String(err))
      return e.json(500, { success: false, error: 'internal_error' })
    }
  },
  $apis.requireAuth(),
)
