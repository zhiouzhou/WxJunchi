// pages/homePage/information.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    infoUrl:``,
    actId:``,
    access_token:``,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.infoUrl)
    console.log(options.actId)
    let access_token = wx.getStorageSync(`access_token`)
    console.log(access_token)
    console.log(decodeURIComponent(options.infoUrl))
    this.setData({ infoUrl: decodeURIComponent(options.infoUrl), access_token, actId: options.actId?options.actId:''})
  },

  
})