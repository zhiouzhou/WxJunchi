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
    memberId: ``, //会员号，选填。一般后台调用时使用。
    userInfo: {},
    mobileStatus: false,
    emailStatus: true,
    tuijian: ``,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function(options) {
    console.log(options)
    let access_token = wx.getStorageSync(`access_token`)
    let userInfo = wx.getStorageSync(`userInfo`)
    let hideMobile = ``
    if (userInfo.mobile) {
      hideMobile = userInfo.mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    }
    let str = '',
      str1 = '',
      str2 = '',
      hideEmail = ''
    if (userInfo.email) {
      str = userInfo.email
      str1 = str.substring(0, str.indexOf("@"));
      str2 = str.substring(str.indexOf("@"));
      hideEmail = str1.substring(0, str1.length - 5) + "*****" + str2
    }
    console.log(hideEmail)
    this.setData({
      access_token,
      userInfo,
      hideMobile,
      hideEmail
    })
    // this.getUserInfo()
    this.setUser()

  },
  // 设置推荐人
  setUser() {
    let {
      access_token,
      inviter
    } = this.data

  },
  setSuperior() {
    let url = `api/v1/user/randomInviter?access_token=${this.data.access_token}`
    let userInfo = wx.getStorageSync(`userInfo`)
    let that = this
    let access_token = this.data.access_token
    wx.showModal({
      title: '提示',
      cancelText: '立即设置', //立即设置  取消按钮设置为立即设置按钮
      confirmText: '随机分配',
      content: '暂无推荐人，是否设置推荐人?',
      success(res) {
        if (res.confirm) {
          wx.showModal({
            title: '提示',
            content: '是否确认随机分配推荐人?',
            success(res) {
              if (res.confirm) {
                api._get(url).then(data => {
                  if (data.code == 0) {
                    let url = `/api/v1/user/inviter?access_token=${that.data.access_token}&inviter=${data.data}`
                    api._post(url).then(data => {
                      if (data.code == 0) {
                        console.log(data)
                        $yjpToast.show({
                          text: data.desc
                        })
                        userInfo.superior = data.data.superior
                        wx.setStorageSync(`userInfo`, userInfo)
                        that.onShow()
                      } else {
                        $yjpToast.show({
                          text: data.desc
                        })
                      }
                    })
                  }
                })
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })

        } else if (res.cancel) {
          wx.scanCode({
            success(res) {
              console.log(res)
              that.setData({
                inviter: res.result
              })
              if (res.result.split('#')[0] == 'jl.jcstauto.com') {
                App.WxService.navigateTo(App.Constants.Route.myOrder, {
                  bundleData: 'FINISH'
                })
                return
              }
              if (res.result.split(':')[0] == 'http' || res.result.split(':')[0] == 'https') {
                $yjpToast.show({
                  text: `二维码格式不正确`
                })
                return
              }
              let url1 = `api/v1/user/qrcode/decode?access_token=${access_token}&content=${res.result}`
              api._post(url1).then(data => {
                if (data.code == 0) {
                  console.log(data.data)
                  // that.setRecommender()
                  let obj = JSON.parse(data.data.content)
                  let nickname = JSON.parse(data.data.content).nickname
                  wx.showModal({
                    title: '提示',
                    content: `您确定将${nickname}设置为推荐人吗？`,
                    success(res) {
                      if (res.confirm) {
                        that.setRecommender(obj)
                      } else if (res.cancel) {
                        console.log('用户点击取消')
                      }
                    }
                  })
                } else {
                  $yjpToast.show({
                    text: `二维码格式不正确`
                  })
                }
              }).catch(e => {
                $yjpToast.show({
                  text: `二维码格式不正确`
                })
              })

            },
            file: function(res) {

            },
          })
        }
      }
    })
  },

  navigitePage(e) {
    const tag = e.currentTarget.dataset.tag
    const hasPassword = e.currentTarget.dataset.hasPassword
    const userInfo = e.currentTarget.dataset.userInfo
    App.WxService.navigateTo(App.Constants.Route[tag], {
      userInfo,
      hasPassword: hasPassword ? hasPassword : ``
    })
  },
  checkMobileStatus() {
    this.setData({
      mobileStatus: !this.data.mobileStatus
    })
  },
  checkEmailStatus() {
    this.setData({
      emailStatus: !this.data.emailStatus
    })
  },
  noJump() {
    return
  },
  //退出登录
  signOut() {
    let access_token = this.data.access_token
    let url = `api/v1/auth/logout?access_token=${access_token}`
    api._post(url).then(data => {
      console.log(data)
      if (data.code == 0) {
        wx.removeStorageSync(`access_token`)
        wx.removeStorageSync(`refresh_token`)
        wx.removeStorageSync(`userInfo`)
        App.WxService.redirectTo(App.Constants.Route.login, {
          path: `homePage`
        })
      }
    })
  },
})