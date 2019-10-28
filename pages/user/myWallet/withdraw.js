// pages/user/myWallet/withdraw.js
const App = getApp()
const api = require('../../../utils/NetWorkUtil.js')
import {
  $yjpToast
} from '../../../components/yjp.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fee: ``,
    hasUserInfo: true,
    codeNumFakeArr: [0, 1, 2, 3, 4, 5],
    payPass: ``, //支付密码
    // bankCardInfo:{}
    confirmHold: false,
    passwordStatus:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let balance = parseInt(options.balance)
    console.log(typeof(balance))
    let access_token = wx.getStorageSync(`access_token`)
    let userInfo = wx.getStorageSync(`userInfo`)
    this.setData({
      balance,
      access_token,
      userInfo
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },
  count(e) {
    this.setData({
      fee: e.detail.value
    })
  },
  allWithdraw() {
    this.setData({
      fee: this.data.balance
    })
  },
  withdraw() {
    if (!this.data.fee || !this.data.bankCardInfo) {
      return
    } else if (this.data.fee > this.data.balance) {
      $yjpToast.show({
        text: `超出本次可提现余额`
      })
    } else if (!this.data.userInfo.hasPayPass) {
      wx.showModal({
        title: '提示',
        content: '您还未设置支付密码，是否设置支付密码？',
        confirmText: '是',
        success(res) {
          if (res.confirm) {
            App.WxService.navigateTo(App.Constants.Route.setPayPass)
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    } else {
      //提现
      this.setData({
        hasUserInfo: false
      })

    }
  },
  cancel() {
    this.setData({
      hasUserInfo: true,
      payPass: ``
    })
  },
  onPassInput(e) {
    let url = `api/v1/user/wallet/settlement?access_token=${this.data.access_token}`
    let {
      bankCardInfo,
      fee
    } = this.data
    this.setData({
      payPass: e.detail.value
    })
    if (e.detail.value.length == 6) {
      console.log(`1111`)
      this.blur()
      api._post(url, {
        accountNo: bankCardInfo.accountNo1,
        fee: fee * 100,
        payPass: e.detail.value
      }).then(data => {
        if (data.code == 0) {
          console.log(`111`)
          wx.showToast({
            title:`提现成功`,
            icon: 'none',
          })
          setTimeout(() => {
            App.WxService.navigateBack()
          }, 1000)
        } else {
          // $yjpToast.show({
          //   text: data.desc
          // })
          wx.showToast({
            title: data.desc,
            icon: 'none',
          })
          this.setData({
            payPass: ``
          })
        }
      })
    }
  },
  blur() {},
  boardheightchange(e) {
    console.log(e)
  },
  hideDialog() {
    this.setData({
      hasUserInfo: true,
      payPass: ``
    })
  },
  selectCard() {
    App.WxService.navigateTo(App.Constants.Route.myBankCard, {
      pageType: 'withdraw'
    })
  },

})