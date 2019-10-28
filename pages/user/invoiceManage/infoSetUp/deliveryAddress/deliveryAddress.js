// pages/user/receiveAddress/receiveAddress.js
import { $yjpToast } from '../../../../../components/yjp.js'
const api = require('../../../../../utils/NetWorkUtil.js')
const App = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    access_token: ``,
    memberId: ``,  //会员ID
    addressList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let access_token = wx.getStorageSync(`access_token`)
    let memberId = wx.getStorageSync(`userInfo`).memberId
    console.log(memberId)
    this.setData({
      access_token, memberId
    })
    this.getReceiveAddressList()

  },
  onShow() {
    this.getReceiveAddressList()
  },
  //获取收货地址列表
  getReceiveAddressList() {
    let { access_token, memberId } = this.data
    let url = `api/v1/user/${memberId}/deliveryAddress`
    api._get(url, { access_token }).then(data => {
      this.setData({ addressList: data.data })
    })

  },
  addReceiveAddress(e) {
    const tag = e.currentTarget.dataset.tag
    const pageType = e.currentTarget.dataset.pageType
    console.log(pageType)
    App.WxService.navigateTo(App.Constants.Route[tag], { pageType })
  },
  edit(e) {
    const tag = e.currentTarget.dataset.tag
    const pageType = e.currentTarget.dataset.pageType
    const address = e.currentTarget.dataset.address
    App.WxService.navigateTo(App.Constants.Route[tag], { pageType, address })
  }
})