// pages/user/accountManage/setLoginpsw.js
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
    newPass: ``,
    oldPass: ``,
    access_token: ``,
    // hasPassword: '', //未设置密码为false 设置了为true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let hasPassword = wx.getStorageSync('userInfo').hasPassword
    let access_token = wx.getStorageSync('access_token')
    this.setData({
      access_token,
      hasPassword
    })
  },
  setPassword(e) {
    console.log(e.detail.value)
    this.setData({
      newPass: e.detail.value
    })
    // this.check_result()
  },
  setOldPassword(e) {
    this.setData({
      oldPass: e.detail.value
    })
    // this.check_result()
  },
  check_result() {
    let {
      newPass,
      oldPass,
      access_token,
      hasPassword
    } = this.data
    if (!hasPassword) {
      if (!newPass) {
        return {
          success: false,
          desc: `请输入您的新密码`
        }
      } else if (newPass.length < 8) {
        return {
          success: false,
          desc: `请输入至少8位数的密码`
        }
      } else {
        return {
          success: true,
          desc: ``
        }
      }
    } else {
      if (!oldPass) {
        return {
          success: false,
          desc: `请输入您的旧密码`
        }
      } else if (!newPass) {
        return {
          success: false,
          desc: `请输入您的新密码`
        }
      } else if (newPass.length < 8) {
        return {
          success: false,
          desc: `请输入至少8位数的密码`
        }
      } else {
        return {
          success: true,
          desc: ``
        }
      }
    }


  },
  submit() {
    let {
      newPass,
      oldPass,
      access_token
    } = this.data
    let result = this.check_result()
    console.log(this)
    console.log(result)
    let url = `api/v1/auth/account/setLoginPass`
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1]; //当前页面
    var prevPage = pages[pages.length - 2]; //上一个页面
    // 直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    if (!result.success) {
      return $yjpToast.show({
        text: result.desc
      })
    }
    api._post(url, {
      access_token,
      newPass,
      oldPass
    }, {
      'content-type': 'application/x-www-form-urlencoded'
    }).then(data => {
      if (data.code == 0) {
        $yjpToast.show({
          text: data.desc
        })
        // prevPage.setData({
        //   "userInfo.hasPassword": true
        // })
        let userInfo = wx.getStorageSync(`userInfo`)
        userInfo.hasPassword = true
        wx.setStorageSync(`userInfo`, userInfo)
        setTimeout(() => {
          App.WxService.navigateBack()
        })

      } else {
        $yjpToast.show({
          text: data.desc
        })
      }
    }).catch(e => {
      $yjpToast.show({
        text: e
      })
    })
  }
})