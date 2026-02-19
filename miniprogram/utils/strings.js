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
  REL_JOIN_ERR_FAIL: '加入失败',

  // Rewards (Shells / Tickets / Lottery / Coupons)
  REWARDS_SHELLS: '贝壳',
  REWARDS_TICKETS: '抽奖券',
  REWARDS_COUPON: '小心愿券',
  REWARDS_TAB_LOTTERY: '抽奖',
  REWARDS_WALLET: '我的券包',

  REWARDS_CHECKIN_CTA: '想念打卡',
  REWARDS_CHECKIN_DONE: '今天已想你',
  REWARDS_CHECKIN_TOAST_OK: '今天的想念已收纳 +3 贝壳',

  REWARDS_EXCHANGE: '兑换',
  REWARDS_EXCHANGE_TOAST_OK: '已收好 1 张抽奖券',
  REWARDS_EXCHANGE_TOAST_FAIL_POINTS: '贝壳不够啦，先攒一点再来。',

  REWARDS_DRAW_ONCE: '抽一次',
  REWARDS_DRAW_OPEN_GIFT: '打开一份小礼物',
  REWARDS_DRAW_COST_ONE_TICKET: '消耗 1 张小礼物券',
  REWARDS_DRAW_DISABLED_HINT: '先去兑换抽奖券',
  REWARDS_DRAW_RESULT_TITLE: '收到了一个小心愿',
  REWARDS_DRAW_RESULT_CONFIRM: '收好',

  REWARDS_EARN_TOAST_OK: '收纳成功 +{N} 贝壳',

  REWARDS_LOTTERY_TITLE: '小礼物橱窗',
  REWARDS_LOTTERY_SUBTITLE: '偶尔为彼此准备一点小惊喜。',
  REWARDS_LOTTERY_ASSETS_LINE: '你有 {points} 枚贝壳  {tickets} 张小礼物券',
  REWARDS_DRAW_ASSETS_RULE_LINE: '你有 {points} 枚贝壳，抽小礼物一次消耗 1 枚贝壳',
  REWARDS_DRAW_PRIMARY_CTA: '打开一份小礼物',
  REWARDS_DRAW_UNDER_COST: '消耗 1 枚贝壳',
  REWARDS_DRAW_UNDER_INSUFFICIENT: '贝壳不够啦，先去收纳一点想念。',
  REWARDS_DRAW_POCKET_TITLE: '口袋里的小礼物',
  REWARDS_DRAW_POCKET_EMPTY: '还没有收到小礼物',
  REWARDS_DRAW_POCKET_VIEW_ALL: '查看全部',
  REWARDS_DRAW_WINDOW_LINK: '查看小礼物橱窗',
  REWARDS_WINDOW_TITLE: '小礼物橱窗',
  REWARDS_WINDOW_SUBTITLE: '这里是所有可能出现的小礼物。',
  REWARDS_POOL_TITLE: '橱窗里的小礼物',
  REWARDS_RARITY_COMMON: '常见',
  REWARDS_RARITY_OCCASIONAL: '偶尔',
  REWARDS_RARITY_RARE: '稀有',
  REWARDS_CEREMONY_TOP_TEXT: '你打开了一份小礼物',
  REWARDS_CEREMONY_CONFIRM: '收进礼物盒',
  REWARDS_CEREMONY_USED_ONE_TICKET: '已使用 1 张小礼物券',
  REWARDS_RESULT_TITLE: '你打开了一份小礼物',
  REWARDS_RESULT_CONFIRM: '收进口袋',
  REWARDS_RESULT_FOOTER: '已消耗 1 枚贝壳',
  REWARDS_WALLET_ENTRY: '去券包看看',
  REWARDS_WALLET_EMPTY: '小心愿券暂时还没有。',

  REWARDS_PRIZE_COFFEE_TITLE: '咖啡券',
  REWARDS_PRIZE_COFFEE_DESC: '想你时，给你买一杯咖啡。',
  REWARDS_PRIZE_MILK_TEA_TITLE: '奶茶券',
  REWARDS_PRIZE_MILK_TEA_DESC: '把甜甜的那口，也收纳给你。',
  REWARDS_PRIZE_HANGOUT_TITLE: '陪逛街券',
  REWARDS_PRIZE_HANGOUT_DESC: '一起慢慢走，什么都不急。',
  REWARDS_PRIZE_PLAY_TITLE: '陪玩券',
  REWARDS_PRIZE_PLAY_DESC: '陪你玩一局（或你想玩的任何事）。',
  REWARDS_PRIZE_SING_TITLE: '唱歌券',
  REWARDS_PRIZE_SING_DESC: '给你唱一首歌，唱到你开心。',
  REWARDS_PRIZE_WISH_TITLE: '小愿望满足券',
  REWARDS_PRIZE_WISH_DESC: '一个小愿望，我来认真听。',
  REWARDS_PRIZE_HUG_TITLE: '抱抱券',
  REWARDS_PRIZE_HUG_DESC: '给你一个抱抱（可随时兑换）。',

  REWARDS_MARK_USED: '标记为已使用',
  REWARDS_USED: '已使用',
  REWARDS_UNUSED: '未使用',
  REWARDS_USE_CONFIRM_TITLE: '确认收纳',
  REWARDS_USE_CONFIRM_CONTENT: '要把这张小心愿券标记为已使用吗？',
  REWARDS_USE_CONFIRM_OK: '标记',
  REWARDS_USE_CONFIRM_CANCEL: '再等等'
}

function t(key, params) {
  const raw = STRINGS[key]
  if (typeof raw === 'function') return raw(params || {})
  return formatTemplate(raw, params)
}

module.exports = { STRINGS, t, formatTemplate }
