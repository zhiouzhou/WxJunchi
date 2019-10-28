// pages/user/accountManage/editDataPage.js
import {
  $yjpToast
} from '../../../components/yjp.js'
const api = require('../../../utils/NetWorkUtil.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {

    pageType: ``,
    username: ``,
    oldMobile: ``,
    newMobile: ``,
    email: ``,
    buttonEnable: false,
    oldCode: ``, //旧手机验证码
    newCode: ``, //新手机验证码
    memberId: ``,
    access_token: ``,
    codeId: ``,
    emailCodeId: ``,
    emailCode: ``,
    password:``,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)

    this.setData({
      pageType: options.type,
      memberId: options.memberId,
      access_token: wx.getStorageSync(`access_token`)
    })
    console.log(this.data.pageType)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },
  //修改用户名
  editUsername(e) {
    console.log(e.detail.value)
    let username = e.detail.value
    this.setData({
      username
    })
    this.check_button()
  },

  /**
   * 修改手机号 获取旧手机和新手机的验证码
   */
  onNewMobile(e) { //新手机
    let moblie = e.detail.value
    this.setData({
      newMobile: moblie,
    })
    this.check_button()
  },
  onNewCode(e) { //新手机验证码
    let code = e.detail.value
    this.setData({
      newCode: code,
    })
    this.check_button()
  },
  //绑定输入密码事件
  onPassword(e){
    let password = e.detail.value
    this.setData({password})
    this.check_button()
  },
  //绑定输入邮箱验证码事件
  onCode(e) {
    this.setData({
      emailCode: e.detail.value
    })
  },
  //绑定获取手机验证码事件
  gainCode(e) {
    let {
      newMobile
    } = this.data
    if (!newMobile){
      return $yjpToast.show({
        text: `请输入手机号`
      })
    }
    api._get('api/v1/auth/code/SMS', {
      mobile: newMobile
    }).then(data => {
      console.log(data)
      this.setData({
        codeId: data.data.codeId
      })
    })
  },
  //绑定获取邮箱验证码事件
  getEmailCode() {
    let email = this.data.email
    if (!email) {
      return $yjpToast.show({
        text: `请输入您的邮箱`
      })
    }
    api._get(`api/v1/auth/code/EMAIL`, {
      email
    }).then(data => {
      if (data.code == 0) {
        this.setData({
          emailCodeId: data.data.codeId
        })
        $yjpToast.show({
          text: data.desc
        })
      } else {
        $yjpToast.show({
          text: data.desc
        })
      }
    })
  },

  /*
    修改邮箱
  */
  onEmail(e) {
    let email = e.detail.value
    this.setData({
      email
    })
    this.check_button()
  },

  // 确定修改按钮
  ensureEdit() {
    let checkResult = this.check_button();
    let access_token = this.data.access_token
    console.log(checkResult)
    if (!checkResult.success) {
      return $yjpToast.show({
        text: checkResult.desc
      })
    }
    let {
      pageType,
      username,
      newMobile,
      newCode,
      email,
      memberId,
      codeId,
      emailCode,
      emailCodeId,
      password
    } = this.data
    let userInfo = wx.getStorageSync(`userInfo`)

    var pages = getCurrentPages();
    var currentPage = pages[pages.length - 1]; //当前页面
    var prevPage = pages[pages.length - 2]; //上一页
    //直接调用上一页的setData（）方法，把数据存到上一个页面
    if (pageType == "username") {
      let url = `api/v1/user/${memberId}?access_token=${access_token}`
      console.log(url)
      api._put(url, {
        nickname: username
      }, {
        'content-type': 'application/json'
      }).then(data => {
        console.log(data)
        $yjpToast.show({
          text: data.desc
        })
        prevPage.setData({
          'userInfo.nickname': data.data.nickname
        })
        userInfo.nickname = data.data.nickname
        wx.setStorageSync(`userInfo`, userInfo)
      })
    } else if (pageType == 'mobile') {
      let url = `api/v1/user/${memberId}/mobile`
      api._put(url, {
        access_token,
        mobile: newMobile,
        codeId,
        smsCode: newCode,
        password
      }, { 'content-type': 'application/x-www-form-urlencoded'}).then(data => {
        if(data.code==0){
          $yjpToast.show({text:data.desc})
          prevPage.setData({
            'userInfo.mobile': newMobile,
          })
          userInfo.mibile = newMobile
          wx.setStorageSync(`userInfo`, userInfo)
        }else {
          $yjpToast.show({ text: data.desc })
        }
        console.log(data)
        
      })

    } else {
      let url = `api/v1/auth/binding/email?email=${email}&access_token=${access_token}&codeId=${emailCodeId}&emailCode=${emailCode}`
      api._post(url, {}).then(data => {
        if (data.code == 0) {
          $yjpToast.show({
            text: data.desc
          })
          prevPage.setData({
            "userInfo.email":email
          })
          userInfo.email = email
          wx.setStorageSync(`userInfo`, userInfo)
        }else {
          $yjpToast.show({
            text: data.desc
          })
        }
      })

    }
    setTimeout(() => {
      wx.navigateBack({
        delta: 1
      });
    })
  },

  // 验证button按钮颜色
  check_button() {
    let {
      username,
      oldMobile,
      oldCode,
      newMobile,
      newCode,
      email,
      pageType,
      password
    } = this.data;
    if (pageType == 'username') {
      if (!username) {
        this.setData({
          buttonEnable: false
        })
        return {
          success: false,
          desc: ``
        }
      } else {
        this.setData({
          buttonEnable: true,
        })
        return {
          success: true,
          desc: ``
        }
      }
    } else if (pageType == 'mobile') {
      if (!newMobile || !newCode || !password) {
        this.setData({
          buttonEnable: false
        })
        return {
          success: false,
          desc: `请输入完整信息`
        }
      } else if (!(/^1[34578]\d{9}$/.test(newMobile))) {
        return {
          success: false,
          desc: `请输入正确的手机号`
        }
      } else if (newCode.length != 6) {
        return {
          success: false,
          desc: ``
        }
      } else {
        this.setData({
          buttonEnable: true,
        })
        return {
          success: true,
          desc: ``
        }
      }
    } else {
      if (!email) {
        this.setData({
          buttonEnable: false
        })
        return {
          success: false,
          desc: ``
        }
      } else if (!(/^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/.test(email))) {
        return {
          success: false,
          desc: `请输入正确的邮箱地址`
        }
      } else {
        this.setData({
          buttonEnable: true,
        })
        return {
          success: true,
          desc: ``
        }
      }
    }
  },


})