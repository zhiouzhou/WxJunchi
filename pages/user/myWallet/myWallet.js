   // pages/user/myWallet/myWallet.js
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
       walletInfo: {},
       windowHeight: 0,
       page: 1,
       size: 10,
       isEmpty: false
     },

     /**
      * 生命周期函数--监听页面加载
      */
     onLoad: function(options) {
       let walletInfo = JSON.parse(options.bundleData)
       console.log(walletInfo)
       const systemInfo = App.globalData.systemInfo;
      //  let memberId = wx.getStorageSync(`userInfo`).memberId
      //  let access_token = wx.getStorageSync(`access_token`)
       this.setData({
         walletInfo,
         windowHeight: systemInfo.windowHeight,
         userInfo: wx.getStorageSync(`userInfo`)
       })
      //  this.getTradeList(memberId, access_token)
     },
     onShow(){
       let memberId = wx.getStorageSync(`userInfo`).memberId
       let access_token = wx.getStorageSync(`access_token`)
       this.getTradeList(memberId, access_token)
     },
     //获取明细
     getTradeList(memberId, access_token) {
       let url = `api/v1/user/${memberId}/tradeDetails?access_token=${access_token}`
       let that = this
       api._get(url).then(data => {
         if (data.code == 0) {
           if (!data.data || !data.data.length) {
             this.setData({
               isEmpty: true,
               tradeList: []
             })
           } else {
             this.setData({
               isEmpty: false,
               tradeList: data.data
             })
           }

         }
       })
     },
     //提现
     withdraw() {
       if (this.data.userInfo.idCardStatus == 1) {
         $yjpToast.show({
           text: `您的实名认证正在审核中，暂时不能提现。`
         })
       } else if (this.data.userInfo.idCardStatus == "") {
         wx.showModal({
           title: '提示',
           content: '您还没有实名认证，是否进行实名认证？',
           confirmText: '是',
           success(res) {
             if (res.confirm) {
               App.WxService.navigateTo(App.Constants.Route.identification)
             } else if (res.cancel) {
               console.log('用户点击取消')
             }
           }
         })
       } else if (this.data.userInfo.idCardStatus != 1 && this.data.userInfo.idCardStatus != 3) {
         wx.showModal({
           title: '提示',
           content: '您的实名认证失败，是否重新进行实名认证？',
           confirmText: '是',
           success(res) {
             if (res.confirm) {
               App.WxService.navigateTo(App.Constants.Route.identification)
             } else if (res.cancel) {
               console.log('用户点击取消')
             }
           }
         })
       } else {
         App.WxService.navigateTo(App.Constants.Route.withdraw, {
           balance: this.data.walletInfo.balance
         })
       }

     },


   })