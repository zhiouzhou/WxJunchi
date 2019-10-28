// pages/user/myGarage/addGarage.js
const App = getApp()
import { $yjpToast } from '../../../components/yjp.js'
const api = require('../../../utils/NetWorkUtil.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imageUrl: ``,
    carName: ``,
    access_token:``,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let access_token = wx.getStorageSync(`access_token`)
    let pageType = options.pageType
    let garageItem = options.garageItem?JSON.parse(options.garageItem):{}
    console.log(garageItem)
    this.setData({ access_token, pageType,carId:garageItem.id,carName:garageItem.name})
  },
  onCarName(e) {
    this.setData({
      carName: e.detail.value
    })
  },
  //上传图片
  uploadImg() {
    let that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        const tempFilePath = res.tempFilePaths[0]
        const imageUrl = tempFilePath.split('//')[1]
        that.setData({
          tempFilePath
        })
        api._get('api/v1/tagua/qiniu/token', {
          fileName: imageUrl,
          access_token: that.data.access_token
        }).then(data => {
          that.setData({
            token: data.data.token,
            key: data.data.key

          })
          that.upLoadQiuniu()
        })
      },
    })
  },
  upLoadQiuniu() {
    wx.showLoading({
      title: '正在上传~',
    })
    let {
      token,
      tempFilePath,
      key
    } = this.data
    let that = this
    wx.uploadFile({
      url: 'https://up.qiniup.com',
      filePath: tempFilePath,
      name: 'file',
      header: {
        "Content-Type": "multipart/form-data"
      },
      formData: {
        token: token,
      },
      success: function(res) {
        console.log(res)
        $yjpToast.show({text:`上传成功`})
        let url = JSON.parse(res.data).payload.url
        that.setData({ imageUrl: url})
        wx.hideLoading()
      }
    })
  },
  submit(){
    let {access_token,carName,key,pageType,carId} = this.data
    let addUrl = `api/v1/user/car?access_token=${access_token}`
    let editUrl = `api/v1/user/car/${carId}?access_token=${access_token}`
    if(pageType=='add'){
      if(!carName||!key){
        $yjpToast.show({text:`请填写完整信息`})
        return
      }
      api._post(addUrl, { name: carName, url: key }).then(data => {
        if (data.code == 0) {
          $yjpToast.show({ text: data.desc })
          setTimeout(()=>{
            App.WxService.navigateBack()
          },500) 
        } else {
          $yjpToast.show({ text: data.desc })
        }
      })
    }else {
      if (!carName) {
        $yjpToast.show({ text: `请填写完整信息` })
        return
      }
      api._put(editUrl,{name:carName}).then(data=>{
        if(data.code==0){
          $yjpToast.show({text:data.desc})
          setTimeout(()=>{
            App.WxService.navigateBack()
          },500)
        }
      })
    }
   
  },

})