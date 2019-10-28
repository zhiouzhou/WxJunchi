// pages/user/orders/applyService.js
const App = getApp()
const api = require(`../../../utils/NetWorkUtil.js`)
import {
  $yjpToast
} from '../../../components/yjp.js'
const util = require('../../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    date: ``,
    time: ``,
    editMobileStatus: false,
    editNicknameStatus: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let userInfo = wx.getStorageSync(`userInfo`)
    let access_token = wx.getStorageSync(`access_token`)
    let orderInfo = JSON.parse(options.orderInfo)
    let startTime = util.formatTime(new Date());
    this.setData({
      userInfo,
      access_token,
      orderInfo,
      startTime
    })
    this.getDriveLisenceget();
  },

  getCenterLocation() {
    App.WxService.navigateTo(App.Constants.Route.address)
  },
  editMobile() {
    this.setData({
      editMobileStatus: !this.data.editMobileStatus
    })
  },
  editNickname() {
    this.setData({
      editNicknameStatus: !this.data.editNicknameStatus
    })
  },
  // 绑定修改手机号
  onMobile(e) {
    this.setData({
      "userInfo.mobile": e.detail.value
    })
  },
  onNickname(e) {
    this.setData({
      "userInfo.nickname": e.detail.value
    })
  },
  // 选择日期
  bindDateChange(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value
    })
    this.getTime()
  },
  // 查询行驶证
  getDriveLisenceget() {
    let {
      access_token,
      orderInfo
    } = this.data
    api._get(`api/v1/junchi/customer/task/getDriveLisence`, {
      access_token,
      taskId: orderInfo.installationTaskNo
    }).then(data => {
      console.log(data)
      if (data.code == 0) {
        this.setData({
          driverLicense: data.data
        })
      }
    })
  },
  // 获取安装可用时间
  getTime() {
    let access_token = this.data.access_token
    let stationId = this.data.addressInfo.stationId
    // let id = this.data.addressInfo.id
    // let bookDay = this.data.date
    api._get(`api/v1/junchi/customer/station/getStationOpenTime`, {
      access_token,
      statonId: stationId
    }).then(data => {
      console.log(data)
      if (data.code == 0) {
        this.setData({
          startTime: data.data.startTime,
          endTime: data.data.endTime
        })
      }

    })
  },
  // 获取预约可用时间
  bindTimeChange(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      time: e.detail.value
    })
  },
  check_result() {
    let {
      date,
      time,
      addressInfo
    } = this.data
    if (!addressInfo) {
      return {
        success: false,
        desc: `请选择门店`
      }
    } else if (!date) {
      return {
        success: false,
        desc: `请选择维修日期`
      }
    } else if (!time) {
      return {
        success: false,
        desc: `请选择维修时间`
      }
    } else {
      return {
        success: true,
        desc: ``
      }
    }
  },
  // 扫描获取门店信息
  sortSelect() {
    let that = this

    wx.scanCode({
      success(res) {
        console.log(res)
        let resultStr = res.result
        console.log(resultStr.split('#'))
        let resultArr = resultStr.split('#')
        if (resultArr[0] != 'jl.jcstauto.com') {
          $yjpToast.show({
            text: `二维码格式不正确`
          })
          return
        }
        // console.log(JSON.parse(resultArr[2]))
        let addressStr = encodeURIComponent(resultArr[2])
        addressStr = decodeURIComponent(addressStr)
        console.log(addressStr)
        let addressInfo = JSON.parse(addressStr)
        console.log(addressInfo)
        that.setData({
          addressInfo: addressInfo
        })
      }
    })
  },
  ensure() {
    let {
      access_token,
      date,
      time,
      userInfo,
      orderInfo,
      addressInfo,
      driverLicense,

    } = this.data
    let that = this
    let url = `api/v1/jc/mall/order/maintenance/apply?access_token=${access_token}`
    let result = this.check_result()
    if (!result.success) {
      return $yjpToast.show({
        text: result.desc
      })
    }
    let params = {
      installTask: orderInfo.installationTaskNo,
      stationId: addressInfo.stationId || '',
      username: userInfo.nickname,
      userPhone: userInfo.mobile,
      portraitUrl: userInfo.headPic,
      orderNo: orderInfo.orderNo,
      goodModel: orderInfo.goods[0].goodsModel,
      goodName: orderInfo.goods[0].goodsName,
      bookTime: date + ' ' + time + ':00',
      driverLicense: driverLicense
    }
    api._post(url, params).then(data => {
      // console.log(data)
      if (data.code == 0) {
        $yjpToast.show({
          text: data.desc
        })
        setTimeout(() => {
          App.WxService.navigateBack()
        }, 500)
      } else {
        $yjpToast.show({
          text: data.desc
        })
      }
    }).catch(e => {
      $yjpToast.show({
        text: `申请失败，请稍后再试`
      })
    })
  },
})