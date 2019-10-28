// pages/user/receiveAddress/addReceiveAddress.js
import {
  $yjpToast
} from '../../../components/yjp.js'
const App = getApp()
const api = require('../../../utils/NetWorkUtil.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    address: {
      region: [],
      preferred: false
    },
    memberId: ``, //会员号
    access_token: ``, //登录token
    buttonEnable: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let pageType = options.pageType
    let memberId = wx.getStorageSync(`userInfo`).memberId
    let access_token = wx.getStorageSync(`access_token`)
    this.setData({
      memberId,
      access_token,
      pageType
    })
    if (options.address) {
      let address = JSON.parse(options.address) || {}
      console.log(options)
      let regionString = address.province + ',' + address.city + ',' + address.district
      address.region = regionString.split(',')
      console.log(regionString)
      this.setData({
        address: address
      })
      console.log(this.data.address)
    }
    let title = pageType == `add` ? '新增常用收貨地址' : '编辑收货地址'
    wx.setNavigationBarTitle({
      title
    })
    console.log(options)
  },
  //收货人姓名
  userName(e) {
    let address = this.data.address;
    let contact = e.detail.value;
    address.receiverName = contact;
    this.setData({
      address
    })
    this.check()
  },
  //手机号
  userPhone(e) {
    let address = this.data.address;
    let mobileNo = e.detail.value;
    address.receiverMobile = mobileNo;
    this.setData({
      address
    })
    this.check()
  },
  // 详细地址
  detailAddress(e) {
    let address = this.data.address;
    let detailAddress = e.detail.value;
    address.detailedAddress = detailAddress;
    this.setData({
      address
    })
    this.check()
  },
  // 选择省市区
  bindRegionChange(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      "address.region": e.detail.value
    })
    this.check()
  },
  // 验证保存按钮是否可以点击保存
  check() {
    let {
      receiverName,
      receiverMobile,
      region,
      detailedAddress,
    } = this.data.address
    if (!receiverName || !receiverMobile || !region || !detailedAddress) {
      this.setData({
        buttonEnable: false
      })
      return {
        success: false,
        desc: ``
      }
    } else if (!(/^1[34578]\d{9}$/.test(receiverMobile))) {
      return {
        success: false,
        desc: `请输入正确的手机号`
      }
    } else {
      this.setData({
        buttonEnable: true
      })
      return {
        success: true,
        desc: ``
      }
    }
  },
  //绑定设为默认地址
  defaultSelect(){
    this.setData({
      'address.preferred':!this.data.address.preferred
    })
  },
  hold() {
    let checkResult = this.check();
    console.log(this)
    if (!checkResult.success) {
      $yjpToast.show({
        text: checkResult.desc
      })
      return
    }
    let {
      memberId,
      access_token,
      address,
      pageType
    } = this.data
    let {
      receiverName,
      receiverMobile,
      detailedAddress,
      id,
      preferred
    } = this.data.address
    let province = address.region[0],
      city = address.region[1],
      district = address.region[2]
    let url = `api/v1/user/${memberId}/deliveryAddress?access_token=${access_token}`
    let editUrl = `api/v1/user/${memberId}/deliveryAddress/${id}?access_token=${access_token}`
    if (pageType == 'add') {
      api._post(url, {
        receiverName,
        receiverMobile,
        province,
        city,
        district,
        detailedAddress,
        preferred
      }).then(data => {
        if (data.code == 0) {
          $yjpToast.show({
            text: `新增成功`
          })
          setTimeout(() => {
            App.WxService.navigateBack()
          }, 2000)
        } else {
          $yjpToast.show({
            text: `新增失败`
          })
        }
        console.log(data)
      })
    } else {
      api._put(editUrl, {
        receiverName,
        receiverMobile,
        province,
        city,
        district,
        preferred,
        detailedAddress
      }).then(data => {
        if (data.code == 0) {
          $yjpToast.show({
            text: `修改成功`
          })
          setTimeout(() => {
            App.WxService.navigateBack()
          }, 2000)
        } else {
          $yjpToast.show({
            text: `修改失败`
          })
        }
      })
    }
  },
})