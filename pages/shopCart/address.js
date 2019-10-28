// pages/shopCart/address.js
const App = getApp()
const api = require('../../utils/NetWorkUtil.js')
const util = require('../../utils/util.js')
// let markers = []
let pointList = []

import {
  $yjpToast
} from '../../components/yjp.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    longitude: ``,
    latitude: ``,
    current: 0,
    selectIndex: 0,
    isEmpty: false,
    buttonClicked: false,
    searchText: ``,
  },
  onReady: function(e) {
    // 使用 wx.createMapContext 获取 map 上下文
    this.mapCtx = wx.createMapContext('map');
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function(options) {
    let access_token = wx.getStorageSync(`access_token`)
    this.setData({
      access_token
    })

    console.log(this.mapCtx)
    this.getLonAndLan()
  },
  getLonAndLan() {
    let that = this
    this.mapCtx = wx.createMapContext('map');
    wx.getLocation({
      success: function(res) {
        console.log(res)
        let latitude = res.latitude //纬度
        let longitude = res.longitude //经度
        that.setData({
          latitude,
          longitude
        })
        that.mapCtx.getRegion({
          success: function(res) {
            console.log(res)
            let distance = that.distance(res.northeast.latitude, res.northeast.longitude, res.southwest.latitude, res.southwest.longitude)
            console.log(distance)
            that.setData({
              distance: distance
            })

            that.getMarkers(latitude, longitude, true)
          },
          fail: function(res) {
            console.log(res)
          }
        })
      },
      fail: function(res) {
        console.log(res, `授权失败`)
        wx.getSetting({
          //获取用户的当前设置，返回值中只会出现小程序已经向用户请求过的权限
          success: function(res) {
            //成功调用授权窗口
            var statu = res.authSetting;
            if (!statu["scope.userLocation"]) {
              //如果设置中没有位置权限
              wx.showModal({
                //弹窗提示
                title: "是否授权当前位置",
                content: "需要获取您的地理位置，请确认授权，否则地图功能将无法使用",
                success: function(tip) {
                  if (tip.confirm) {
                    wx.openSetting({
                      //点击确定则调其用户设置
                      success: function(data) {
                        if (data.authSetting["scope.userLocation"] === true) {
                          //如果设置成功
                          wx.showToast({
                            //弹窗提示
                            title: "授权成功",
                            icon: "success",
                            duration: 1000
                          });
                          wx.getLocation({
                            //通过getLocation方法获取数据
                            type: "wgs84",
                            success(res) {
                              //成功的执行方法
                              console.log(res)
                              let latitude = res.latitude //纬度
                              let longitude = res.longitude //经度
                              that.setData({
                                latitude,
                                longitude
                              })
                              that.mapCtx.getRegion({
                                success: function(res) {
                                  console.log(res)
                                  let distance = that.distance(res.northeast.latitude, res.northeast.longitude, res.southwest.latitude, res.southwest.longitude)
                                  console.log(distance)
                                  that.setData({
                                    distance: distance
                                  })

                                  that.getMarkers(latitude, longitude, true)
                                }
                              })
                            }
                          });
                        }
                      }
                    });
                  } else {
                    //点击取消按钮，则刷新当前页面
                    // wx.redirectTo({
                    //   //销毁当前页面，并跳转到当前页面
                    //   url: "productInstall" //此处按照自己的需求更改
                    // });
                    App.WxService.redirectTo(App.Constants.Route.productInstall)
                  }
                }
              });
            }
          },
          fail: function(res) {
            wx.showToast({
              title: "调用授权窗口失败",
              icon: "success",
              duration: 1000
            });
          }
        });
      }
    })
  },
  getMarkers(latitude, longitude, isFirstEntry = false) {
    let selectIndex = this.data.selectIndex
    let access_token = this.data.access_token
    let distance = this.data.distance
    console.log(distance)
    // let { selectIndex, access_token,}  =this.data
    let markers = []
    let that = this
    api._get(`api/v1/junchi/customer/station/getStationsNearby`, {
      access_token,
      lat: latitude,
      lon: longitude,
      distance: distance / 2 * 1000
    }).then(data => {
      console.log(data.data)
      if (!data.data || !data.data.length) {
        that.setData({
          isEmpty: true,
          listData: [],
          addressInfo: {}
        })
      } else {
        that.setData({
          listData: data.data,
          addressInfo: data.data[0],
          isEmpty: false,
        })
      }
      let listData = data.data
      for (var i = 0; i < listData.length; i++) {
        markers = markers.concat({
          iconPath: `/assets/image/address_weixuan.png`,
          id: listData[i].id,
          callout: {
            content: listData[i].stationName,
            fontSize: '12',
            padding: 6,
            color: '#333',
            display: 'ALWAYS',
            textAlign: 'center',
            borderRadius: 15,
          },
          latitude: listData[i].stationLat,
          longitude: listData[i].stationLon,
          width: 60,
          height: 60,
        });

      }
      markers[selectIndex].iconPath = `/assets/image/xaunzhong_address.png`

      console.log(markers)
      if (isFirstEntry) {
        that.setData({
          markers: markers,
          latitude: listData[0].stationLat,
          longitude: listData[0].stationLon
        })
      } else {
        that.setData({
          markers: markers,
          addressInfo: data.data[selectIndex]
        })
      }

    })
  },
  markertap(e) {
    var that = this;
    console.log(e)
    let {
      markers,
      listData,
      selectIndex
    } = this.data
    let addressInfo = {}
    for (var i = 0; i < markers.length; i++) {
      console.log(markers[i])
      if (markers[i].id == e.markerId) {
        markers[i].iconPath = '/assets/image/xaunzhong_address.png'
      } else {
        markers[i].iconPath = '/assets/image/address_weixuan.png'
      }
    }
    let markersIndex = markers.findIndex((item, index) => {
      return item.id == e.markerId
    })
    console.log(markersIndex)
    //查找选中的地址
    addressInfo = listData.find(item => {
      return item.id == e.markerId
    })
    this.setData({
      markerId: e.markerId,
      selectId: e.markerId,
      selectIndex: markersIndex,
      markers,
      addressInfo: addressInfo
    })
    console.log(addressInfo)
  },
  selectAddress(e) {
    let index = e.currentTarget.dataset.index;
    console.log(index)
    let id = e.currentTarget.dataset.id
    this.setData({
      selectId: id,
      selectIndex: index
    })
    let {
      markers,
      listData,
      selectIndex
    } = this.data
    let addressInfo = {}
    markers.forEach((item, index) => {
      // console.log(index)
      if (index == selectIndex) {
        markers[index].iconPath = '/assets/image/xaunzhong_address.png'
      } else {
        markers[index].iconPath = '/assets/image/address_weixuan.png'
      }
    });
    //查找选中的地址
    addressInfo = listData.find(item => {
      return item.id == id
    })
    this.setData({
      current: index,
      markers,
      addressInfo
    })
    console.log(addressInfo)
  },
  regionChange(e) {
    let that = this
    var etype = e.type;
    console.log(e)
    if (etype == "begin") {
      return
    } else {
      that.mapCtx.getRegion({
        success: function(res) {
          console.log(res)
          let distance = that.distance(res.northeast.latitude, res.northeast.longitude, res.southwest.latitude, res.southwest.longitude)
          console.log(distance)
          that.setData({
            distance: distance
          })
          that.mapCtx.getCenterLocation({
            success(res) {
              console.log(res)
              var distance = that.getDistance(res.latitude, res.longitude, that.data.latitude, that.data.longitude)
              console.log(distance)
              if ((res.latitude == that.data.latitude && res.longitude == that.data.longitude) || distance < 1) {
                return;
              } else {
                that.setData({
                  latitude: res.latitude,
                  longitude: res.longitude
                })
                that.getMarkers(res.latitude, res.longitude)
              }
            }
          })
        }
      })
    }


  },
  distance(la1, lo1, la2, lo2) {
    var La1 = la1 * Math.PI / 180.0;
    var La2 = la2 * Math.PI / 180.0;
    var La3 = La1 - La2;
    var Lb3 = lo1 * Math.PI / 180.0 - lo2 * Math.PI / 180.0;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(La3 / 2), 2) + Math.cos(La1) * Math.cos(La2) * Math.pow(Math.sin(Lb3 / 2), 2)));
    s = s * 6378.137;
    s = Math.round(s * 10000) / 10000;
    s = s.toFixed(2);
    return s;
  },
  getDistance(lat1, lng1, lat2, lng2) {

    lat1 = lat1 || 0;

    lng1 = lng1 || 0;

    lat2 = lat2 || 0;

    lng2 = lng2 || 0;

    var rad1 = lat1 * Math.PI / 180.0;

    var rad2 = lat2 * Math.PI / 180.0;

    var a = rad1 - rad2;

    var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;

    var r = 6378137;

    return (r * 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(rad1) * Math.cos(rad2) * Math.pow(Math.sin(b / 2), 2)))).toFixed(0)

     
  },
  clickcontrol(e) {
    let mpCtx = wx.createMapContext("map");
    mpCtx.moveToLocation();
    this.getLonAndLan()

  },
  //确定选中的地址  返回上一页
  ensure() {
    util.buttonClicked(this);
    let addressInfo = this.data.addressInfo
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1]; //当前页面
    var prevPage = pages[pages.length - 2]; //上一个页面
    // 直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    prevPage.setData({
      addressInfo: addressInfo
    })
    wx.navigateBack({
      delta: 1
    });
  },
  searchValue(e) {
    console.log(e.detail.value)
    this.setData({
      searchText: e.detail.value
    })
  },
  searchStore(isFirstEntry = false) {
    let searchText = this.data.searchText
    let access_token = this.data.access_token
    let selectIndex = this.data.selectIndex
    let that = this
    let markers = []
    if (!searchText) {
      return
    }
    api._get(`api/v1/junchi/customer/station/searchStations?searchText=${searchText}`).then(data => {
      if (!data.data || !data.data.length) {
        that.setData({
          isEmpty: true,
          listData: [],
          addressInfo: {}
        })
      } else {
        that.setData({
          listData: data.data,
          addressInfo: data.data[0],
          isEmpty: false,
        })
      }
      let listData = data.data
      for (var i = 0; i < listData.length; i++) {
        markers = markers.concat({
          iconPath: `/assets/image/address_weixuan.png`,
          id: listData[i].id,
          callout: {
            content: listData[i].stationName,
            fontSize: '12',
            padding: 6,
            color: '#333',
            display: 'ALWAYS',
            textAlign: 'center',
            borderRadius: 15,
          },
          latitude: listData[i].stationLat,
          longitude: listData[i].stationLon,
          width: 60,
          height: 60,
        });
      }
      console.log(markers)
      console.log(markers[selectIndex])
      if (listData || listData.length != 0) {
        markers[selectIndex].iconPath = `/assets/image/xaunzhong_address.png` || ''
      }
     
      if (isFirstEntry) {
        that.setData({
          markers: markers,
          latitude: listData[0].stationLat,
          longitude: listData[0].stationLon
        })
      } else {
        that.setData({
          markers: markers,
          listData:data.data
        })
      }
    })
  },

})