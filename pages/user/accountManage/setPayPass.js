// pages/user/accountManage/setPayPass.js
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
    access_token: ``,
    mobile: ``,
    pass: ``,
    codeId: ``, //获取验证码得到的CodeID
    smsCode: ``, //验证码
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let access_token = wx.getStorageSync('access_token')
    let mobile = wx.getStorageSync(`userInfo`).mobile
    this.setData({
      access_token,
      mobile
    })
  },
  //绑定手机号输入
  onMobile(e) {
    this.setData({
      mobile: e.detail.value
    })
  },
  //绑定验证码输入
  onCode(e) {
    this.setData({
      smsCode: e.detail.value
    })
  },
  //绑定密码输入
  onPassword(e) {
    this.setData({
      pass: e.detail.value
    })
  },
  //绑定获取验证码事件
  getCode() {
    let mobile = this.data.mobile
    let that = this
    if (!mobile) {
      return $yjpToast.show({
        text: `请输入手机号`
      })
    } else if (!(/^1[34578]\d{9}$/.test(mobile))) {
      return $yjpToast.show({
        text: `手机号格式不正确`
      })
    }
    api._get('api/v1/auth/code/SMS', {
      mobile
    }).then(data => {
      if (data.code == 0) {
        $yjpToast.show({
          text: `已发送验证码`
        })
        console.log(data)
        that.setData({
          codeId: data.data.codeId
        })
      } else {
        $yjpToast.show({
          text: data.desc
        })
      }

    })
  },
  check_result() {
    let {
      mobile,
      codeId,
      smsCode,
      pass,
      access_token
    } = this.data
    if (!mobile) {
      return {
        success: false,
        desc: `请输入手机号`
      }
    } else if (!smsCode) {
      return {
        success: false,
        desc: `请输入验证码`
      }
    } else if (!pass){
      return {
        success: false,
        desc: `请输入支付密码`
      }
    } else {
      return {
        success: true,
        desc: ``
      }
    }
  },
  //绑定确定按钮
  ensure() {
    let {
      mobile,
      codeId,
      smsCode,
      pass,
      access_token
    } = this.data
    let that = this
    let result = this.check_result()
    if(!result.success){
      return $yjpToast.show({text:result.desc})
    }
    // let url = `api/v1/auth/account/resetLoginPass?newPass=${newPass}&codeId=${codeId}&mobile=${mobile}&smsCode=${smsCode}`
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];  //当前页面
    var prevPage = pages[pages.length - 2]; //上一个页面
    // 直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    api._post(`api/v1/user/setPayPass`, {
      access_token,
      pass,
      codeId,
      mobile,
      smsCode
    }, {
      'content-type': 'application/x-www-form-urlencoded'
    }).then(data => {
      if (data.code == 0) {
        $yjpToast.show({
          text: data.desc
        })
        // prevPage.setData({
        //   "userInfo.hasPayPass": true
        // })
        let userInfo = wx.getStorageSync(`userInfo`)
        userInfo.hasPayPass = true
        wx.setStorageSync(`userInfo`, userInfo)
        setTimeout(() => {
          App.WxService.navigateBack()
        },2000)
      } else {
        $yjpToast.show({
          text: data.desc
        })
      }
    }).catch(e => {
      $yjpToast.show({
        text: `设置支付密码失败`
      })
    })
  },

})