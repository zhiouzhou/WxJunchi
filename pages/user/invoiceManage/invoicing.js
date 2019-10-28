// pages/user/invoiceManage/invocing.js
const App = getApp()
const api = require('../../../utils/NetWorkUtil')
import {
  $yjpToast
} from '../../../components/yjp.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    invoiceType: 1, //0为电子发票 1为纸质发票
    titleType: 0, //0为企业抬头  1为个人抬头
    orderNo: ``,
    price: 0,
    title: ``,
    taxNo: ``
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options.orderNo)
    let price = Number(options.price)
    let access_token = wx.getStorageSync(`access_token`)
    this.setData({
      orderNo: options.orderNo,
      price,
      access_token
    })
  },
  selectInvoiceType(e) {
    let index = e.currentTarget.dataset.index
    if (index == 0) {
      return false
    }
    this.setData({
      invoiceType: index,

    })
  },
  //绑定切换抬头类型
  selectCompanyType(e) {
    //0为企业抬头  1为个人抬头
    let titleType = e.currentTarget.dataset.titleType
    this.setData({
      titleType: titleType,
      title: ``,
      taxNo: ``
    })
  },
  //绑定发票抬头输入
  onTitle(e) {
    let title = e.detail.value
    this.setData({
      title: title
    })
  },
  //绑定税号输入
  onTaxNo(e) {
    let taxNo = e.detail.value
    this.setData({
      taxNo: taxNo
    })
  },
  //绑定备注
  onRemarks(e) {
    let remarks = e.detail.value
    this.setData({
      remarks: remarks
    })
  },
  //选择收货地址
  selectAddress() {
    App.WxService.navigateTo(App.Constants.Route.receiveAddress, {
      pageType: 'invoice'
    })
  },
  //提交 开票
  submit(e) {
    console.log(e)
    let {
      access_token,
      orderNo,
      title,
      taxNo,
      addressInfo,
      remarks,
      titleType,
      invoiceType
    } = this.data
    let checkResult = this.check_button()
    let that = this
    let url = `api/v1/jc/mall/order/${orderNo}/invoice?access_token=${access_token}`
    let formId = e.detail.formId
    let params = {
      titleType: titleType == 0 ? 'COMPANY' :'INDIVIDUAL',
      formId,
      source: "SYSTEM",
      medium: invoiceType == 1 ? "PAPER" :"ELECTRONIC",
      title,
      taxNo,
      receiverAddress: addressInfo.province + addressInfo.city + addressInfo.district + addressInfo.detailedAddress,
      receiverName: addressInfo.receiverName,
      receiverPhone: addressInfo.receiverMobile,
      remarks
    }
    if (!checkResult.success) {
      wx.showToast({
        title: checkResult.desc,
        icon: 'none'
      })
      return
    }
    api._post(url, params).then(data => {
      if (data.code == 0) {
        $yjpToast.show({
          text: data.desc
        })
        setTimeout(() => {
          App.WxService.navigateBack()
        }, 500)
      } else {
        $yjpToast.show({
          text: data.desc
        })
      }
    })
  },
  //验证
  check_button() {
    let {
      title,
      taxNo,
      addressInfo,
      titleType
    } = this.data
    if (titleType == 0 && (!title || !taxNo || !addressInfo)) {
      return {
        success: false,
        desc: `请输入完整信息`
      }

    } else if (titleType == 1 && (!title || !addressInfo)) {
      return {
        success: false,
        desc: `请输入完整信息`
      }
    } else {
      return {
        success: true,
        desc: ``
      }
    }
  },
  // 选择发票
  selectInvoice() {
    App.WxService.navigateTo(App.Constants.Route.invoiceInfo, {
      pageType: 'invoice'
    })
  },
})