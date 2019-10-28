// pages/homePage/activity.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    infoUrl: ``,
    actId: ``,
    access_token: ``,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.infoUrl)
    console.log(options.actId)
    let access_token = wx.getStorageSync(`access_token`)
    console.log(access_token)
    this.setData({ infoUrl: decodeURIComponent(options.infoUrl) || options.infoUrl, access_token, actId: options.actId ? options.actId : '' })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})