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
    isEmpty: false,
    memberId: ``,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function(options) {
    let access_token = wx.getStorageSync(`access_token`);
    let memberId = wx.getStorageSync(`userInfo`).memberId
    const systemInfo = App.globalData.systemInfo;
    this.setData({
      access_token,
      windowHeight: systemInfo.windowHeight,
      page: 1,
      messageList: [],
      memberId: memberId
    })
    this.getMessageList()

  },
  onLoad(options) {
    if (options.scene) {
      let scene = options.scene
      console.log(scene)
      console.log(decodeURIComponent(scene))
      scene = decodeURIComponent(scene)
      console.log(scene)
      let inviter = scene.split('=')[1]
      console.log(inviter)
      let access_token = wx.getStorageSync(`access_token`)
      console.log(access_token)
      App.globalData.inviter = inviter
      console.log(App.globalData)
    } else {
      App.globalData.inviter = ``
    }
    console.log(App.globalData.inviter)
  },
  //查询消息列表
  getMessageList() {
    wx.showLoading({
      title: '加载中'
    })
    let {
      access_token,
      page,
      size,
      messageList
    } = this.data

    api._get(`api/v1/junchi/notemessage/message/getMessages`, {
      access_token,
      page,
      size,
      roleType: 'USER'
    }).then(data => {
      console.log(data)
      if (data.code == 0) {
        if ((!data.data || !data.data.length) && page == 1) {
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
          newArr.forEach(item => {
            console.log(item)
            return item.mgContent = JSON.parse(item.mgContent)
          })
          let finaArr = oldArr.concat(newArr)
          // finaArr.forEach(item=>{
          //   console.log(item)
          //   return item.mgContent = JSON.parse(item.mgContent)||{}
          // })
          this.setData({
            messageList: finaArr,
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
  onShareAppMessage(res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '骏驰',
      path: `/pages/homePage/homePage?scene=inviter%3D${this.data.memberId}`,
      imageUrl: `/assets/image/share2.png`
    }
  },
  onPullDownRefresh() {
    wx.setNavigationBarTitle({
      title: '刷新中……'
    }) //动态设置当前页面的标题。

    wx.showNavigationBarLoading(); //在当前页面显示导航条加载动画。
    this.data.page = 1
    this.data.messageList = []
    this.getMessageList(); //重新加载产品信息

    wx.hideNavigationBarLoading(); //隐藏导航条加载动画。

    wx.stopPullDownRefresh(); //停止当前页面下拉刷新。

    console.log("关闭");

    wx.setNavigationBarTitle({
      title: '消息'
    }) //动态设置当前页面的标题。
  },
  onReachBottom() {
    wx.showNavigationBarLoading();
    this.getMessageList()
  },

})