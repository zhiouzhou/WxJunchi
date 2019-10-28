// pages/message/message.js
const App = getApp()
const api = require('../../utils/NetWorkUtil.js')
import {
  $yjpToast
} from '../../components/yjp.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 1,
    size: 10,
    access_token: ``,
    windowHeight: 0,
    messageList: [],
    messageTwoList:[],
    isEmpty: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let access_token = wx.getStorageSync(`access_token`);
    const systemInfo = App.globalData.systemInfo;
    this.setData({ access_token, windowHeight: systemInfo.windowHeight })
    this.getMessageList()

  },
  getMessageList() {
    wx.showLoading({
      title: '加载中'
    })
    let { access_token, page, size, messageList, messageTwoList } = this.data
// api/v1/junchi/operations/activity/getShowActivityInfos
// api/v1/junchi/operations/news/getShowNews
    api._get(`api/v1/junchi/operations/activity/getShowActivityInfos`, {  page, size }).then(data => {
      console.log(data)
      if (data.code == 0) {
        if ((!data.data || !data.data.length) && page == 1&&!this.data.messageTwoList) {
          this.setData({
            messageList: [],
            isEmpty: true
          })
        } else if ((!data.data || !data.data.length) && page != 1) {
          $yjpToast.show({
            text: `没有更多数据了`
          })
        } else {
          let oldArr = messageList
          let newArr = data.data
          let finaArr = oldArr.concat(newArr)
          this.setData({
            messageList: finaArr,
            page: ++page
          })
          console.log(finaArr)
        }
        wx.hideLoading();
      }
    })
    api._get(`api/v1/junchi/operations/news/getShowNews`, { page, size }).then(data => {
      console.log(data)
      if (data.code == 0) {
        if ((!data.data || !data.data.length) && page == 1 && !this.data.messageList) {
          this.setData({
            messageTwoList: [],
            isEmpty: true
          })
        } else if ((!data.data || !data.data.length) && page != 1) {
          $yjpToast.show({
            text: `没有更多数据了`
          })
        } else {
          let oldArr = messageTwoList
          let newArr = data.data
          let finaArr = oldArr.concat(newArr)
          this.setData({
            messageTwoList: finaArr,
            page: ++page
          })
          console.log(finaArr)
        }
        wx.hideLoading();
      }
    })
  },
  lower() {
    this.getMessageList()
  },
  gotoDetail(e){
    let infoUrl = encodeURIComponent(e.currentTarget.dataset.url)
    let actId = e.currentTarget.dataset.actId
    App.WxService.navigateTo(App.Constants.Route.activity, { infoUrl, actId })
  },
  gotoIndustry(e){
    let infoUrl = encodeURIComponent(e.currentTarget.dataset.url)
    let actId = e.currentTarget.dataset.actId
    App.WxService.navigateTo(App.Constants.Route.information, { infoUrl, actId })
  },
  onPullDownRefresh() {
    wx.setNavigationBarTitle({
      title: '刷新中……'
    }) //动态设置当前页面的标题。

    wx.showNavigationBarLoading(); //在当前页面显示导航条加载动画。
    this.data.page = 1
    this.data.messageList = []
    this.data.messageTwoList = []

    this.getMessageList(); //重新加载产品信息

    wx.hideNavigationBarLoading(); //隐藏导航条加载动画。

    wx.stopPullDownRefresh(); //停止当前页面下拉刷新。

    console.log("关闭");

    wx.setNavigationBarTitle({
      title: '行业资讯'
    }) //动态设置当前页面的标题。
  },
  onReachBottom() {
    wx.showNavigationBarLoading();
    this.getMessageList()
  },

})