const { envId } = require('./env')

App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('当前基础库不支持 wx.cloud')
      return
    }

    wx.cloud.init({
      env: envId,
      traceUser: true
    })
  }
})
