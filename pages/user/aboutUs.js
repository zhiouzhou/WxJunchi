// pages/user/aboutUs.js
const App = getApp()
const api = require('../../utils/NetWorkUtil.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  //跳转到相应网页
  gotoImageDetail(e) {
    console.log(e.currentTarget.dataset.infoUrl)
    let infoUrl = encodeURIComponent(e.currentTarget.dataset.infoUrl)
    App.WxService.navigateTo(App.Constants.Route.information, { infoUrl })
  },
})