// pages/user/orders/storeInfo.js
const App = getApp()
const api = require('../../../utils/NetWorkUtil')
import {
  $yjpToast
} from '../../../components/yjp.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  onReady: function(e) {
    // 使用 wx.createMapContext 获取 map 上下文
    this.mapCtx = wx.createMapContext('myMap');
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // this.setData({
    //   storeInfo: JSON.parse(options.storeInfo)
    // })
    let access_token = wx.getStorageSync(`access_token`)
    let storeInfo = JSON.parse(options.storeInfo)
    let markers = []
    let that = this
    api._get(`api/v1/junchi/customer/station/getStation`, {
      access_token,
      stationId: storeInfo.stationId
    }).then(data => {
      if (data.code == 0) {
        this.setData({
          storeInfo: data.data,
          bookTime: storeInfo.bookTime
        })
        markers = markers.concat({
          iconPath: `/assets/image/xaunzhong_address.png`,
          id: storeInfo.id,
          callount: {
            content: storeInfo.stationName,
            fontSize: '32',
            padding: true,
            color: '#333',
            display: 'ALWAYS',
            textAlign: 'center',
            borderRadius: 15,
          },
          latitude: data.data.stationLat,
          longitude: data.data.stationLon,
          width: 60,
          height: 60,
        })
        that.setData({
          markers: markers,
          latitude: data.data.stationLat,
          longitude: data.data.stationLon,
        })
      }
    })


  },
  onShow() {

  },
  markertap(e) {
    wx.openLocation({
      latitude: this.data.latitude,
      longitude: this.data.longitude,
      success: function(res) {
        console.log(res);
      },
      fail: function(res) {
        console.log(res);
      }
    })
  },

})