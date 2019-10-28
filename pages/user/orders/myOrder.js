// pages/user/orders/myOrder.js
const App = getApp()
const api = require(`../../../utils/NetWorkUtil.js`)
import {
  $yjpToast
} from '../../../components/yjp.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    status: "", //订单状态
    orderList: [],
    windowHeight: 0,
    page: 1,
    size: 10,
    isEmpty: false,
    memberId: ``,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let memberId = wx.getStorageSync(`userInfo`).memberId
    let status = options.bundleData
    let state = options.state
    console.log(status)
    const systemInfo = App.globalData.systemInfo;
    let titleHeight = systemInfo.windowWidth / 750 * 34;
    this.setData({
      status,
      state1: state,
      // access_token,
      windowHeight: systemInfo.windowHeight - titleHeight,
      memberId,
    })
  },
  onShow() {
    let access_token = wx.getStorageSync(`access_token`)
    this.setData({
      page: 1,
      orderList: [],
      access_token
    })
    this.getOrderList()

  },
  /**
   * 时间秒数格式化
   * @param s 时间戳（单位：秒）
   * @returns {*} 格式化后的时分秒
   */
  sec_to_time(s) {
    var t;
    if (s > -1) {
      var hour = Math.floor(s / 3600);
      var min = Math.floor(s / 60) % 60;
      var sec = s % 60;
      if (hour < 10) {
        t = '0' + hour + ":";
      } else {
        t = hour + ":";
      }

      if (min < 10) {
        t += "0";
      }
      t += min + ":";
      if (sec < 10) {
        t += "0";
      }
      t += sec
    }
    return t;
  },
  // 切换状态获取订单列表
  checkStatus(e) {
    let state = e.currentTarget.dataset.state
    let state1 = e.currentTarget.dataset.state1 ? e.currentTarget.dataset.state1 : ''
    this.setData({
      status: state,
      page: 1,
      orderList: [],
      isEmpty: false,
      state1
    })
    this.getOrderList()

  },
  // 获取订单列表
  getOrderList(e) {
    let {
      status,
      access_token,
      page,
      size,
      orderList,
      isEmpty,
      state1
    } = this.data
    wx.showLoading({
      title: '加载中'
    })
    let url = ``
    if (state1) {
      url = `api/v1/jc/mall/order/list?access_token=${access_token}&page=${page}&size=${size}&status=${status}&status=${state1}`
    } else {
      url = `api/v1/jc/mall/order/list?access_token=${access_token}&page=${page}&size=${size}&status=${status}`
    }
    api._get(url).then(data => {
      if ((!data.data || !data.data.length) && page == 1) {
        this.setData({
          orderList: [],
          isEmpty: true
        })
      } else if ((!data.data || !data.data.length) && page != 1) {
        $yjpToast.show({
          text: `没有更多数据了`
        })
      } else {
        let oldArr = orderList
        let newArr = data.data
        let finaArr = oldArr.concat(newArr)
        finaArr.forEach(item => {
          item.expireIn = this.sec_to_time(item.expireIn)

        })
        this.setData({
          orderList: finaArr,
          page: ++page
        })
        console.log(finaArr)
      }
      wx.hideLoading();
    })

  },
  lower() {
    this.getOrderList()
  },
  gotoOrderList(e) {
    let orderNo = e.currentTarget.dataset.orderNo
    let orderInfo = e.currentTarget.dataset.orderInfo
    App.WxService.navigateTo(App.Constants.Route.orderDetail, {
      orderNo,
      pageType: 'myOrder',
      orderInfo
    })
  },
  gotoEaluation(e) {
    let orderNo = e.currentTarget.dataset.orderNo
    let goodsImage = e.currentTarget.dataset.goodsImage
    App.WxService.navigateTo(App.Constants.Route.ealuation, {
      orderNo,
      goodsImage
    })
  },
  selctProduct() {
    App.WxService.switchTab(App.Constants.Route.homePage)
  },
  // 取消订单
  cancelOrder(e) {
    let orderNo = e.currentTarget.dataset.orderNo
    let formId = e.detail.formId
    console.log(formId)
    let {
      access_token,
      orderList,
    } = this.data
    let that = this
    let url = `api/v1/jc/mall/order/cancel?access_token=${access_token}&orderNo=${orderNo}&formId=${formId}`
    wx.showModal({
      title: '提示',
      content: '您确定取消订单吗？',
      success(res) {
        if (res.confirm) {
          api._post(url).then(data => {
            if (data.code == 0) {
              $yjpToast.show({
                text: `取消成功`
              })
              that.setData({
                page: 1,
                orderList: [],
              })
              that.getOrderList()
            } else {
              $yjpToast.show({
                text: data.desc
              })
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  },
  //退款
  refund(e) {
    let orderNo = e.currentTarget.dataset.orderNo
    let formId = e.detail.formId
    console.log(formId)
    let {
      access_token,
      orderList
    } = this.data
    let that = this
    let url = `api/v1/jc/mall/order/refund?access_token=${access_token}&orderNo=${orderNo}&formId=${formId}`
    wx.showModal({
      title: '提示',
      content: '您确定退款吗？',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          api._post(url).then(data => {
            if (data.code == 0) {
              $yjpToast.show({
                text: data.desc
              })
              that.setData({
                page: 1,
                orderList: []
              })
              that.getOrderList()
            } else {
              $yjpToast.show({
                text: data.desc
              })
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  },
  //预约安装
  install(e) {
    let orderItem = e.currentTarget.dataset.orderItem
    App.WxService.navigateTo(App.Constants.Route.productInstall, {
      orderItem
    })

  },
  //再次购买
  againBuy(e) {
    let productNo = e.currentTarget.dataset.productNo
    let productItem = e.currentTarget.dataset.productItem
    App.WxService.navigateTo(App.Constants.Route.productDetail, {
      productNo,
      productItem
    })
  },
  //立即支付
  payMent(e) {
    let productInfo = e.currentTarget.dataset.productInfo;
    productInfo.name = productInfo.goodsName
    productInfo.currentPrice = productInfo.goodsPrice
    productInfo.no = productInfo.goodsNo
    let productList = [productInfo]
    let count = e.currentTarget.dataset.count
    let pageType = e.currentTarget.dataset.pageType
    let totalPrice = e.currentTarget.dataset.totalPrice
    App.WxService.navigateTo(App.Constants.Route.placeOrder, {
      productList,
      count,
      pageType,
      totalPrice
    })
    // wx.login({
    //   success: res => {
    //     var wxMiniCode = res.code;
    //     api._post(url, {
    //       orderNo,
    //       ip,
    //       payType,
    //       wxMiniCode
    //     }).then(data => {
    //       console.log(data)
    //       let that = this
    //       if (data.code == 0) {
    //         let dataList = data.data.wxResult

    //         wx.requestPayment({
    //           'timeStamp': dataList.wxJsApiSignParam.timeStamp,
    //           'nonceStr': dataList.wxJsApiSignParam.nonceStr,
    //           'package': dataList.wxJsApiSignParam.package,
    //           'paySign': dataList.paySign,
    //           'signType': dataList.wxJsApiSignParam.signType,
    //           'success': function(res) {
    //             console.log(res)
    //             // App.WxService.navigateTo(App.Constants.Route.orderDetail, {
    //             //   orderNo: dataList.outTradeNo
    //             // })
    //             that.setData({
    //               status: 'NO_RESERVE'
    //             })
    //             that.getOrderList()
    //           },
    //           'fail': function(res) {
    //             $yjpToast.show({
    //               text: `支付失败`
    //             })
    //           }
    //         })
    //       } else {
    //         $yjpToast.show({
    //           text: data.desc
    //         })
    //       }
    //     })
    //   }
    // })
  },
  // 申请维修
  applyService(e) {
    console.log(e.currentTarget.dataset.orderInfo)
    let orderInfo = e.currentTarget.dataset.orderInfo
    App.WxService.navigateTo(App.Constants.Route.applyService, {
      orderInfo
    })
  },
  onShareAppMessage(res) {
    console.log(res)
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
  onPullDownRefresh() {
    wx.setNavigationBarTitle({
      title: '刷新中……'
    }) //动态设置当前页面的标题。

    wx.showNavigationBarLoading(); //在当前页面显示导航条加载动画。
    this.data.page = 1
    this.data.orderList = []
    this.getOrderList(); //重新加载产品信息

    wx.hideNavigationBarLoading(); //隐藏导航条加载动画。

    wx.stopPullDownRefresh(); //停止当前页面下拉刷新。

    console.log("关闭");

    wx.setNavigationBarTitle({
      title: '我的订单'
    }) //动态设置当前页面的标题。
  },
  onReachBottom() {
    wx.showNavigationBarLoading();
    this.getOrderList()
  },
})