// pages/user/accountManage/editData.js
const App = getApp()
const api = require('../../../utils/NetWorkUtil.js')
import {$yjpToast} from '../../../components/yjp.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
    fileName:``,
    access_token:``,
    tempFilePath:``,
    token:``,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let userInfo = wx.getStorageSync(`userInfo`)
    let access_token = wx.getStorageSync(`access_token`)
    let memberId = wx.getStorageSync(`userInfo`).memberId
    this.setData({
      userInfo, access_token,
      memberId
    })
    console.log(userInfo)

  },

  
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  gotoEditPage(e){
    let tag = e.currentTarget.dataset.tag
    let memberId = e.currentTarget.dataset.memberId
    App.WxService.navigateTo(App.Constants.Route.editDataPage,{type:tag,memberId})
  },

  // 编辑头像
  chooseImage(){
    let that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePath = res.tempFilePaths[0]
        const imageUrl = tempFilePath.split('//')[1]
        that.setData({
          tempFilePath
        })
        api._get('api/v1/tagua/qiniu/headPicImgToken', { access_token: that.data.access_token}).then(data=>{
            that.setData({
              token:data.data.token,
              key:data.data.key

            })
            that.upLoadQiuniu()
        })
      },
      fail(res){}
    })
  },
  //修改头像
  editHeadePic(key){
    let {access_token,memberId,userInfo} = this.data
    let that = this
    let url = `api/v1/user/${memberId}?access_token=${access_token}`
    api._put(url, { headPic:key}).then(data=>{
      if(data.code==0){
        that.setData({ "userInfo.headPic": data.data.headPic })
        userInfo.headPic = data.data.headPic
        wx.setStorageSync(`userInfo`,userInfo)
        $yjpToast.show({ text: data.desc})
      }else {
        $yjpToast.show({ text: data.desc})
      }
    })
  },
  // 上传头像到七牛
  upLoadQiuniu(){
    let { token, tempFilePath,key} = this.data
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
        key:key
      },
      success:function(res){
        console.log(res)
        that.editHeadePic(key)
      }
    })

  },
})