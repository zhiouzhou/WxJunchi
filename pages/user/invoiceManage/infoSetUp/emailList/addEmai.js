// pages/user/invoiceManage/infoSetUp/emailList/addEmai.js
import {$yjpToast} from '../../../../../components/yjp.js'
const api = require('../../../../../utils/NetWorkUtil.js')
const App = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageType: ``,
    email: ``,
    buttonEnable: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let pageType = options.pageType
    let title = pageType == 0 ? '新增常用电子邮箱' : '编辑电子邮箱'
    wx.setNavigationBarTitle({
      title
    })
    this.setData({
      pageType
    })
  },
  onEmail(e){
    let email = e.detail.value
    this.setData({email})
    this.check()
  },
  ensure(){
    let {pageType,email} = this.data
    let checkResult = this.check()
    if(!checkResult.success){
      $yjpToast.show({text:checkResult.desc})
      return
    }
    if(pageType=='0'){
      //调用新增电子邮箱接口
    }else {
      //调用编辑邮箱接口
    }
  },
  // 验证邮箱
  check() {
    let {
      email,
      pageType
    } = this.data
    if (!email) {
      this.setData({
        buttonEnable: false
      })
      return {
        success: false,
        desc: ``
      }
    } else if (!(/^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/.test(email))){
      return {
        success: false,
        desc: `邮箱格式有误`
      }
    }else {
      this.setData({
        buttonEnable: true
      })
      return {
        success: false,
        desc: ``
      }
    }
  },


})