  // pages/login/codeInput.js
  const api = require('../../utils/NetWorkUtil.js')
  const App = getApp()
  const ROUTE = App.Constants.Route
  const util = require('../../utils/util.js')
  import {
    $yjpToast,
  } from '../../components/yjp.js'
  Page({

    /**
     * 页面的初始数据
     */
    data: {
      mobile: ``,
      codeNumFakeArr: [0, 1, 2, 3, 4, 5],
      codeValue: ``, //验证码
      count: 60, //倒计时
      countShow: false,
      codeId: ``,
      memberId: ``,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
      console.log(options)

      let mobile = options.mobile
      let codeId = options.codeId
      let path = options.path
      this.setData({
        mobile,
        codeId,
        path,
        globalDataUserInfo: App.globalData.userInfo
      })
      this.countDown()
    },
    onCodeInput(e) {
      this.setData({
        codeValue: e.detail.value
      })
    },
    //失去焦点
    blur(e) {
      // this.setData({
      //   codeValue: ''
      // })
    },
    //倒计时
    countDown() {
      var that = this
      var time = setInterval(() => {
        var times = that.data.count - 1;
        that.setData({
          count: times
        })
        if (that.data.count < 1) {
          clearInterval(time)
          that.setData({
            count: 60,
            countShow: true
          })
        }
      }, 1000)
    },
    //绑定重新发送事件
    resend() {
      this.setData({
        countShow: false
      })
      let that = this
      let mobile = this.data.mobile
      api._get('api/v1/auth/code/SMS', {
        mobile
      }).then(data => {
        $yjpToast.show({
          text: `已发送验证码`
        })
        this.countDown()
        console.log(data)
        that.setData({
          codeId: data.data.codeId
        })
      })
    },
    // 登录
    login() {
      let {
        mobile,
        codeValue,
        codeId,
        path,
        // wxMiniCode
      } = this.data
      let wxMiniCode = ``
      if (!codeValue) {
        $yjpToast.show({
          text: `请输入验证码`
        })
        return
      }
      console.log(path)
      App.WxService.login()
        .then(data => {
          console.log(data)
          wxMiniCode = data.code
          api._post('api/v1/auth/login/wxminiprogram', {
            mobile,
            smsCode: codeValue,
            codeId,
            wxMiniCode,
          }, {
              'content-type': 'application/x-www-form-urlencoded'
            }).then(data => {
              if (data.code == 0) {
                // console.log(data)
                wx.setStorageSync('access_token', data.data.access_token)
                wx.setStorageSync('refresh_token', data.data.refresh_token)
                $yjpToast.show({
                  text: `登录成功`
                })
                this.getUserInfo(data.data.access_token)
                setTimeout(() => {
                  if (path == 'codeInput' || path == 'login' || path == 'index') {
                    App.WxService.switchTab(App.Constants.Route.homePage)
                  } else {
                    wx.navigateBack({
                      delta: 2
                    })
                  }
                }, 500)
              } else {
                $yjpToast.show({
                  text: data.desc
                })
              }

            }).catch(e => {
              $yjpToast.show({
                text: `验证码错误`
              })
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

  })