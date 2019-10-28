// pages/user/user.js
const App = getApp()
const api = require('../../utils/NetWorkUtil.js')
import {
  $yjpToast
} from '../../components/yjp.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dialogState: false,
    userInfo: {},
    access_token: ``,
    memberId: ``,
    walletInfo: {},
    scanUrl: ``, //二维码图片
    inviter: ``, //上级二维码的值
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    // this.getWalletInfo()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let access_token = wx.getStorageSync(`access_token`)
    this.setData({
      access_token,
      memberId: ``
    })
    this.getUserInfo()
  },
  //获取用户信息
  getUserInfo() {
    let {
      access_token,
      memberId
    } = this.data
    api._get('api/v1/user', {
      access_token,
      memberId
    }).then(data => {
      this.setData({
        userInfo: data.data,
        memberId: data.data.memberId
      })
      this.getWalletInfo()
      wx.setStorageSync('userInfo', data.data)
    })
  },
  // 钱包查询
  getWalletInfo() {
    let access_token = wx.getStorageSync(`access_token`)
    let memberId = this.data.memberId
    console.log(memberId)
    let url = `api/v1/user/${memberId}/wallet`
    api._get(url, {
      access_token
    }).then(data => {
      console.log(data)
      this.setData({
        walletInfo: data.data
      })
    })
  },

  navigatePage(e) {
    const tag = e.currentTarget.dataset.tag
    const bundle = e.currentTarget.dataset.bundle
    const state = e.currentTarget.dataset.state
    console.log(App)
    App.WxService.navigateTo(App.Constants.Route[tag], {
      bundleData: bundle ? bundle : ``,
      state: state ? state : ''
    })
  },
  //绑定我的二维码事件
  showDialog() {
    let access_token = this.data.access_token
    this.setData({
      dialogState: !this.data.dialogState
    })
    api._get(`api/v1/user/qrcode`, {
      access_token
    }).then(data => {
      if (data.code == 0) {
        this.setData({
          scanUrl: data.data
        })
      } else {

      }
    })
  },
  hideDialog() {
    this.setData({
      dialogState: false
    })
  },
  //绑定扫描二维码事件
  scan_code() {
    let that = this
    let access_token = this.data.access_token

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
        let url = `api/v1/user/qrcode/decode?access_token=${access_token}&content=${res.result}`
        api._post(url).then(data => {
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
  },
  //分享
  onShareAppMessage(res) {
    // let name = res.currentTarget.dataset.productName
    // let productNo = res.currentTarget.dataset.productNo
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '骏驰',
      path: `/pages/homePage/homePage?scene=inviter%3D${this.data.memberId}`,
      imageUrl: `/assets/image/share2.png`
    }
  },
  //下级设置推荐人
  setRecommender(content) {
    let memberId = content.memberId
    let url = `/api/v1/user/inviter?access_token=${this.data.access_token}&inviter=${memberId}`
    api._post(url).then(data => {
      if (data.code == 0) {
        console.log(data)
        $yjpToast.show({
          text: data.desc
        })
        this.getUserInfo()
      } else {
        $yjpToast.show({
          text: data.desc
        })
      }
    })
  },
})