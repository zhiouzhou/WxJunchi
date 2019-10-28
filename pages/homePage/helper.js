// pages/homePage/helper.js
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
    imgUrls: [],
    indicatorDots: false,
    autoplay: false,
    interval: 5000,
    duration: 500,
    circular: true,
    centerItem: 0,
    memberId: ``,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function(options) {
    let access_token = wx.getStorageSync(`access_token`)
    let userInfo = wx.getStorageSync(`userInfo`)
    console.log(userInfo)
    this.setData({
      access_token: access_token,
    })
    this.getUserInfo()
    this.getHelperList()
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
        // userInfo: data.data,
        memberId: data.data.memberId,
        wxaCode: data.data.wxaCode
      })
    })
  },
  getHelperList() {
    api._get(`api/v1/junchi/operations/promotion/getShowImages`, {
      page: 1,
      size: 0,
      access_token: this.data.access_token
    }).then(data => {
      console.log(data)
      this.setData({
        imgUrls: data.data
      })
    })
  },
  changeFun(e) {
    this.setData({
      centerItem: e.detail.current
    })
  },
  saveToPhone() {
    let centerItem = this.data.centerItem
    let imageId = ``
    let that = this
    let info = this.data.imgUrls.find((item, index) => {
      console.log(index)
      return index == centerItem
    })
    console.log(info)
    imageId = info.imageId
    api._get(`api/v1/junchi/operations/promotion/getWaterMarkImage`, {
      access_token: this.data.access_token,
      imageId
    }).then(data => {
      console.log(data)
      if (data.code == 0) {
        //获取相册授权
        let imgSrc = data.data.imageUrl
        console.log(imgSrc)
        wx.showLoading({
          title: '保存中...'
        })
        wx.downloadFile({
          url: imgSrc,
          success: function(res) {
            console.log(res);
            //图片保存到本地
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: function(data) {
                console.log(data)
                wx.hideLoading()
                wx.showToast({
                  title: '保存成功',
                  icon: 'success',
                  duration: 2000
                })
              },
              fail: function(err) {
                console.log(err);
                // $yjpToast.show({
                //   text: `保存失败`
                // })
                if (err.errMsg === "saveImageToPhotosAlbum:fail auth deny" || err.errMsg === "saveImageToPhotosAlbum:fail:auth denied") {
                  console.log("当初用户拒绝，再次发起授权")
                  wx.showModal({
                    title: '提示',
                    content: '需要您授权保存相册',
                    showCancel: false,
                    success: modalSuccess => {
                      wx.openSetting({
                        success(settingdata) {
                          console.log("settingdata", settingdata)
                          if (settingdata.authSetting['scope.writePhotosAlbum']) {
                            wx.showModal({
                              title: '提示',
                              content: '获取权限成功,再次点击图片即可保存',
                              showCancel: false,
                            })
                          } else {
                            wx.showModal({
                              title: '提示',
                              content: '获取权限失败，将无法保存到相册哦~',
                              showCancel: false,
                            })
                          }
                        },
                        fail(failData) {
                          console.log("failData", failData)
                        },
                        complete(finishData) {
                          console.log("finishData", finishData)
                        }
                      })
                    }
                  })
                }
              },
              complete(res) {
                console.log(res);
                wx.hideLoading()
              }
            })
          }
        })
      }
    })

  },


})