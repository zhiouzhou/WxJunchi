// pages/login/findPassword.js
const api = require('../../utils/NetWorkUtil.js')
const App = getApp()
import {
  $yjpToast
} from '../../components/yjp.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mobile: ``,
    newPass: ``,
    codeId: ``, //获取验证码得到的CodeID
    smsCode: ``, //验证码
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },
  //绑定手机号输入
  onMobile(e) {
    this.setData({
      mobile: e.detail.value
    })
  },
  //绑定验证码输入
  onCode(e) {
    this.setData({
      smsCode: e.detail.value
    })
  },
  //绑定密码输入
  onPassword(e) {
    this.setData({
      newPass: e.detail.value
    })
  },
  //绑定获取验证码事件
  getCode() {
    let mobile = this.data.mobile
    let that = this
    if (!mobile ) {
      return $yjpToast.show({text:`请输入手机号`})
    } else if (!(/^1[34578]\d{9}$/.test(mobile))){
      return $yjpToast.show({ text: `手机号格式不正确` })
    }
    api._get('api/v1/auth/code/SMS', {
      mobile
    }).then(data => {
      if (data.code == 0) {
        $yjpToast.show({
          text: `已发送验证码`
        })
        console.log(data)
        that.setData({
          codeId: data.data.codeId
        })
      } else {
        $yjpToast.show({
          text: data.desc
        })
      }

    })
  },
//绑定确定按钮
  ensure(){
    let {mobile,codeId,smsCode,newPass} = this.data
    let that = this
    if(!mobile||!smsCode||!newPass){
      return 
    }
    // let url = `api/v1/auth/account/resetLoginPass?newPass=${newPass}&codeId=${codeId}&mobile=${mobile}&smsCode=${smsCode}`
    api._post(`api/v1/auth/account/resetLoginPass`, { newPass, codeId, mobile, smsCode }, { 'content-type': 'application/x-www-form-urlencoded'}).then(data=>{
      if(data.code==0){
        $yjpToast.show({text:data.desc})
        setTimeout(()=>{
          App.WxService.navigateBack()
        })
      }else {
        $yjpToast.show({text:data.desc})
      }
    }).catch(e=>{
      $yjpToast.show({text:`重置密码失败`})
    })
  },

})