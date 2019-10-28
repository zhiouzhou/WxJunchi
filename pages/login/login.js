// pages/login/login.js
const App = getApp()
const api = require('../../utils/NetWorkUtil.js')
import {
  $yjpToast
} from '../../components/yjp.js'
const util = require('../../utils/util.js')
const ROUTE = App.Constants.Route
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loginType: 0, //type为0时为验证码登录  为1时是账号登录
    titleState: false, //手机号三个字显示状态
    mobile: ``,
    btnState: false,
    codeId: ``,
    password: ``,
    memberId: ``,
    userInfo: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      path: options.path,
      // globalDataUserInfo: App.globalData.userInfo
    })
    console.log(options.path)
    // console.log(App.globalData.userInfo)
    var that = this;
    // 查看是否授权
    wx.getSetting({
      success: function(res) {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              that.setData({
                globalDataUserInfo: res.userInfo
              })
            }
          })
        } else {
          // 用户没有授权
          App.WxService.navigateTo(App.Constants.Route.index)
        }
      }
    });

    App.WxService.login()
      .then(data => {
        this.setData({
          wxMiniCode: data.code
        })
        // wxMiniCode = data.code
      })
  },
  //输入手机号
  onMobile(e) {
    let mobile = e.detail.value
    this.setData({
      mobile
    })
    this.check_btn()
  },
  onPassword(e) {
    let password = e.detail.value
    this.setData({
      password
    })
    this.check_btn()
  },
  // 绑定聚焦
  onFocus() {
    this.setData({
      titleState: true
    })
  },
  // 绑定失焦
  onBlur() {
    this.setData({
      titleState: false
    })
  },
  // 切换登录方式
  checkLoginType() {
    let type = this.data.loginType == 0 ? 1 : 0
    this.setData({
      loginType: type,
      mobile: ``,
      password: ``,
      btnState: false
    })
  },
  // 绑定获取验证码
  gotocodeInput(e) {
    let {
      mobile,
      codeId,
      path
    } = this.data
    let checkResult = this.check_btn()
    let that = this
    if (!checkResult.success) {
      wx.showToast({
        title: checkResult.desc,
        icon: 'none'
      })
      return
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
        App.WxService.navigateTo(App.Constants.Route.codeInput, {
          mobile,
          codeId: that.data.codeId,
          path
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
    // App.HttpService.getCodeId({ mobile})
    // .then(data=>{
    //   console.log(data)
    // })

  },

  //登录
  login() {
    wx.showLoading({
      title: '登录中'
    })
    let {
      mobile,
      password,
      path,
      wxMiniCode
    } = this.data
    let checkResult = this.check_btn()
    let that = this
    if (!checkResult.success) {
      wx.showToast({
        title: checkResult.desc,
        icon: 'none'
      })
      return
    }
    api._post('api/v1/auth/login/account', {
        account: mobile,
        password,
        wxMiniCode
      }, {
        'content-type': 'application/x-www-form-urlencoded'
      })
      .then(data => {
        if (data.code == 0) {
          wx.setStorageSync('access_token', data.data.access_token)
          wx.setStorageSync('refresh_token', data.data.refresh_token)
          $yjpToast.show({
            text: `登录成功`
          })
          this.getUserInfo(data.data.access_token)
          setTimeout(() => {
            if (path == 'login' || path == 'index') {
              App.WxService.switchTab(App.Constants.Route.homePage)
            } else {
              App.WxService.navigateBack()
            }
          }, 1000)
        } else {
          $yjpToast.show({
            text: data.desc
          })
        }

      }).catch(e => {
        $yjpToast.show({
          text: `登录失败`
        })
      })
  },
  //获取用户信息
  getUserInfo(access_token) {
    let {
      // access_token,
      memberId
    } = this.data
    let time = util.formatTimeDate(new Date());
    console.log(time)
    api._get('api/v1/user', {
      access_token,
      memberId
    }).then(data => {
      this.setData({
        userInfo: data.data,
        memberId: data.data.memberId
      })
      let gmtCreateTime = data.data.gmtCreate.split(' ')[0]
      console.log(gmtCreateTime)
      console.log(!data.data.superior)
      if (gmtCreateTime == time && !data.data.superior && App.globalData.inviter) {
        this.setRecommender(access_token, App.globalData.inviter)
      }
      // this.getWalletInfo()
      wx.setStorageSync('userInfo', data.data)
    })
  },
  //下级设置推荐人
  setRecommender(access_token, inviter) {
    // let memberId = this.data.inviter
    let url = `/api/v1/user/inviter?access_token=${access_token}&inviter=${inviter}`
    api._post(url).then(data => {
      if (data.code == 0) {
        console.log(`设置推荐人成功`, data)
        // $yjpToast.show({
        //   text: data.desc
        // })
        // this.getUserInfo()
      } else {
        // $yjpToast.show({
        //   text: data.desc
        // })
      }
    })
  },

  //刷新token
  refreshToken(refresh_token) {
    let url = `api/v1/auth/refresh?refresh_token=${refresh_token}`
    api._post(url).then(data => {
      console.log(data)
    })
  },

  //绑定微信手机号登录
  onWeiXinLogin(e) {
    console.log(e)
    wx.showLoading({
      title: '登录中',
    })
    let encryptedData = e.detail.encryptedData;
    let iv = e.detail.iv;
    // let wxMiniCode = App.globalData.wxMiniCode
    let wxMiniCode = this.data.wxMiniCode
    let path = this.data.path
    let that = this;
    // .then(data => {
    api._post('api/v1/auth/login/wxminiprogram', {
      encryptedData,
      iv,
      wxMiniCode,
      displayName: this.data.globalDataUserInfo ? this.data.globalDataUserInfo.nickName:'',
      headPic: this.data.globalDataUserInfo ? this.data.globalDataUserInfo.avatarUrl:''
    }, {
      'content-type': 'application/x-www-form-urlencoded'
    }).then(data => {
      wx.setStorageSync('access_token', data.data.access_token)
      wx.setStorageSync('refresh_token', data.data.refresh_token)

      $yjpToast.show({
        text: `登录成功`
      })
      this.getUserInfo(data.data.access_token)
      setTimeout(() => {
        if (path == 'login' || path == 'index') {
          App.WxService.switchTab(App.Constants.Route.homePage)
        } else {
          App.WxService.navigateBack()
        }
      }, 1000)
    }).catch(e => {
      $yjpToast.show({
        text: `登录失败`
      })
    })
  },
  // 验证手机号
  check_btn() {
    let that = this
    let {
      mobile,
      password,
      loginType
    } = this.data
    if (!mobile && loginType == 0) {
      this.setData({
        btnState: false
      })
      return {
        success: false,
        desc: `请输入手机号`
      }
    } else if (loginType == 1 && (!password || !mobile)) {
      return {
        success: false,
        desc: ``
      }
    } else {
      this.setData({
        btnState: true
      })
      return {
        success: true,
        desc: ``
      }
    }
  },
  forgetPassword() {
    App.WxService.navigateTo(App.Constants.Route.findPassword)
  },
})