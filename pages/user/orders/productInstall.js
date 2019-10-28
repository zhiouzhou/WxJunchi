// pages/user/orders/productInstall.js
const App = getApp()
const api = require('../../../utils/NetWorkUtil')
import {
  $yjpToast
} from '../../../components/yjp.js'
var day3 = new Date();
day3.setTime(day3.getTime() + 24 * 60 * 60 * 1000);
var s3 = day3.getFullYear() + "-" + (day3.getMonth() + 1) + "-" + day3.getDate();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addressInfo: {}, //选择地址返回的门店信息
    access_token: ``,
    date: ``,
    timeArr: [],
    orderItem: {},
    garageInfo: {},
    startTime: s3
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let access_token = wx.getStorageSync(`access_token`);
    let orderItem = JSON.parse(options.orderItem)
    let userPhone = wx.getStorageSync(`userInfo`).mobile
    console.log(orderItem)
    this.setData({
      access_token,
      orderItem,
      userPhone
    })
    // console.log(new Date())
    // this.getTime()

  },
  getCenterLocation() {
    App.WxService.navigateTo(App.Constants.Route.address)
  },
  bindDateChange(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value
    })
    this.getTime()
  },
  onMobile(e) {
    this.setData({
      userPhone: e.detail.value
    })
  },


  // 获取预约可用时间
  getTime() {
    let access_token = this.data.access_token
    let stationId = this.data.addressInfo.stationId
    let id = this.data.addressInfo.id
    let bookDay = this.data.date
    api._get(`api/v1/junchi/customer/task/getAvailableTime`, {
      access_token,
      stationId,
      id,
      bookDay
    }).then(data => {
      console.log(data)
      if (data.code == 0) {
        let arr = []
        data.data.items.forEach(item=>{
          item.startTime=item.startTime.substring(0,5)
          arr.push(item)
        })
        this.setData({
          timeArr: arr
        })
      } else {
        $yjpToast.show({
          text: data.desc
        })
      }

    })
  },
  bindPickerChange(e) {
    this.setData({
      index: e.detail.value
    })
  },
  //选择车辆
  gotoGarage() {
    App.WxService.navigateTo(App.Constants.Route.myGarage, {
      pageType: `install`
    })
  },

  ensure() {
    let {
      addressInfo,
      date,
      index,
      orderItem,
      access_token,
      timeArr,
      garageInfo,
      userPhone
    } = this.data
    let url = `api/v1/junchi/customer/task/book?access_token=${access_token}`
    let userName = wx.getStorageSync(`userInfo`).nickname
    // let userPhone = wx.getStorageSync(`userInfo`).mobile
    let portraitUrl = wx.getStorageSync(`userInfo`).headPic
    let driverLicense = garageInfo.url
    if (!addressInfo.stationName || !date || !index || !driverLicense) {
      return $yjpToast.show({
        text: `请填写完整信息`
      })
    }
    let params = {
      userName,
      userPhone,
      portraitUrl,
      orderNo: orderItem.orderNo,
      bookTime: date + ' ' + timeArr[index].startTime+':00',
      stationId: addressInfo.stationId,
      goodModel: orderItem.goods[0].goodsModel,
      goodName: orderItem.goods[0].goodsName,
      driverLicense
    }
    api._post(url, params).then(data => {
      console.log(data)
      if (data.code == 0) {
        $yjpToast.show({
          text: "预约完成,请等待确认"
        })
        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          });
        })
      } else {
        $yjpToast.show({
          text: `预约失败，请稍后重试`
        })
      }
    })
  },


})