// pages/shopCart/placeOrder.js
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
    stationName: ``,
    productList: [],
    count: ``, //数量  用于从商品详情跳到订单页面提交订单时使用
    pageType: ``, //detail 指从商品详情过来  shopCart指从购物车过来
    selectIdArr: [],
    totalPrice: ``, //总价
    access_token: ``,
    showSkeleton: true,
    userPhone: ``,
    addressInfo: {},
    garageInfo: {}

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(JSON.parse(options.productList))
    const that = this;
    setTimeout(() => {
      that.setData({
        showSkeleton: false
      })
    }, 500)
    let productList = JSON.parse(options.productList)
    console.log(productList)
    let count = options.count ? options.count : ''
    let pageType = options.pageType
    // console.log(JSON.parse(options.selectIdArr))
    let selectIdArr = options.selectIdArr ? JSON.parse(options.selectIdArr) : []
    let totalPrice = parseInt(options.totalPrice)
    let userPhone = this.data.addressInfo.receiverMobile ? this.data.addressInfo.receiverMobile : ``
    this.setData({
      productList,
      count,
      pageType,
      selectIdArr,
      totalPrice,
      // access_token,
      userPhone
    })

  },
  onShow() {
    let access_token = wx.getStorageSync(`access_token`)
    this.setData({
      access_token
    })
  },
  onReady: function(e) {
    // 使用 wx.createMapContext 获取 map 上下文
    this.mapCtx = wx.createMapContext('myMap');
  },
  getCenterLocation() {
    App.WxService.navigateTo(App.Constants.Route.address)
  },
  onMobile(e) {
    this.setData({
      userPhone: e.detail.value
    })
  },
  //提交订单
  submitOrder(e) {
    let formId = e.detail.formId
    let {
      selectIdArr,
      productList,
      count,
      pageType,
      access_token,
      userPhone,
      garageInfo,
      addressInfo
    } = this.data
    console.log(pageType)
    if (!garageInfo.url) {
      return $yjpToast.show({
        text: `请选择车辆`
      })
    }
    if (!addressInfo.province) {
      return $yjpToast.show({
        text: `请选择地址`
      })
    }
    if (!userPhone) {
      return $yjpToast.show({
        text: `请输入联系方式`
      })
    } else if (userPhone.length != 11) {
      return $yjpToast.show({
        text: `请输入正确的联系方式`
      })

    }
    let that = this
    if (pageType == 'detail') {
      let arr = [{
        count,
        no: productList[0].no
      }]
      let params = {
        formId,
        goodsList: arr,
        mobile: userPhone,
        carUrl: garageInfo.url,
        province: addressInfo.province,
        city: addressInfo.city,
        district: addressInfo.district,
        detailedAddress: addressInfo.detailedAddress,
        name: addressInfo.receiverName
      }

      let url = `api/v1/jc/mall/order/directly?access_token=${access_token}`
      api._post(url, params).then(data => {
        if (data.code == 0) {
          console.log(data) //成功调支付的接口

          that.payMent(data.data.orderNo)
        } else {
          $yjpToast.show({
            text: data.desc
          })
        }

      })
    } else {
      let url = `api/v1/jc/mall/order/fromcart?access_token=${access_token}`
      let params = {
        formId,
        cartItemIds: selectIdArr,
        mobile: userPhone,
        carUrl: garageInfo.url,
        province: addressInfo.province,
        city: addressInfo.city,
        district: addressInfo.district,
        detailedAddress: addressInfo.detailedAddress,
        name: addressInfo.receiverName
      }
      api._post(url, params).then(data => {
        if (data.code == 0) {
          console.log(data) //成功调支付的接口
          that.payMent(data.data.orderNo)
        } else {
          $yjpToast.show({
            text: `支付失败`
          })
        }

      })
    }
  },
  //选择车辆和地址
  gotoGarage(e) {
    let tag = e.currentTarget.dataset.tag
    console.log(tag)
    App.WxService.navigateTo(App.Constants.Route[tag], {
      pageType: `placeOrder`
    })
  },
  // 支付
  payMent(orderNo) {
    console.log(orderNo)
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
                App.WxService.navigateTo(App.Constants.Route.orderDetail, {
                  orderNo: dataList.outTradeNo,
                  pageType: 'placeOrder'
                })
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
})