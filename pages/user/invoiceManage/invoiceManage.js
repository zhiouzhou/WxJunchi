// pages/user/invoiceManage/invoiceManage.js
const App = getApp()
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
  navigatePage(e){
    let tag = e.currentTarget.dataset.tag
    App.WxService.navigateTo(App.Constants.Route[tag])
  }
})