// pages/user/myBankCard/addBankCard.js
const App = getApp()
import {
  $yjpToast
} from '../../../components/yjp.js'
const api = require('../../../utils/NetWorkUtil.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    agreeState: false,
    idNumber: ``,
    bankCard: ``,
    mobile: ``,
    buttonEnable: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let access_token = wx.getStorageSync(`access_token`)
    let userInfo = wx.getStorageSync(`userInfo`)
    this.setData({
      access_token,
      userInfo
    })
  },
  selectAgree() {
    this.setData({
      agreeState: !this.data.agreeState
    })
    this.check()
  },

  //绑定银行卡输入信息
  bindCardInfo(e) {
    const tag = e.currentTarget.dataset.tag
    const content = e.detail.value
    this.setData({
      bankCard: content
    })
    this.check()
  },

  submit() {
    let that = this;
    let {
      access_token,
      username,
      idNumber,
      bankCard,
      mobile
    } = this.data
    let checkResult = this.check();
    if (!checkResult.success) {
      return $yjpToast.show({
        text: checkResult.desc
      })
    }
    let url = `api/v1/user/bankCard?access_token=${access_token}`
    api._post(url, {
      accountNo: bankCard,
    }).then(data => {
      if (data.code == 0) {
        $yjpToast.show({
          text: data.desc
        })
        App.WxService.navigateBack()
      } else {
        $yjpToast.show({
          text: data.desc
        })
      }
    })
  },

  // 判断btn按钮的背景色
  check() {

    let {
      agreeState,
      username,
      idNumber,
      bankCard,
      mobile,
      buttonEnable
    } = this.data
    if (!bankCard) {
      this.setData({
        buttonEnable: false
      })
      return {
        success: false,
        desc: ``
      }
    } else {
      this.setData({
        buttonEnable: true
      })
      return {
        success: true,
        desc: ``
      }
    }
  },
})