//app.js
import Constants from './utils/Constants.js'
import WxService from './assets/plugins/wx-service/WxService'
// import HttpService from './utils/NetWorkUtil.js'
import versionConfig from './version.config.js'
import {
  $yjpToast
} from './components/yjp.js'

App({
  onLaunch: function(options) {
   wx.showShareMenu()
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        this.globalData.wxMiniCode = res.code
      }
    })
    wx.getSystemInfo({
      success: res => { //改为箭头函数  不会出现this的指向问题
        console.log(this)
        this.globalData.systemInfo = res
      },
    })
    // // 获取用户信息
    // wx.getSetting({
    //   success: res => {
    //     if (res.authSetting['scope.userInfo']) {
    //       // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
    //       wx.getUserInfo({
    //         success: res => {
    //           // 可以将 res 发送给后台解码出 unionId
    //           this.globalData.userInfo = res.userInfo
    //         }
    //       })
    //     }
    //   }
    // })
  },
  getToken() {
    return wx.getStorageSync(`access_token`)
  },
  onLoad(options) {
    console.log(options)
  },
  //多张图片上传
  uploadimg: function(data) {
    var that = this,
      i = data.i ? data.i : 0, //当前上传的哪张图片
      success = data.success ? data.success : 0, //上传成功的个数
      fail = data.fail ? data.fail : 0; //上传失败的个数
    wx.uploadFile({
      url: data.url,
      filePath: data.path[i],
      name: 'file', //这里根据自己的实际情况改
      formData: data.formData, //这里是上传图片时一起上传的数据
      success: (resp) => {
        if (resp.statusCode == 200) {
          // $yjpToast.show({text:`上传成功`})
          wx.showToast({
            title: '上传成功',
            icon: 'none',
            duration: 2000
          })
          success++; //图片上传成功，图片上传成功的变量+1
        }
        console.log(resp)
        console.log(i);
        //这里可能有BUG，失败也会执行这里,所以这里应该是后台返回过来的状态码为成功时，这里的success才+1
      },
      fail: (res) => {
        fail++; //图片上传失败，图片上传失败的变量+1
        console.log('fail:' + i + "fail:" + fail);
        wx.showToast({
          title: '上传失败',
          icon: 'none',
          duration: 2000
        })
      },
      complete: () => {
        console.log(i);
        i++; //这个图片执行完上传后，开始上传下一张
        if (i == data.path.length) { //当图片传完时，停止调用          
          console.log('执行完毕');
          console.log('成功：' + success + " 失败：" + fail);
        } else { //若图片还没有传完，则继续调用函数
          console.log(i);
          data.i = i;
          data.success = success;
          data.fail = fail;
          that.uploadimg(data);
        }

      }
    });
  },
  // HttpService: new HttpService,
  WxService: new WxService,
  Constants: Constants,
  // HttpService: new HttpService,
  versionConfig: versionConfig,
  globalData: {
    wxMiniCode: null,
    systemInfo: {},
    inviter: ``,
    userInfo:{},
  }
})