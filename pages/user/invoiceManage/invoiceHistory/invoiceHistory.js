// pages/user/invoiceManage/invoiceHistory/invoiceHistory.js
const App = getApp()
const api = require('../../../../utils/NetWorkUtil')
import {
  $yjpToast
} from '../../../../components/yjp.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    historyList: [],
    isEmpty: false

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let access_token = wx.getStorageSync(`access_token`)
    this.getInvoiceHistory(access_token)
  },
  //获取开票历史列表
  getInvoiceHistory(access_token) {
    let url = `/api/v1/jc/mall/order/invoice/history?access_token=${access_token}`
    let that = this
    api._get(url).then(data => {
      if (data.code == 0) {
        if (!data.data || !data.data.length) {
          that.setData({
            historyList: [],
            isEmpty: true,
          })
        } else {
          that.setData({
            historyList: data.data,
            isEmpty: false,
          })
        }

      }
    })

  },
  // 去发票详情
  viewDetail(e) {
    let invoiceInfo = e.currentTarget.dataset.invoiceInfo
    App.WxService.navigateTo(App.Constants.Route.invoiceDetail, {
      invoiceInfo
    })
  },
})