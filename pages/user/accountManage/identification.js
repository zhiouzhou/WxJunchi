// pages/user/accountManage/identification.js
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
    buttonStatus: false,
    frontStatus:false,
    backStatus:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let access_token = wx.getStorageSync(`access_token`)
    let userInfo = wx.getStorageSync(`userInfo`)
    this.setData({
      access_token,
      userInfo
    })
  },

  shotFront(e) {
    let that = this
    let shotType = e.currentTarget.dataset.shotType
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        console.log(res)
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePath = res.tempFilePaths[0]
        const imageUrl = tempFilePath.split('//')[1]
        that.setData({
          tempFilePath
        })
        api._get('api/v1/tagua/qiniu/token', {
          fileName: tempFilePath,
          access_token: that.data.access_token
        }).then(data => {
          that.setData({
            token: data.data.token,
            key: data.data.key

          })
          that.upLoadQiuniu(shotType)
        })
      },
      fail(res) {}
    })
  },

  // 上传头像到七牛
  upLoadQiuniu(shotType) {

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
        key: key
      },
      success: function(res) {
        console.log(res)
        let urlInfo = JSON.parse(res.data)
        let idCardUrl = urlInfo.payload.url
        if (shotType == 'front') {
          that.setData({
            idCardUrl
          })
          that.upLoadIdCard('A', idCardUrl)
        } else {
          that.setData({
            idCardBackUrl: idCardUrl
          })
          that.upLoadIdCard('B', idCardUrl)
        }

      }
    })
  },
  nameInput(e) {
    let name = e.detail.value
    this.setData({
      name: name
    })
    this.check_result()
  },
  idCardNoInput(e) {
    let idCardNo = e.detail.value
    this.setData({
      idCardNo: idCardNo
    })
    this.check_result()
  },
  check_result() {
    let {
      name,
      idCardNo
    } = this.data
    if (!name || !idCardNo) {
      this.setData({
        buttonStatus: false
      })
    } else if (idCardNo.length < 18) {
      this.setData({
        buttonStatus: false
      })
    } else {
      this.setData({
        buttonStatus: true
      })
    }
  },
  //上传设置身份证照片
  upLoadIdCard(type, url) {
    let pathurl = `/api/v1/user/idImg?access_token=${this.data.access_token}`
    let that = this
    api._post(pathurl, {
      type,
      url
    }).then(data => {
      console.log(data.data)
      if (data.code == 0) {
        if (type == "A") {
          that.setData({
            name: data.data.name,
            idCardNo: data.data.idCardNo,
            frontStatus:true,
          })
        }else {
          that.setData({
            backStatus: true,
          })
        }
        $yjpToast.show({
          text: `上传成功`
        })
      } else {
        if (type == "A") {
          that.setData({
            frontStatus: false,
          })
        } else {
          that.setData({
            backStatus: false,
          })
        }
        $yjpToast.show({
          text: data.desc
        })
       
      }

    }).catch(e => {
      $yjpToast.show({
        text: `上传失败`
      })
    })
  },
  //立即认证
  authButton() {
    if (!this.data.name || !this.data.idCardNo || !this.data.frontStatus || !this.data.backStatus || this.data.idCardNo.length!=18 ) {
      return
    }
    let url = `api/v1/user/realNameCheck?access_token=${this.data.access_token}`
    let {
      name,
      idCardNo,
      userInfo
    } = this.data
    api._post(url, {
      name,
      idCardNo
    }).then(data => {
      console.log(data)
      if (data.code == 0) {
        $yjpToast.show({
          text: data.desc
        })
        userInfo.name = name
        userInfo.idCardNo = idCardNo
        userInfo.idCardStatus = 1
        wx.setStorageSync(`userInfo`, userInfo)
        wx.navigateBack({
          delta: 1
        });
      } else {
        $yjpToast.show({
          text: data.desc
        })
      }
    })
  },
})