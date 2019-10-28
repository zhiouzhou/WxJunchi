// pages/user/orders/orderDetail.js
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
    orderDetailInfo: {},
    orderNo: ``,
    showSkeleton: true,
    storeInfo: {},
    memberId: ``
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const that = this;
    setTimeout(() => {
      that.setData({
        showSkeleton: false
      })
    }, 500)
    let orderNo = options.orderNo;
    let access_token = wx.getStorageSync(`access_token`)
    let memberId = wx.getStorageSync(`userInfo`).memberId
    let pageType = options.pageType
    let orderInfo = options.orderInfo ? JSON.parse(options.orderInfo) : {}
    if (pageType == 'myOrder') {
      this.setData({
        orderDetailInfo: orderInfo,
        memberId
      })
    }
    this.setData({
      orderNo,
      access_token,
      pageType,
      memberId
    })
  },
  onShow() {
    // let orderDetailInfo = this.data.orderDetailInfo
    this.getDetailInfo();
  },
  //获取详情信息
  getDetailInfo() {
    let {
      orderNo,
      access_token
    } = this.data
    let that = this
    api._get(`api/v1/jc/mall/order`, {
      orderNo,
      access_token
    }).then(data => {
      let number = 0;
      let list = data.data.goods
      list.forEach(item => {
        number += item.count
      })
      this.setData({
        orderDetailInfo: data.data,
        count: number
      })
      if (data.data.status == 'FINISH' || data.data.status == 'USER_RESERVE' || data.data.status == 'NO_INSTALL' || data.data.status == 'NO_COMMENT') {
        that.makeAnAppointment()
      }
    })
  },
  //  查询订单预约
  makeAnAppointment() {
    let orderNo = this.data.orderNo
    api._get(`api/v1/junchi/customer/task/getAdvancedBook`, {
      access_token: this.data.access_token,
      orderNo
    }).then(data => {
      console.log(data)
      if (data.code == 0) {
        this.setData({
          storeInfo: data.data
        })
      } else {
        $yjpToast.show({
          text: data.desc
        })
      }
    })
  },
  // 去门店信息详情的页面
  gotoStoreInfo() {
    let storeInfo = this.data.storeInfo
    App.WxService.navigateTo(App.Constants.Route.storeInfo, {
      storeInfo
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
  //立即评价
  gotoEaluation(e) {
    let orderNo = e.currentTarget.dataset.orderNo
    let goodsImage = e.currentTarget.dataset.goodsImage
    App.WxService.navigateTo(App.Constants.Route.ealuation, {
      orderNo,
      goodsImage
    })
  },

  //预约安装
  install(e) {
    let orderItem = e.currentTarget.dataset.orderItem
    App.WxService.navigateTo(App.Constants.Route.productInstall, {
      orderItem
    })
  },
  //取消订单
  cancelOrder(e) {
    let orderNo = e.currentTarget.dataset.orderNo
    let formId = e.detail.formId
    console.log(formId)

    let {
      access_token,

    } = this.data
    let url = `api/v1/jc/mall/order/cancel?access_token=${access_token}&orderNo=${orderNo}`
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
              this.getDetailInfo()
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
    let {
      access_token,

    } = this.data
    let that = this
    let formId = e.detail.formId
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
              that.getDetailInfo()
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
  //立即支付
  payMent(e) {
    let orderNo = e.currentTarget.dataset.orderNo
    let access_token = this.data.access_token
    let ip = "127.0.0.1"
    let payType = 6
    let url = `api/v1/jc/mall/order/pay?access_token=${access_token}`
    wx.login({
      success: res => {
        var wxMiniCode = res.code;
        api._post(url, {
          orderNo,
          ip,
          payType,
          wxMiniCode
        }).then(data => {
          console.log(data)
          let that = this
          if (data.code == 0) {
            let dataList = data.data.wxResult

            wx.requestPayment({
              'timeStamp': dataList.wxJsApiSignParam.timeStamp,
              'nonceStr': dataList.wxJsApiSignParam.nonceStr,
              'package': dataList.wxJsApiSignParam.package,
              'paySign': dataList.paySign,
              'signType': dataList.wxJsApiSignParam.signType,
              'success': function(res) {
                console.log(res)
                var pages = getCurrentPages();
                var currPage = pages[pages.length - 1]; //当前页面
                var prevPage = pages[pages.length - 2]; //上一个页面
                // 直接调用上一个页面的setData()方法，把数据存到上一个页面中去
                prevPage.setData({
                  status: 'NO_RESERVE',
                  page: 1
                })
                prevPage.getOrderList()
                setTimeout(() => {
                  wx.navigateBack({
                    delta: 1
                  });
                }, 500)
              },
              'fail': function(res) {
                $yjpToast.show({
                  text: `支付失败`
                })
              }
            })
          } else {
            $yjpToast.show({
              text: data.desc
            })
          }
        })
      }
    })
  },
  // 申请维修
  applyService() {
    App.WxService.navigateTo(App.Constants.Route.applyService, {
      orderInfo: this.data.orderDetailInfo
    })
  },
  // 去开票
  gotoInvoice(e) {
    let orderNo = e.currentTarget.dataset.orderNo
    let price = e.currentTarget.dataset.price
    App.WxService.navigateTo(App.Constants.Route.invoicing, {
      orderNo,
      price
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
      path: `/pages/product/productDetail?scene=inviter%3D${this.data.memberId}&page=productDetail&productNo=${this.data.orderDetailInfo.goods[0].goodsNo}`,
    }
  },
})