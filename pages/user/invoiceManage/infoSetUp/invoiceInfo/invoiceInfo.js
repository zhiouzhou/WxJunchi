// pages/user/invoiceManage/infoSetUp/invoiceInfo/invoiceInfo.js
const App = getApp()
const api = require('../../../../../utils/NetWorkUtil')
import {
  $yjpToast
} from '../../../../../components/yjp.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    invoiceList: [],
    isEmpty: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function(options) {
    let memberId = wx.getStorageSync(`userInfo`).memberId;
    let access_token = wx.getStorageSync(`access_token`)
   
    this.setData({
      memberId,
      access_token,
    })
    // this.onLoad()
    this.getInvoiceList(memberId, access_token)
  },
  onLoad(options){
    let pageType = options.pageType ? options.pageType : ''
    this.setData({ pageType})
  },
  //获取发票信息列表
  getInvoiceList(memberId, access_token) {
    let url = `api/v1/user/${memberId}/invoiceInfo/list?access_token=${access_token}`
    api._get(url).then(data => {
      if (data.code == 0) {
        if (!data.data || !data.data.length) {
          this.setData({
            invoiceList: [],
            isEmpty: true
          })
        } else {
          this.setData({
            invoiceList: data.data,
            isEmpty: false
          })
        }
      } else {

      }
    })
  },

  addInvoiceInfo(e) {
    const pageType = e.currentTarget.dataset.pageType
    console.log(pageType)
    const tag = e.currentTarget.dataset.tag
    App.WxService.navigateTo(App.Constants.Route[tag], {
      pageType
    })
  },
  edit(e) {
    const pageType = e.currentTarget.dataset.pageType
    const invoiceInfo = e.currentTarget.dataset.invoiceInfo
    console.log(pageType)
    const tag = e.currentTarget.dataset.tag
    App.WxService.navigateTo(App.Constants.Route[tag], {
      pageType,
      invoiceInfo
    })
  },
  deleteInvoice(e) {
    let id = e.currentTarget.dataset.id
    let {
      memberId,
      access_token
    } = this.data
    let url = `api/v1/user/${memberId}/invoiceInfo/${id}?access_token=${access_token}`
    api._delete(url).then(data => {
      if (data.code == 0) {
        $yjpToast.show({
          text: data.desc
        })
        this.getInvoiceList(memberId, access_token)
      } else {
        $yjpToast.show({
          text: data.desc
        })
      }
    })

  },
  // 选择发票信息
  selectInvoice(e) {
    let invoiceInfo = e.currentTarget.dataset.invoiceInfo
    if (this.data.pageType == "invoice") {
      var pages = getCurrentPages();
      var currPage = pages[pages.length - 1]; //当前页面
      var prevPage = pages[pages.length - 2]; //上一个页面
      // 直接调用上一个页面的setData()方法，把数据存到上一个页面中去
      prevPage.setData({
        title:invoiceInfo.title,
        taxNo: invoiceInfo.taxNo
      })
      setTimeout(() => {
        wx.navigateBack({
          delta: 1
        });
      }, 500)
    }
  },
})