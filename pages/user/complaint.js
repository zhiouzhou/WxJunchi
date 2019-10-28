// pages/user/complaint.js
const App = getApp();
const api = require('../../utils/NetWorkUtil.js')
import {
  $yjpToast
} from '../../components/yjp.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    complaint: ``,
    account: ``,
    tempFilePaths: [],
    keyList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let access_token = wx.getStorageSync(`access_token`)
    this.setData({
      access_token
    })
    console.log(App)
    this.getPhone()
  },
  onCompalint(e) {
    let complaint = e.detail.value
    this.setData({
      complaint
    })
  },
  chooseImage() {
    let that = this
    let pics = this.data.tempFilePaths;
    wx.chooseImage({
      count: 2,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        let imgsrc = res.tempFilePaths;
        let imageUrl = '';
        for (let i = 0; i < res.tempFilePaths.length; i++) {
          imageUrl = res.tempFilePaths[i].split('//')[1]
        }
        // const imageUrl = tempFilePaths.split('//')[1]
        console.log(imageUrl)
        pics = pics.concat(imgsrc)
        that.setData({
          tempFilePaths: pics
        })
        let keyList = that.data.keyList
        api._get('api/v1/tagua/qiniu/token', {
          fileName: imageUrl,
          access_token: that.data.access_token
        }).then(data => {
          console.log(data)
          keyList.push(data.data.key)
          that.setData({
            token: data.data.token,
            keyList
          })
          that.upLoadQiuniu()
        })
      },
      fail(res) {}
    })
  },
  // 上传头像到七牛
  upLoadQiuniu() {
    let {
      token,
      tempFilePaths
    } = this.data
    let that = this
  $yjpToast.show({text:`正在上传~`})
    App.uploadimg({
      url: 'https://up.qiniup.com', //这里是你图片上传的接口
      path: tempFilePaths, //这里是选取的图片的地址数组
      formData: {
        token: token,
      }
    });
    // wx.uploadFile({
    //   url: 'https://up.qiniup.com',
    //   filePath: tempFilePaths,
    //   name: 'file',
    //   header: {
    //     "Content-Type": "multipart/form-data"
    //   },
    //   formData: {
    //     token: token,
    //   },
    //   success: function (res) {
    //     console.log(res)
    //     this.setData({ tempFilePaths})
    //     $yjpToast.show({text:`上传成功`})
    //   }
    // })
  },
  onMobile(e) {
    this.setData({
      account: e.detail.value
    })
  },
  submit() {
    wx.showLoading({
      title: '正在提交',
    })
    let {
      access_token,
      complaint,
      account,
      tempFilePaths,
      keyList
    } = this.data
    console.log(keyList)
    let url = `api/v1/junchi/operations/compsugg/addCS?access_token=${access_token}`
    if(!complaint||!account){
      return $yjpToast.show({text:`请填写您的建议和联系方式~`})
    }
    api._post(url, {
      csContent: complaint,
      picturePaths: keyList,
      phoneEmail: account
    }).then(data => {
      if (data.code == 0) {
        $yjpToast.show({
          text: data.desc
        })
        // App.WxService.switchTab(App.Constants.Route.user)
        setTimeout(()=>{
          App.WxService.navigateBack()
        },500)
        wx.hideLoading()
      }else {
        $yjpToast.show({
          text: data.desc
        })
      }

    }).catch(e => {
      wx.hideLoading()
      $yjpToast.show({
        text: `提交失败`
      })
    })
  },
  //获取客服电话
  getPhone(){
    api._get(`api/v1/junchi/operations/phone/getPhones`,{access_token:this.data.access_token,page:1,size:0}).then(data=>{
      if(data.code==0){
        this.setData({
          phoneNumber: data.data[0].contactWay
        })
      }
    })
  },
  // 绑定拨打电话按钮
  makePhoneCall() {
    wx.makePhoneCall({
      phoneNumber: this.data.phoneNumber
    })
  },

})