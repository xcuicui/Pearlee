function isObject(v) {
  return v && typeof v === 'object' && !Array.isArray(v)
}

function formatTemplate(str, params) {
  const p = isObject(params) ? params : {}
  return String(str || '').replace(/\{(\w+)\}/g, (_, k) => {
    const v = p[k]
    return (v === undefined || v === null) ? '' : String(v)
  })
}

// Centralized UI strings (CN only, no external i18n dependency)
// Rule: pages MUST reference keys from this map, no scattered hard-coded copy.
const STRINGS = {
  // Home
  HOME_STREAK: '最近 {N} 天都有记录',
  HOME_WEEK_TODAY: '今天',
  HOME_EMOTION_EMPTY_TIME: '现在',
  HOME_EMOTION_EMPTY_TEXT: '写一句给对方的话吧。',
  HOME_EMOTION_FROM_US: '来自你们',
  HOME_EMOTION_FROM_PARTNER_MURMUR: '来自 {TaNickname} 的碎碎念',
  HOME_EMOTION_FROM_ME_MURMUR: '我写给 {TaNickname} 的碎碎念',
  FAB_MURMUR_ENTRY_NAME: '想你的碎碎念',

  // Composer
  COMPOSER_SUBTITLE_BOX: '{MyNickname} 的碎碎念收纳处',
  COMPOSER_HINT_LINE: '把想到你的那一刻，放进这里。',
  COMPOSER_PLACEHOLDER: '想到你时的碎碎念…',
  COMPOSER_ADD_PHOTO: '+ 添一张照片',
  COMPOSER_SUBMIT: '收好',

  // Day detail
  DAY_COMMENT_TAG: '碎碎念',
  DAY_COMMENT_PLACEHOLDER: '想到你，就写一句…',
  DAY_COMMENT_SUBMIT: '回一句',
  DAY_LOAD_MORE: '加载更多',
  DAY_LOADING: '加载中…',
  DAY_EMPTY: '这一天还没有记录。',

  // Settings
  SETTINGS_TITLE_REL: '关系设置',
  SETTINGS_LABEL_NICKNAME: '在这段关系里的名字',
  SETTINGS_NICKNAME_PLACEHOLDER: '例如：小猫',
  SETTINGS_LABEL_START_DATE: '开始日期',
  SETTINGS_DATE_PICK_PLACEHOLDER: '请选择',
  SETTINGS_SAVE: '保存',

  SETTINGS_TITLE_INVITE: '邀请对方',
  SETTINGS_INVITE_DESC: '把邀请码发给对方，对方在“加入关系”里输入即可。',
  SETTINGS_COPY_CODE: '复制邀请码',
  SETTINGS_GO_JOIN: '加入关系',
  SETTINGS_ARCHIVE: '解除关系（封存）',
  SETTINGS_ARCHIVE_MODAL_TITLE: '解除关系',
  SETTINGS_ARCHIVE_MODAL_CONTENT: '将封存关系，不删除历史记录，但不可继续发布。确定吗？',
  SETTINGS_ARCHIVE_CONFIRM: '封存',

  // Relationship
  REL_CREATE_TITLE: '建立小世界',
  REL_CREATE_REL_NAME: '关系名称',
  REL_CREATE_REL_NAME_PLACEHOLDER: '我们',
  REL_CREATE_NICKNAME_ASK: '你希望 TA 在这里怎么称呼你？',
  REL_CREATE_NICKNAME_PLACEHOLDER: '1-10字，不含表情',
  REL_CREATE_START_DATE: '开始日期',
  REL_CREATE_DATE_PICK_PLACEHOLDER: '请选择',
  REL_CREATE_SUBMIT: '创建关系',
  REL_CREATE_HAVE_CODE: '我有邀请码',

  REL_JOIN_TITLE: '加入对方的小世界',
  REL_JOIN_DESC: '输入邀请码即可加入。',
  REL_JOIN_CODE_PLACEHOLDER: '邀请码',
  REL_JOIN_SUBMIT: '加入',
  REL_JOIN_BACK: '返回',

  REL_ERR_NICKNAME_REQUIRED: '请填写你在这段关系里的名字',
  REL_ERR_NICKNAME_TOO_LONG: '昵称最多 10 个字',
  REL_ERR_NICKNAME_PLACEHOLDER: '昵称不能使用占位词',
  REL_ERR_NICKNAME_EMOJI: '昵称不能包含表情符号',
  REL_LOADING_CREATING: '创建中',
  REL_ERR_CREATE_FAIL: '创建失败',

  REL_JOIN_ERR_CODE_REQUIRED: '请输入邀请码',
  REL_JOIN_LOADING: '加入中',
  REL_JOIN_ERR_FAIL: '加入失败'
}

function t(key, params) {
  const raw = STRINGS[key]
  if (typeof raw === 'function') return raw(params || {})
  return formatTemplate(raw, params)
}

module.exports = { STRINGS, t, formatTemplate }
